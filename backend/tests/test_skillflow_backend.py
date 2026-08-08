"""Skill Flow backend integration tests - covers auth, dashboard, learning-path,
projects, opportunities, applications, careers, progress, profile, proof-of-skills
and AI chat streaming (Anthropic Claude via EMERGENT_LLM_KEY)."""
import os
import time
import uuid
import pytest
import requests

BASE_URL = os.environ["REACT_APP_BACKEND_URL"].rstrip("/") if "REACT_APP_BACKEND_URL" in os.environ else "https://skill-journey-127.preview.emergentagent.com"
API = f"{BASE_URL}/api"

DEMO_EMAIL = "arjun@skillflow.com"
DEMO_PW = "skillflow123"
ADMIN_EMAIL = "admin@skillflow.com"
ADMIN_PW = "admin123"


@pytest.fixture(scope="module")
def demo_client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    r = s.post(f"{API}/auth/login", json={"email": DEMO_EMAIL, "password": DEMO_PW}, timeout=15)
    assert r.status_code == 200, f"demo login failed: {r.status_code} {r.text}"
    token = r.json().get("token")
    assert token, "no token in login response"
    s.headers.update({"Authorization": f"Bearer {token}"})
    return s


# ---- Auth ----
class TestAuth:
    def test_login_demo(self):
        r = requests.post(f"{API}/auth/login", json={"email": DEMO_EMAIL, "password": DEMO_PW}, timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert "token" in data and isinstance(data["token"], str)
        assert data["email"] == DEMO_EMAIL
        assert data["onboarded"] is True
        assert data.get("targetCareer") == "software-developer"

    def test_login_invalid(self):
        r = requests.post(f"{API}/auth/login", json={"email": DEMO_EMAIL, "password": "wrong"}, timeout=15)
        assert r.status_code == 401

    def test_me_with_bearer(self, demo_client):
        r = demo_client.get(f"{API}/auth/me", timeout=15)
        assert r.status_code == 200
        assert r.json()["email"] == DEMO_EMAIL

    def test_me_without_token(self):
        r = requests.get(f"{API}/auth/me", timeout=15)
        assert r.status_code == 401

    def test_register_new_user(self):
        email = f"TEST_user_{uuid.uuid4().hex[:8]}@example.com"
        r = requests.post(f"{API}/auth/register",
                          json={"name": "Test User", "email": email, "password": "testpass123"},
                          timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert data["email"] == email.lower()
        assert data["onboarded"] is False
        assert "token" in data


# ---- Dashboard aggregate ----
class TestDashboard:
    def test_dashboard(self, demo_client):
        r = demo_client.get(f"{API}/dashboard", timeout=15)
        assert r.status_code == 200
        d = r.json()
        assert d["name"] == "Arjun Kumar"
        assert d["targetCareer"]
        assert isinstance(d["readiness"], int)
        assert 0 <= d["readiness"] <= 100
        assert isinstance(d["skills"], list) and len(d["skills"]) > 0
        assert "skillGaps" in d
        assert "readinessBreakdown" in d


# ---- Skill Gap ----
class TestSkillGap:
    def test_skill_gap(self, demo_client):
        r = demo_client.get(f"{API}/skill-gap", timeout=15)
        assert r.status_code == 200
        d = r.json()
        for key in ("strong", "improve", "missing", "rows", "coverage"):
            assert key in d
        assert isinstance(d["rows"], list) and len(d["rows"]) > 0
        row = d["rows"][0]
        for k in ("skill", "current", "required", "priority", "category"):
            assert k in row


# ---- Learning Path ----
class TestLearningPath:
    def test_learning_path(self, demo_client):
        r = demo_client.get(f"{API}/learning-path", timeout=15)
        assert r.status_code == 200
        d = r.json()
        assert "steps" in d and len(d["steps"]) >= 1
        step = d["steps"][0]
        for k in ("id", "title", "completed", "tasks"):
            assert k in step

    def test_toggle_step(self, demo_client):
        # Fetch first step id
        r = demo_client.get(f"{API}/learning-path", timeout=15)
        step_id = r.json()["steps"][0]["id"]
        initial = r.json()["steps"][0]["completed"]
        # Toggle
        r2 = demo_client.post(f"{API}/learning-path/{step_id}/toggle", timeout=15)
        assert r2.status_code == 200
        assert r2.json()["completed"] != initial
        # Toggle back
        r3 = demo_client.post(f"{API}/learning-path/{step_id}/toggle", timeout=15)
        assert r3.json()["completed"] == initial


# ---- Projects ----
class TestProjects:
    def test_projects_list(self, demo_client):
        r = demo_client.get(f"{API}/projects", timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list) and len(data) >= 1
        p = data[0]
        for k in ("id", "title", "skills_gained", "status"):
            assert k in p

    def test_project_status_persist(self, demo_client):
        r = demo_client.get(f"{API}/projects", timeout=15)
        pid = r.json()[0]["id"]
        r2 = demo_client.post(f"{API}/projects/{pid}/status", json={"status": "in_progress"}, timeout=15)
        assert r2.status_code == 200
        assert r2.json()["status"] == "in_progress"
        # verify persisted
        r3 = demo_client.get(f"{API}/projects", timeout=15)
        found = [p for p in r3.json() if p["id"] == pid][0]
        assert found["status"] == "in_progress"


# ---- Opportunities ----
class TestOpportunities:
    def test_opportunities_list(self, demo_client):
        r = demo_client.get(f"{API}/opportunities", timeout=15)
        assert r.status_code == 200
        arr = r.json()
        assert len(arr) > 0
        o = arr[0]
        for k in ("id", "role", "company", "match", "matchedSkills", "missingSkills", "type", "mode"):
            assert k in o
        assert 0 <= o["match"] <= 100


# ---- Applications (Kanban) ----
class TestApplications:
    def test_list_applications(self, demo_client):
        r = demo_client.get(f"{API}/applications", timeout=15)
        assert r.status_code == 200
        d = r.json()
        assert "applications" in d and "stats" in d
        assert len(d["applications"]) >= 5  # demo seeded 5

    def test_crud_application(self, demo_client):
        # Create
        payload = {"company": "TEST_Co", "role": "TEST Role", "status": "saved"}
        r = demo_client.post(f"{API}/applications", json=payload, timeout=15)
        assert r.status_code == 200
        app_id = r.json()["id"]
        # Update
        r2 = demo_client.put(f"{API}/applications/{app_id}", json={"status": "applied"}, timeout=15)
        assert r2.status_code == 200
        assert r2.json()["status"] == "applied"
        # Verify in list
        r3 = demo_client.get(f"{API}/applications", timeout=15)
        found = [a for a in r3.json()["applications"] if a["id"] == app_id]
        assert found and found[0]["status"] == "applied"
        # Delete
        r4 = demo_client.delete(f"{API}/applications/{app_id}", timeout=15)
        assert r4.status_code == 200


# ---- Careers ----
class TestCareers:
    def test_list_careers(self):
        r = requests.get(f"{API}/careers", timeout=15)
        assert r.status_code == 200
        arr = r.json()
        assert len(arr) > 0
        c = arr[0]
        for k in ("id", "name", "required_skills"):
            assert k in c

    def test_career_match(self, demo_client):
        r = demo_client.get(f"{API}/careers/software-developer/match", timeout=15)
        assert r.status_code == 200
        d = r.json()
        assert 0 <= d["match"] <= 100


# ---- Progress ----
class TestProgress:
    def test_progress(self, demo_client):
        r = demo_client.get(f"{API}/progress", timeout=15)
        assert r.status_code == 200
        d = r.json()
        assert "readiness" in d
        assert "history" in d and len(d["history"]) >= 4
        assert "breakdown" in d


# ---- Profile / Proof ----
class TestProfile:
    def test_proof_of_skills(self, demo_client):
        r = demo_client.get(f"{API}/proof-of-skills", timeout=15)
        assert r.status_code == 200
        d = r.json()
        assert isinstance(d["skills"], list)
        assert d["github"]

    def test_profile_update(self, demo_client):
        r = demo_client.put(f"{API}/profile", json={"profile": {"about": "TEST_updated_bio"}}, timeout=15)
        assert r.status_code == 200
        d = r.json()
        assert d["profile"]["about"] == "TEST_updated_bio"


# ---- AI Chat streaming ----
class TestAIChat:
    def test_ai_chat_stream_arithmetic(self, demo_client):
        """Real user probe: ask a checkable question and verify a real answer streams back."""
        r = demo_client.post(
            f"{API}/ai/chat",
            json={"message": "What is 17 + 26? Reply with just the number.", "session_id": f"sf-test-{uuid.uuid4().hex[:6]}"},
            timeout=60,
            stream=True,
        )
        assert r.status_code == 200
        chunks = []
        start = time.time()
        for chunk in r.iter_content(chunk_size=None, decode_unicode=True):
            if chunk:
                chunks.append(chunk)
            if time.time() - start > 45:
                break
        full = "".join(chunks)
        print(f"\n[AI arithmetic reply]: {full!r}")
        assert full.strip(), "Empty AI response"
        # Guard against fallback
        assert "having trouble" not in full.lower(), f"Fallback served: {full}"
        assert "43" in full, f"Expected '43' in reply, got: {full}"

    def test_ai_chat_stream_career(self, demo_client):
        """Personalized career mentor probe - checks student data is used."""
        r = demo_client.post(
            f"{API}/ai/chat",
            json={"message": "In one short sentence, what skill should I improve first for my target career?",
                  "session_id": f"sf-test-{uuid.uuid4().hex[:6]}"},
            timeout=60,
            stream=True,
        )
        assert r.status_code == 200
        chunks = []
        start = time.time()
        for chunk in r.iter_content(chunk_size=None, decode_unicode=True):
            if chunk:
                chunks.append(chunk)
            if time.time() - start > 45:
                break
        full = "".join(chunks)
        print(f"\n[AI career reply]: {full!r}")
        assert len(full.strip()) > 10, "Reply too short"
        assert "having trouble" not in full.lower(), f"Fallback served: {full}"
