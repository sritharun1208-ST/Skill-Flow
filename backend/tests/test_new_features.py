"""Skill Flow iteration_2 - new-feature tests.
Covers:
  * Password reset (forgot + reset on throwaway account; demo unaffected)
  * Google auth endpoint (invalid session -> 401)
  * Resume parse (upload a small .txt resume -> real Claude JSON w/ skills)
  * AI interview streaming (Claude claude-sonnet-4-6)
"""
import os
import time
import uuid
import io
import pytest
import requests

BASE_URL = os.environ["REACT_APP_BACKEND_URL"].rstrip("/")
API = f"{BASE_URL}/api"

DEMO_EMAIL = "arjun@skillflow.com"
DEMO_PW = "skillflow123"


# ---------- fixtures ----------
@pytest.fixture(scope="module")
def throwaway():
    """Register a throwaway account we can safely destroy passwords on."""
    email = f"test_reset_{uuid.uuid4().hex[:8]}@example.com"
    pw = "originalpw123"
    r = requests.post(f"{API}/auth/register",
                      json={"name": "Reset Tester", "email": email, "password": pw}, timeout=15)
    assert r.status_code == 200, r.text
    return {"email": email, "password": pw, "token": r.json().get("token")}


@pytest.fixture(scope="module")
def demo_client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    r = s.post(f"{API}/auth/login", json={"email": DEMO_EMAIL, "password": DEMO_PW}, timeout=15)
    assert r.status_code == 200
    s.headers.update({"Authorization": f"Bearer {r.json()['token']}"})
    return s


# ---------- Password reset ----------
class TestPasswordReset:
    def test_forgot_password_returns_dev_token_for_existing_user(self, throwaway):
        r = requests.post(f"{API}/auth/forgot-password",
                          json={"email": throwaway["email"]}, timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert data.get("ok") is True
        # dev/demo mode returns a real token
        assert isinstance(data.get("token"), str) and len(data["token"]) > 10
        # persist for next tests
        throwaway["reset_token"] = data["token"]

    def test_forgot_password_unknown_email_no_token(self):
        r = requests.post(f"{API}/auth/forgot-password",
                          json={"email": f"nobody_{uuid.uuid4().hex[:6]}@x.com"}, timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert data.get("ok") is True
        # no token for unknown emails
        assert "token" not in data or not data.get("token")

    def test_reset_password_with_valid_token(self, throwaway):
        assert throwaway.get("reset_token"), "no reset token from previous test"
        new_pw = "newresetpw456"
        r = requests.post(f"{API}/auth/reset-password",
                          json={"token": throwaway["reset_token"], "password": new_pw},
                          timeout=15)
        assert r.status_code == 200, r.text
        # old password should now fail
        r2 = requests.post(f"{API}/auth/login",
                           json={"email": throwaway["email"], "password": throwaway["password"]},
                           timeout=15)
        assert r2.status_code == 401
        # new password should work
        r3 = requests.post(f"{API}/auth/login",
                           json={"email": throwaway["email"], "password": new_pw}, timeout=15)
        assert r3.status_code == 200
        throwaway["password"] = new_pw  # bookkeeping

    def test_reset_password_token_reuse_rejected(self, throwaway):
        # The now-used token should be rejected
        r = requests.post(f"{API}/auth/reset-password",
                          json={"token": throwaway["reset_token"], "password": "anotherpw789"},
                          timeout=15)
        assert r.status_code == 400

    def test_reset_password_invalid_token(self):
        r = requests.post(f"{API}/auth/reset-password",
                          json={"token": "totallybogus" + uuid.uuid4().hex, "password": "abcdef"},
                          timeout=15)
        assert r.status_code == 400

    def test_demo_login_still_works_after_reset_tests(self):
        """Regression guard: the shared demo account must NOT be broken by tests."""
        r = requests.post(f"{API}/auth/login",
                          json={"email": DEMO_EMAIL, "password": DEMO_PW}, timeout=15)
        assert r.status_code == 200, "DEMO PASSWORD BROKEN!"


# ---------- Google Auth ----------
class TestGoogleAuth:
    def test_google_bad_session_id_401(self):
        r = requests.post(f"{API}/auth/google",
                          json={"session_id": "bad"}, timeout=20)
        # Backend calls Emergent session-data endpoint. Bad session -> 401 (or 502 if unreachable)
        assert r.status_code in (401, 502), r.text
        # per spec, expected 401
        if r.status_code == 401:
            assert "Invalid" in r.text or "Google" in r.text or "email" in r.text.lower()

    def test_google_endpoint_exists(self):
        # even an empty body should not be a 404
        r = requests.post(f"{API}/auth/google", json={}, timeout=15)
        assert r.status_code != 404


# ---------- Resume parse ----------
RESUME_TXT = """Priya Sharma
BE, Computer Science, IIT Delhi, Graduating 2026
Email: priya@example.com  |  GitHub: github.com/priyash

Skills: Python (advanced), FastAPI (intermediate), React (intermediate),
MongoDB (beginner), Docker (beginner), Machine Learning (intermediate),
Data Structures (advanced), SQL (intermediate), Git (advanced), AWS (beginner)

Projects:
- Skill Tracker: Full-stack web app with FastAPI + React that tracks student learning goals.
- News Summarizer: NLP project using HuggingFace transformers for abstractive summarization.

Internships:
- Software Engineering Intern at Acme Corp (Summer 2025) - Built REST APIs in Python.

Certifications:
- AWS Certified Cloud Practitioner (2025)

Hackathons:
- Smart India Hackathon 2024 (Finalist)

Work Experience:
- Teaching Assistant, Data Structures course (2024-2025)
"""


class TestResumeParse:
    def test_resume_parse_requires_auth(self):
        files = {"file": ("resume.txt", RESUME_TXT.encode("utf-8"), "text/plain")}
        r = requests.post(f"{API}/resume/parse", files=files, timeout=60)
        assert r.status_code == 401

    def test_resume_parse_txt_returns_real_skills(self, demo_client):
        """Real Claude call: JSON with skills/experience/profile."""
        # requests session has JSON header set; must not send it for multipart
        s = requests.Session()
        s.headers.update({"Authorization": demo_client.headers["Authorization"]})
        files = {"file": ("resume.txt", RESUME_TXT.encode("utf-8"), "text/plain")}
        r = s.post(f"{API}/resume/parse", files=files, timeout=90)
        assert r.status_code == 200, f"{r.status_code} {r.text}"
        data = r.json()
        assert "skills" in data and isinstance(data["skills"], list) and len(data["skills"]) > 0
        # Skills must reference the resume content, not generic
        names = " ".join(s.get("name", "").lower() for s in data["skills"])
        assert "python" in names, f"Expected 'python' in extracted skills: {names!r}"
        assert "experience" in data and isinstance(data["experience"], dict)
        # profile field must exist even if partially populated
        assert "profile" in data and isinstance(data["profile"], dict)

    def test_resume_parse_rejects_empty(self, demo_client):
        s = requests.Session()
        s.headers.update({"Authorization": demo_client.headers["Authorization"]})
        files = {"file": ("empty.txt", b"", "text/plain")}
        r = s.post(f"{API}/resume/parse", files=files, timeout=30)
        assert r.status_code == 400


# ---------- AI Interview streaming ----------
class TestInterview:
    def test_interview_start_streams(self, demo_client):
        session_id = f"iv-test-{uuid.uuid4().hex[:6]}"
        r = demo_client.post(
            f"{API}/ai/interview",
            json={"message": "START", "session_id": session_id, "careerId": "software-developer"},
            timeout=60, stream=True,
        )
        assert r.status_code == 200
        chunks, start = [], time.time()
        for c in r.iter_content(chunk_size=None, decode_unicode=True):
            if c:
                chunks.append(c)
            if time.time() - start > 45:
                break
        full = "".join(chunks)
        print(f"[interview START]: {full!r}")
        assert len(full.strip()) > 20, f"Empty interview welcome: {full!r}"
        assert "?" in full, f"Expected first question in welcome, got: {full!r}"
        # Guard against silent fallback
        assert "couldn't reach" not in full.lower()

    def test_interview_answer_returns_feedback(self, demo_client):
        session_id = f"iv-test-{uuid.uuid4().hex[:6]}"
        # start
        r0 = demo_client.post(f"{API}/ai/interview",
                              json={"message": "START", "session_id": session_id,
                                    "careerId": "software-developer"},
                              timeout=60, stream=True)
        _ = "".join(c for c in r0.iter_content(chunk_size=None, decode_unicode=True) if c)
        # answer
        r = demo_client.post(
            f"{API}/ai/interview",
            json={"message": "A Python list is a mutable ordered sequence stored as a dynamic array; "
                             "tuples are immutable and use less memory. I would use a list when I need "
                             "to modify contents.",
                  "session_id": session_id, "careerId": "software-developer"},
            timeout=60, stream=True,
        )
        assert r.status_code == 200
        chunks, start = [], time.time()
        for c in r.iter_content(chunk_size=None, decode_unicode=True):
            if c:
                chunks.append(c)
            if time.time() - start > 45:
                break
        full = "".join(chunks)
        print(f"[interview answer]: {full!r}")
        assert len(full.strip()) > 30, f"Empty feedback: {full!r}"
        # Should include a numeric score
        import re
        assert re.search(r"\b(?:10|[0-9])\s*/\s*10\b", full) or re.search(r"\bscore\b", full.lower()), \
            f"Expected a /10 score in feedback: {full!r}"
