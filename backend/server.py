from dotenv import load_dotenv
from pathlib import Path
import os

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

from fastapi import FastAPI, APIRouter, Request, Response, HTTPException, Depends, UploadFile, File
from fastapi.responses import StreamingResponse
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone, timedelta
from bson import ObjectId
import logging
import uuid
import secrets
import bcrypt
import jwt
import io
import json
import requests as httpreq

import data as catalog

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

JWT_SECRET = os.environ["JWT_SECRET"]
JWT_ALGORITHM = "HS256"
EMERGENT_LLM_KEY = os.environ.get("EMERGENT_LLM_KEY")

app = FastAPI()
api = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("skillflow")


# ---------------------------------------------------------------------------
# Auth helpers
# ---------------------------------------------------------------------------
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False


def create_access_token(user_id: str, email: str) -> str:
    payload = {"sub": user_id, "email": email, "type": "access",
               "exp": datetime.now(timezone.utc) + timedelta(days=7)}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def create_refresh_token(user_id: str) -> str:
    payload = {"sub": user_id, "type": "refresh",
               "exp": datetime.now(timezone.utc) + timedelta(days=30)}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def set_auth_cookies(response: Response, user_id: str, email: str):
    access = create_access_token(user_id, email)
    refresh = create_refresh_token(user_id)
    response.set_cookie("access_token", access, httponly=True, secure=True,
                        samesite="lax", max_age=604800, path="/")
    response.set_cookie("refresh_token", refresh, httponly=True, secure=True,
                        samesite="lax", max_age=2592000, path="/")
    return access


def serialize_user(user: dict) -> dict:
    user = dict(user)
    user["id"] = str(user.pop("_id"))
    user.pop("password_hash", None)
    return user


async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


# ---------------------------------------------------------------------------
# Pydantic models
# ---------------------------------------------------------------------------
class RegisterIn(BaseModel):
    name: str
    email: EmailStr
    password: str = Field(min_length=6)


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class ForgotIn(BaseModel):
    email: EmailStr


class ResetIn(BaseModel):
    token: str
    password: str = Field(min_length=6)


class OnboardingIn(BaseModel):
    profile: Dict[str, Any]
    targetCareer: str
    goal: str
    skills: List[Dict[str, Any]]
    experience: Dict[str, Any]


class SkillIn(BaseModel):
    name: str
    level: str


class ProfileUpdate(BaseModel):
    profile: Optional[Dict[str, Any]] = None
    targetCareer: Optional[str] = None
    goal: Optional[str] = None
    skills: Optional[List[Dict[str, Any]]] = None
    experience: Optional[Dict[str, Any]] = None


class ApplicationIn(BaseModel):
    company: str
    role: str
    status: str = "saved"
    deadline: Optional[str] = None
    appliedDate: Optional[str] = None
    interviewDate: Optional[str] = None
    notes: Optional[str] = ""
    opportunityId: Optional[str] = None


class ApplicationUpdate(BaseModel):
    company: Optional[str] = None
    role: Optional[str] = None
    status: Optional[str] = None
    deadline: Optional[str] = None
    appliedDate: Optional[str] = None
    interviewDate: Optional[str] = None
    notes: Optional[str] = None


class ChatIn(BaseModel):
    message: str
    session_id: Optional[str] = None


class GoogleAuthIn(BaseModel):
    session_id: str


class InterviewIn(BaseModel):
    message: str
    session_id: Optional[str] = None
    opportunityId: Optional[str] = None
    careerId: Optional[str] = None


# ---------------------------------------------------------------------------
# Career-intelligence computation
# ---------------------------------------------------------------------------
def user_skill_map(user: dict) -> Dict[str, int]:
    m = {}
    for s in user.get("skills", []) or []:
        m[s["name"].lower()] = catalog.lvl(s.get("level", "beginner"))
    return m


def compute_skill_gap(user: dict) -> dict:
    career = catalog.CAREER_BY_ID.get(user.get("targetCareer"))
    if not career:
        return {"strong": [], "improve": [], "missing": [], "rows": [], "coverage": 0}
    smap = user_skill_map(user)
    strong, improve, missing, rows = [], [], [], []
    covered = 0.0
    for req in career["required_skills"]:
        req_v = catalog.lvl(req["level"])
        cur_v = smap.get(req["name"].lower(), 0)
        gap = req_v - cur_v
        if gap <= 0:
            category, cover = "strong", 1.0
        elif cur_v == 0:
            category, cover = "missing", 0.0
        else:
            category, cover = "improve", cur_v / req_v
        covered += cover
        # priority
        if category == "strong":
            priority = "Low"
        elif gap >= 2 or (category == "missing" and req.get("core")):
            priority = "Critical"
        elif req.get("core"):
            priority = "High"
        else:
            priority = "Medium"
        gap_label = "None" if gap <= 0 else ("Large" if gap >= 2 else "Medium")
        row = {
            "skill": req["name"],
            "current": catalog.LEVEL_LABEL[cur_v],
            "required": catalog.LEVEL_LABEL[req_v],
            "currentValue": cur_v,
            "requiredValue": req_v,
            "gap": gap_label,
            "priority": priority,
            "category": category,
            "coverage": round(cover * 100),
        }
        rows.append(row)
        if category == "strong":
            strong.append(row)
        elif category == "improve":
            improve.append(row)
        else:
            missing.append(row)
    prio_order = {"Critical": 0, "High": 1, "Medium": 2, "Low": 3}
    rows.sort(key=lambda r: prio_order[r["priority"]])
    coverage = round(covered / len(career["required_skills"]) * 100) if career["required_skills"] else 0
    return {"strong": strong, "improve": improve, "missing": missing, "rows": rows, "coverage": coverage}


def compute_learning_path(user: dict) -> List[dict]:
    career = catalog.CAREER_BY_ID.get(user.get("targetCareer"))
    if not career:
        return []
    progress = user.get("learningProgress", {}) or {}
    steps = []
    for i, step in enumerate(career["path"]):
        step_id = f"{career['id']}-step-{i}"
        steps.append({
            "id": step_id,
            "step": i + 1,
            "title": step["title"],
            "why": step["why"],
            "difficulty": step["difficulty"],
            "time": step["time"],
            "learn": step["learn"],
            "skill": step["skill"],
            "project": step["project"],
            "tasks": step["tasks"],
            "resources": catalog.resources_for(step["skill"]),
            "completed": bool(progress.get(step_id, False)),
        })
    return steps


def compute_opportunity_match(user: dict, opp: dict) -> dict:
    smap = user_skill_map(user)
    matched, partial, missing = [], [], []
    score = 0.0
    for req in opp["required_skills"]:
        req_v = catalog.lvl(req["level"])
        cur_v = smap.get(req["name"].lower(), 0)
        if cur_v >= req_v and cur_v > 0:
            matched.append(req["name"])
            score += 1.0
        elif cur_v > 0:
            partial.append(req["name"])
            score += 0.5
        else:
            missing.append(req["name"])
    total = len(opp["required_skills"]) or 1
    return {
        **opp,
        "match": round(score / total * 100),
        "matchedSkills": matched,
        "partialSkills": partial,
        "missingSkills": missing,
        "missingCount": len(missing),
    }


def compute_readiness(user: dict) -> dict:
    gap = compute_skill_gap(user)
    skills_score = gap["coverage"]
    exp = user.get("experience", {}) or {}
    projects_done = len([p for p in user.get("savedProjects", []) or [] if p.get("status") == "completed"])
    projects_done += len(exp.get("projects", []) or [])
    projects_score = min(100, projects_done * 30)
    experience_score = min(100, (len(exp.get("internships", []) or []) * 40 + len(exp.get("hackathons", []) or []) * 20 + len(exp.get("work", []) or []) * 40))
    cert_score = min(100, len(exp.get("certifications", []) or []) * 33)
    steps = compute_learning_path(user)
    interview_score = round(len([s for s in steps if s["completed"]]) / len(steps) * 100) if steps else 0
    overall = round(skills_score * 0.4 + projects_score * 0.2 + experience_score * 0.15 + cert_score * 0.1 + interview_score * 0.15)
    return {
        "overall": overall,
        "breakdown": {
            "Skills": skills_score,
            "Projects": projects_score,
            "Experience": experience_score,
            "Certifications": cert_score,
            "Interview Preparation": interview_score,
        },
    }


def compute_badges(user: dict) -> List[dict]:
    exp = user.get("experience", {}) or {}
    steps = compute_learning_path(user)
    metrics = {
        "skills": len(user.get("skills", []) or []),
        "learning": len([s for s in steps if s["completed"]]),
        "career": 1 if user.get("targetCareer") else 0,
        "projects": len([p for p in user.get("savedProjects", []) or [] if p.get("status") == "completed"]) + len(exp.get("projects", []) or []),
        "applications": 0,  # filled by caller
        "readiness": compute_readiness(user)["overall"],
    }
    return metrics


# ---------------------------------------------------------------------------
# Auth endpoints
# ---------------------------------------------------------------------------
@api.post("/auth/register")
async def register(body: RegisterIn, response: Response):
    email = body.email.lower()
    if await db.users.find_one({"email": email}):
        raise HTTPException(status_code=400, detail="Email already registered")
    doc = {
        "name": body.name,
        "email": email,
        "password_hash": hash_password(body.password),
        "role": "student",
        "onboarded": False,
        "profile": {"name": body.name},
        "targetCareer": None,
        "goal": None,
        "skills": [],
        "experience": {"projects": [], "internships": [], "certifications": [], "hackathons": [], "work": []},
        "learningProgress": {},
        "savedProjects": [],
        "proofs": [],
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    res = await db.users.insert_one(doc)
    token = set_auth_cookies(response, str(res.inserted_id), email)
    doc["_id"] = res.inserted_id
    return {**serialize_user(doc), "token": token}


@api.post("/auth/login")
async def login(body: LoginIn, response: Response):
    email = body.email.lower()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(body.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = set_auth_cookies(response, str(user["_id"]), email)
    return {**serialize_user(user), "token": token}


@api.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")
    return {"ok": True}


@api.post("/auth/google")
async def google_auth(body: GoogleAuthIn, response: Response):
    # REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    try:
        r = httpreq.get(
            "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
            headers={"X-Session-ID": body.session_id}, timeout=15)
    except Exception:
        raise HTTPException(status_code=502, detail="Auth service unreachable")
    if r.status_code != 200:
        raise HTTPException(status_code=401, detail="Invalid or expired Google session")
    info = r.json()
    email = (info.get("email") or "").lower()
    if not email:
        raise HTTPException(status_code=401, detail="No email returned from Google")
    user = await db.users.find_one({"email": email})
    if not user:
        doc = {
            "name": info.get("name") or email.split("@")[0],
            "email": email,
            "password_hash": None,
            "auth_provider": "google",
            "role": "student",
            "onboarded": False,
            "profile": {"name": info.get("name") or "", "photo": info.get("picture") or ""},
            "targetCareer": None, "goal": None, "skills": [],
            "experience": {"projects": [], "internships": [], "certifications": [], "hackathons": [], "work": []},
            "learningProgress": {}, "savedProjects": [], "proofs": [],
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        res = await db.users.insert_one(doc)
        doc["_id"] = res.inserted_id
        user = doc
    token = set_auth_cookies(response, str(user["_id"]), email)
    return {**serialize_user(user), "token": token}


@api.get("/auth/me")
async def me(user: dict = Depends(get_current_user)):
    return serialize_user(user)


@api.post("/auth/refresh")
async def refresh(request: Request, response: Response):
    token = request.cookies.get("refresh_token")
    if not token:
        raise HTTPException(status_code=401, detail="No refresh token")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token")
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        token = set_auth_cookies(response, str(user["_id"]), user["email"])
        return {**serialize_user(user), "token": token}
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


@api.post("/auth/forgot-password")
async def forgot_password(body: ForgotIn):
    user = await db.users.find_one({"email": body.email.lower()})
    if user:
        token = secrets.token_urlsafe(32)
        await db.password_reset_tokens.insert_one({
            "token": token, "user_id": str(user["_id"]),
            "expires_at": datetime.now(timezone.utc) + timedelta(hours=1),
            "used": False,
        })
        logger.info(f"[Skill Flow] Password reset link: /reset-password?token={token}")
        return {"ok": True, "message": "If that email exists, a reset link has been sent.", "token": token}
    return {"ok": True, "message": "If that email exists, a reset link has been sent."}


@api.post("/auth/reset-password")
async def reset_password(body: ResetIn):
    rec = await db.password_reset_tokens.find_one({"token": body.token})
    if not rec or rec.get("used"):
        raise HTTPException(status_code=400, detail="Invalid or used token")
    exp = rec["expires_at"]
    if isinstance(exp, str):
        exp = datetime.fromisoformat(exp)
    if exp.tzinfo is None:
        exp = exp.replace(tzinfo=timezone.utc)
    if exp < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Token expired")
    await db.users.update_one({"_id": ObjectId(rec["user_id"])},
                              {"$set": {"password_hash": hash_password(body.password)}})
    await db.password_reset_tokens.update_one({"token": body.token}, {"$set": {"used": True}})
    return {"ok": True}


# ---------------------------------------------------------------------------
# Onboarding / profile
# ---------------------------------------------------------------------------
@api.post("/onboarding")
async def save_onboarding(body: OnboardingIn, user: dict = Depends(get_current_user)):
    update = {
        "profile": {**(user.get("profile") or {}), **body.profile},
        "targetCareer": body.targetCareer,
        "goal": body.goal,
        "skills": body.skills,
        "experience": {**(user.get("experience") or {}), **body.experience},
        "onboarded": True,
    }
    await db.users.update_one({"_id": user["_id"]}, {"$set": update})
    updated = await db.users.find_one({"_id": user["_id"]})
    return serialize_user(updated)


@api.put("/profile")
async def update_profile(body: ProfileUpdate, user: dict = Depends(get_current_user)):
    update = {}
    if body.profile is not None:
        update["profile"] = {**(user.get("profile") or {}), **body.profile}
    if body.targetCareer is not None:
        update["targetCareer"] = body.targetCareer
    if body.goal is not None:
        update["goal"] = body.goal
    if body.skills is not None:
        update["skills"] = body.skills
    if body.experience is not None:
        update["experience"] = {**(user.get("experience") or {}), **body.experience}
    if update:
        await db.users.update_one({"_id": user["_id"]}, {"$set": update})
    updated = await db.users.find_one({"_id": user["_id"]})
    return serialize_user(updated)


@api.put("/skills")
async def update_skills(skills: List[SkillIn], user: dict = Depends(get_current_user)):
    payload = [s.model_dump() for s in skills]
    await db.users.update_one({"_id": user["_id"]}, {"$set": {"skills": payload}})
    updated = await db.users.find_one({"_id": user["_id"]})
    return serialize_user(updated)


# ---------------------------------------------------------------------------
# Career catalog
# ---------------------------------------------------------------------------
@api.get("/careers")
async def list_careers():
    return [{"id": c["id"], "name": c["name"], "icon": c["icon"], "description": c["description"],
             "technologies": c["technologies"], "typical_projects": c["typical_projects"],
             "required_skills": c["required_skills"], "path_length": len(c["path"])}
            for c in catalog.CAREERS]


@api.get("/careers/{career_id}")
async def get_career(career_id: str):
    c = catalog.CAREER_BY_ID.get(career_id)
    if not c:
        raise HTTPException(status_code=404, detail="Career not found")
    return c


@api.get("/careers/{career_id}/match")
async def career_match(career_id: str, user: dict = Depends(get_current_user)):
    c = catalog.CAREER_BY_ID.get(career_id)
    if not c:
        raise HTTPException(status_code=404, detail="Career not found")
    smap = user_skill_map(user)
    total = len(c["required_skills"]) or 1
    score = 0.0
    for req in c["required_skills"]:
        req_v = catalog.lvl(req["level"])
        cur_v = smap.get(req["name"].lower(), 0)
        if cur_v >= req_v and cur_v > 0:
            score += 1.0
        elif cur_v > 0:
            score += 0.5
    return {"careerId": career_id, "match": round(score / total * 100)}


# ---------------------------------------------------------------------------
# Dashboard aggregate
# ---------------------------------------------------------------------------
@api.get("/dashboard")
async def dashboard(user: dict = Depends(get_current_user)):
    gap = compute_skill_gap(user)
    readiness = compute_readiness(user)
    steps = compute_learning_path(user)
    apps = await db.applications.find({"user_id": str(user["_id"])}).to_list(500)
    opps = [compute_opportunity_match(user, o) for o in catalog.OPPORTUNITIES]
    matching = [o for o in opps if o["match"] >= 40]
    career = catalog.CAREER_BY_ID.get(user.get("targetCareer"))
    projects_completed = len([p for p in user.get("savedProjects", []) or [] if p.get("status") == "completed"])
    return {
        "name": user.get("profile", {}).get("name") or user.get("name"),
        "targetCareer": career["name"] if career else None,
        "targetCareerId": user.get("targetCareer"),
        "readiness": readiness["overall"],
        "readinessBreakdown": readiness["breakdown"],
        "skills": [{"name": s["name"], "level": s["level"], "value": round(catalog.lvl(s["level"]) / 3 * 100)}
                   for s in (user.get("skills", []) or [])],
        "skillGaps": [{"skill": r["skill"], "priority": r["priority"]} for r in gap["rows"] if r["category"] != "strong"][:5],
        "learning": {"completed": len([s for s in steps if s["completed"]]), "total": len(steps)},
        "projects": projects_completed,
        "opportunities": len(matching),
        "applications": len(apps),
        "coverage": gap["coverage"],
    }


@api.get("/skill-gap")
async def skill_gap(user: dict = Depends(get_current_user)):
    if not user.get("targetCareer"):
        raise HTTPException(status_code=400, detail="No target career set")
    gap = compute_skill_gap(user)
    career = catalog.CAREER_BY_ID.get(user.get("targetCareer"))
    return {**gap, "careerName": career["name"] if career else None}


@api.get("/learning-path")
async def learning_path(user: dict = Depends(get_current_user)):
    steps = compute_learning_path(user)
    career = catalog.CAREER_BY_ID.get(user.get("targetCareer"))
    return {"careerName": career["name"] if career else None, "steps": steps}


@api.post("/learning-path/{step_id}/toggle")
async def toggle_step(step_id: str, user: dict = Depends(get_current_user)):
    progress = user.get("learningProgress", {}) or {}
    progress[step_id] = not progress.get(step_id, False)
    await db.users.update_one({"_id": user["_id"]}, {"$set": {"learningProgress": progress}})
    return {"stepId": step_id, "completed": progress[step_id]}


@api.get("/projects")
async def projects(user: dict = Depends(get_current_user)):
    target = user.get("targetCareer")
    gap = compute_skill_gap(user)
    missing_names = {m["skill"] for m in gap["missing"] + gap["improve"]}
    saved = {p["id"]: p for p in (user.get("savedProjects", []) or [])}
    result = []
    for p in catalog.PROJECTS:
        relevance = 0
        if target in p.get("careers", []):
            relevance += 2
        relevance += len(set(p["skills_gained"]) & missing_names)
        result.append({**p, "relevance": relevance,
                       "status": saved.get(p["id"], {}).get("status", "not_started")})
    result.sort(key=lambda x: x["relevance"], reverse=True)
    return result


@api.post("/projects/{project_id}/status")
async def set_project_status(project_id: str, body: Dict[str, str], user: dict = Depends(get_current_user)):
    status = body.get("status", "not_started")
    saved = user.get("savedProjects", []) or []
    found = False
    for p in saved:
        if p["id"] == project_id:
            p["status"] = status
            found = True
    if not found:
        saved.append({"id": project_id, "status": status})
    await db.users.update_one({"_id": user["_id"]}, {"$set": {"savedProjects": saved}})
    return {"projectId": project_id, "status": status}


@api.get("/opportunities")
async def opportunities(user: dict = Depends(get_current_user)):
    result = [compute_opportunity_match(user, o) for o in catalog.OPPORTUNITIES]
    result.sort(key=lambda x: x["match"], reverse=True)
    return result


@api.get("/proof-of-skills")
async def proof_of_skills(user: dict = Depends(get_current_user)):
    exp = user.get("experience", {}) or {}
    skills = user.get("skills", []) or []
    proofs = []
    for s in skills:
        evidence = []
        for pr in exp.get("projects", []) or []:
            evidence.append({"type": "Project", "label": pr if isinstance(pr, str) else pr.get("name", "Project")})
        for cert in exp.get("certifications", []) or []:
            evidence.append({"type": "Certification", "label": cert if isinstance(cert, str) else cert.get("name", "Certification")})
        proofs.append({"skill": s["name"], "level": s["level"], "evidence": evidence[:4]})
    return {
        "skills": proofs,
        "projects": exp.get("projects", []) or [],
        "certifications": exp.get("certifications", []) or [],
        "hackathons": exp.get("hackathons", []) or [],
        "internships": exp.get("internships", []) or [],
        "github": user.get("profile", {}).get("github"),
        "portfolio": user.get("profile", {}).get("portfolio"),
    }


# ---------------------------------------------------------------------------
# Applications (Kanban)
# ---------------------------------------------------------------------------
@api.get("/applications")
async def list_applications(user: dict = Depends(get_current_user)):
    apps = await db.applications.find({"user_id": str(user["_id"])}).to_list(500)
    for a in apps:
        a["id"] = str(a.pop("_id"))
    stats = {
        "total": len(apps),
        "interviews": len([a for a in apps if a.get("status") == "interview" or a.get("interviewDate")]),
        "offers": len([a for a in apps if a.get("status") == "selected"]),
    }
    responded = len([a for a in apps if a.get("status") in ("assessment", "interview", "selected", "rejected")])
    stats["responseRate"] = round(responded / len(apps) * 100) if apps else 0
    return {"applications": apps, "stats": stats}


@api.post("/applications")
async def create_application(body: ApplicationIn, user: dict = Depends(get_current_user)):
    doc = body.model_dump()
    doc["user_id"] = str(user["_id"])
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    res = await db.applications.insert_one(doc)
    doc["id"] = str(res.inserted_id)
    doc.pop("_id", None)
    return doc


@api.put("/applications/{app_id}")
async def update_application(app_id: str, body: ApplicationUpdate, user: dict = Depends(get_current_user)):
    update = {k: v for k, v in body.model_dump().items() if v is not None}
    res = await db.applications.update_one(
        {"_id": ObjectId(app_id), "user_id": str(user["_id"])}, {"$set": update})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Application not found")
    doc = await db.applications.find_one({"_id": ObjectId(app_id)})
    doc["id"] = str(doc.pop("_id"))
    return doc


@api.delete("/applications/{app_id}")
async def delete_application(app_id: str, user: dict = Depends(get_current_user)):
    await db.applications.delete_one({"_id": ObjectId(app_id), "user_id": str(user["_id"])})
    return {"ok": True}


# ---------------------------------------------------------------------------
# Progress & readiness
# ---------------------------------------------------------------------------
@api.get("/progress")
async def progress(user: dict = Depends(get_current_user)):
    readiness = compute_readiness(user)
    steps = compute_learning_path(user)
    exp = user.get("experience", {}) or {}
    apps = await db.applications.find({"user_id": str(user["_id"])}).to_list(500)
    cur = readiness["overall"]
    history = [
        {"month": "January", "value": max(0, cur - 25)},
        {"month": "February", "value": max(0, cur - 16)},
        {"month": "March", "value": max(0, cur - 8)},
        {"month": "April", "value": cur},
    ]
    return {
        "readiness": readiness["overall"],
        "breakdown": readiness["breakdown"],
        "history": history,
        "stats": {
            "skillsImproved": len(user.get("skills", []) or []),
            "learningCompleted": len([s for s in steps if s["completed"]]),
            "learningTotal": len(steps),
            "projectsCompleted": len([p for p in user.get("savedProjects", []) or [] if p.get("status") == "completed"]) + len(exp.get("projects", []) or []),
            "certifications": len(exp.get("certifications", []) or []),
            "applications": len(apps),
            "interviews": len([a for a in apps if a.get("status") == "interview" or a.get("interviewDate")]),
        },
    }


@api.get("/readiness")
async def readiness_endpoint(user: dict = Depends(get_current_user)):
    return compute_readiness(user)


@api.get("/badges")
async def badges(user: dict = Depends(get_current_user)):
    metrics = compute_badges(user)
    apps = await db.applications.find({"user_id": str(user["_id"])}).to_list(500)
    metrics["applications"] = len(apps)
    result = []
    for b in catalog.BADGES:
        result.append({**b, "earned": metrics.get(b["metric"], 0) >= b["threshold"],
                       "progress": min(100, round(metrics.get(b["metric"], 0) / b["threshold"] * 100))})
    return result


# ---------------------------------------------------------------------------
# Skill Flow AI  (Claude, streaming)
# ---------------------------------------------------------------------------
def build_ai_context(user: dict) -> str:
    career = catalog.CAREER_BY_ID.get(user.get("targetCareer"))
    gap = compute_skill_gap(user)
    readiness = compute_readiness(user)
    skills = ", ".join([f"{s['name']} ({s['level']})" for s in (user.get("skills", []) or [])]) or "none listed"
    missing = ", ".join([m["skill"] for m in gap["missing"]]) or "none"
    improve = ", ".join([m["skill"] for m in gap["improve"]]) or "none"
    return (
        f"Student name: {user.get('profile', {}).get('name') or user.get('name')}. "
        f"Target career: {career['name'] if career else 'not set'}. "
        f"Main goal: {user.get('goal') or 'not set'}. "
        f"Current skills: {skills}. "
        f"Missing skills for target career: {missing}. "
        f"Skills to improve: {improve}. "
        f"Career readiness: {readiness['overall']}%. "
        f"Learning path progress: {len([s for s in compute_learning_path(user) if s['completed']])} steps completed."
    )


@api.post("/ai/chat")
async def ai_chat(body: ChatIn, request: Request, user: dict = Depends(get_current_user)):
    session_id = body.session_id or str(uuid.uuid4())
    context = build_ai_context(user)
    system_message = (
        "You are Skill Flow AI, a warm, sharp career mentor for students. "
        "You help students understand their skill gaps, what to learn next, what projects to build, "
        "and which opportunities to target. Always be specific, actionable and encouraging. "
        "Keep answers concise (under 220 words), use short paragraphs or bullet points. "
        "Base your advice on THIS student's real data below. Never invent skills they don't have.\n\n"
        f"STUDENT DATA: {context}"
    )

    # persist user message
    await db.chat_messages.insert_one({
        "user_id": str(user["_id"]), "session_id": session_id, "role": "user",
        "content": body.message, "created_at": datetime.now(timezone.utc).isoformat(),
    })

    async def event_generator():
        full = ""
        try:
            from emergentintegrations.llm.chat import LlmChat, UserMessage, TextDelta, StreamDone
            chat = LlmChat(api_key=EMERGENT_LLM_KEY, session_id=session_id,
                           system_message=system_message).with_model("anthropic", "claude-sonnet-4-6")
            async for event in chat.stream_message(UserMessage(text=body.message)):
                if isinstance(event, TextDelta):
                    full += event.content
                    yield event.content
                elif isinstance(event, StreamDone):
                    break
        except Exception as e:
            logger.error(f"AI chat error: {e}")
            fallback = "I'm having trouble reaching the AI service right now. Please try again in a moment."
            full = fallback
            yield fallback
        await db.chat_messages.insert_one({
            "user_id": str(user["_id"]), "session_id": session_id, "role": "assistant",
            "content": full, "created_at": datetime.now(timezone.utc).isoformat(),
        })

    return StreamingResponse(event_generator(), media_type="text/plain",
                             headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"})


async def _stream_response(system_message, session_id, message, user_id, kind):
    async def gen():
        full = ""
        try:
            from emergentintegrations.llm.chat import LlmChat, UserMessage, TextDelta, StreamDone
            chat = LlmChat(api_key=EMERGENT_LLM_KEY, session_id=session_id,
                           system_message=system_message).with_model("anthropic", "claude-sonnet-4-6")
            async for event in chat.stream_message(UserMessage(text=message)):
                if isinstance(event, TextDelta):
                    full += event.content
                    yield event.content
                elif isinstance(event, StreamDone):
                    break
        except Exception as e:
            logger.error(f"AI {kind} error: {e}")
            full = "I'm having trouble reaching the AI service right now. Please try again in a moment."
            yield full
        await db.chat_messages.insert_one({
            "user_id": user_id, "session_id": session_id, "role": "assistant",
            "kind": kind, "content": full, "created_at": datetime.now(timezone.utc).isoformat(),
        })
    return StreamingResponse(gen(), media_type="text/plain",
                             headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"})


@api.post("/ai/interview")
async def ai_interview(body: InterviewIn, user: dict = Depends(get_current_user)):
    session_id = body.session_id or str(uuid.uuid4())
    role, company, skills = "your target role", "a company", []
    if body.opportunityId:
        opp = next((o for o in catalog.OPPORTUNITIES if o["id"] == body.opportunityId), None)
        if opp:
            role, company = opp["role"], opp["company"]
            skills = [s["name"] for s in opp["required_skills"]]
    if not skills:
        career = catalog.CAREER_BY_ID.get(body.careerId or user.get("targetCareer"))
        if career:
            role = career["name"]
            skills = [s["name"] for s in career["required_skills"]]
    context = build_ai_context(user)
    system_message = (
        f"You are a friendly but rigorous technical interviewer conducting a mock interview for the role of "
        f"{role} at {company}. Focus your questions on these required skills: {', '.join(skills)}. "
        "Rules: Ask ONE question at a time. When the student answers, give short constructive feedback, "
        "a score out of 10 for that answer, then ask the next question. Keep each turn under 160 words. "
        "If the student's message is 'START', begin with a brief welcome and your first question. "
        "Adapt difficulty to the student's real level.\n\n"
        f"STUDENT DATA: {context}"
    )
    await db.chat_messages.insert_one({
        "user_id": str(user["_id"]), "session_id": session_id, "role": "user",
        "kind": "interview", "content": body.message, "created_at": datetime.now(timezone.utc).isoformat(),
    })
    return await _stream_response(system_message, session_id, body.message, str(user["_id"]), "interview")


async def _extract_resume_text(file: UploadFile) -> str:
    content = await file.read()
    fname = (file.filename or "").lower()
    text = ""
    try:
        if fname.endswith(".pdf"):
            from pypdf import PdfReader
            reader = PdfReader(io.BytesIO(content))
            text = "\n".join((p.extract_text() or "") for p in reader.pages)
        elif fname.endswith(".docx"):
            import docx
            d = docx.Document(io.BytesIO(content))
            text = "\n".join(p.text for p in d.paragraphs)
        else:
            text = content.decode("utf-8", errors="ignore")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not read the file: {e}")
    text = (text or "").strip()[:8000]
    if len(text) < 20:
        raise HTTPException(status_code=400, detail="Couldn't extract readable text from this file.")
    return text


async def _llm_json(system: str, prompt: str, error_label: str) -> dict:
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        chat = LlmChat(api_key=EMERGENT_LLM_KEY, session_id=str(uuid.uuid4()),
                       system_message=system).with_model("anthropic", "claude-sonnet-4-6")
        raw = await chat.send_message(UserMessage(text=prompt))
        raw = raw if isinstance(raw, str) else str(raw)
        raw = raw.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()
        start, end = raw.find("{"), raw.rfind("}")
        return json.loads(raw[start:end + 1])
    except Exception as e:
        logger.error(f"{error_label}: {e}")
        raise HTTPException(status_code=502, detail=f"Could not {error_label}. Please try again.")


@api.post("/resume/parse")
async def parse_resume(file: UploadFile = File(...), user: dict = Depends(get_current_user)):
    text = await _extract_resume_text(file)
    system = "You extract structured data from resumes. Respond with ONLY valid minified JSON, no prose, no code fences."
    prompt = (
        'From the resume text below, extract JSON with EXACTLY these keys: '
        '"skills": array of objects {"name": string, "level": one of "beginner"|"intermediate"|"advanced"} (infer level, default "intermediate"), '
        '"experience": {"projects": string[], "internships": string[], "certifications": string[], "hackathons": string[], "work": string[]}, '
        '"profile": {"college": string, "degree": string, "branch": string, "graduationYear": string, "github": string, "portfolio": string}. '
        'Only include items present in the resume. Keep skills to the 12 most relevant.\n\nRESUME:\n' + text
    )
    data = await _llm_json(system, prompt, "analyze the resume")
    return {
        "skills": data.get("skills", []),
        "experience": data.get("experience", {}),
        "profile": data.get("profile", {}),
    }


@api.post("/resume/score")
async def score_resume(file: UploadFile = File(...), careerId: Optional[str] = None, user: dict = Depends(get_current_user)):
    text = await _extract_resume_text(file)
    career = catalog.CAREER_BY_ID.get(careerId or user.get("targetCareer"))
    role_name = career["name"] if career else (careerId or "the target role")
    req_skills = ", ".join([f"{s['name']} ({s['level']})" for s in career["required_skills"]]) if career else "general skills for the role"
    techs = ", ".join(career["technologies"]) if career else ""
    system = "You are an expert technical recruiter and resume reviewer. Respond with ONLY valid minified JSON, no prose, no code fences."
    prompt = (
        f'Evaluate this student resume for the target role of "{role_name}". '
        f'Required skills for the role: {req_skills}. Common technologies: {techs}. '
        'Return JSON with EXACTLY these keys: '
        '"overall": integer 0-100 (overall fit for the role), '
        '"verdict": one short sentence summary, '
        '"breakdown": array of {"category": string, "score": integer 0-100} for exactly these categories: '
        '"Skills Match","Relevant Experience","Projects","Education","Formatting & Clarity","Keywords / ATS", '
        '"matchedSkills": string[] (role skills clearly present), '
        '"missingSkills": string[] (role skills absent or weak), '
        '"missingKeywords": string[] (important ATS keywords to add), '
        '"strengths": string[] (3-5 specific strengths), '
        '"improvements": array of {"title": string, "detail": string} (4-6 concrete, actionable fixes, most impactful first). '
        'Be specific and reference the actual resume content.\n\nRESUME:\n' + text
    )
    data = await _llm_json(system, prompt, "score the resume")
    return {
        "role": role_name,
        "overall": data.get("overall", 0),
        "verdict": data.get("verdict", ""),
        "breakdown": data.get("breakdown", []),
        "matchedSkills": data.get("matchedSkills", []),
        "missingSkills": data.get("missingSkills", []),
        "missingKeywords": data.get("missingKeywords", []),
        "strengths": data.get("strengths", []),
        "improvements": data.get("improvements", []),
    }


@api.get("/ai/history")
async def ai_history(session_id: Optional[str] = None, user: dict = Depends(get_current_user)):
    query = {"user_id": str(user["_id"])}
    if session_id:
        query["session_id"] = session_id
    msgs = await db.chat_messages.find(query).sort("created_at", 1).to_list(200)
    for m in msgs:
        m.pop("_id", None)
    return msgs


@api.get("/")
async def root():
    return {"message": "Skill Flow API", "status": "ok"}


# ---------------------------------------------------------------------------
# App wiring
# ---------------------------------------------------------------------------
app.include_router(api)
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    await db.users.create_index("email", unique=True)
    await db.applications.create_index("user_id")
    await db.password_reset_tokens.create_index("expires_at", expireAfterSeconds=0)
    await seed_admin_and_demo()


@app.on_event("shutdown")
async def shutdown():
    client.close()


async def seed_admin_and_demo():
    # Admin
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@skillflow.com")
    admin_password = os.environ.get("ADMIN_PASSWORD", "admin123")
    if not await db.users.find_one({"email": admin_email}):
        await db.users.insert_one({
            "name": "Admin", "email": admin_email, "password_hash": hash_password(admin_password),
            "role": "admin", "onboarded": True, "profile": {"name": "Admin"},
            "skills": [], "experience": {}, "learningProgress": {}, "savedProjects": [],
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
    # Demo student Arjun Kumar
    demo_email = os.environ.get("DEMO_EMAIL", "arjun@skillflow.com")
    demo_password = os.environ.get("DEMO_PASSWORD", "skillflow123")
    existing = await db.users.find_one({"email": demo_email})
    if not existing:
        demo = {
            "name": "Arjun Kumar",
            "email": demo_email,
            "password_hash": hash_password(demo_password),
            "role": "student",
            "onboarded": True,
            "profile": {
                "name": "Arjun Kumar",
                "education": "B.Tech",
                "college": "Delhi Technological University",
                "degree": "Computer Science Engineering",
                "branch": "CSE",
                "year": "3rd Year",
                "graduationYear": "2027",
                "about": "Aspiring software developer passionate about building things that matter. Focused on backend and problem solving.",
                "github": "https://github.com/arjunkumar",
                "portfolio": "https://arjunkumar.dev",
                "photo": "",
            },
            "targetCareer": "software-developer",
            "goal": "Get an internship",
            "skills": [
                {"name": "Python", "level": "intermediate"},
                {"name": "Java", "level": "beginner"},
                {"name": "SQL", "level": "intermediate"},
                {"name": "HTML/CSS", "level": "advanced"},
                {"name": "Git & GitHub", "level": "beginner"},
                {"name": "Object Oriented Programming", "level": "intermediate"},
                {"name": "Problem Solving", "level": "beginner"},
            ],
            "experience": {
                "projects": ["Expense Tracker (Python + SQL)", "Personal Portfolio Website"],
                "internships": [],
                "certifications": ["Python for Everybody (Coursera)", "SQL Basics (HackerRank)"],
                "hackathons": ["Smart India Hackathon 2025 - Participant"],
                "work": [],
            },
            "learningProgress": {
                "software-developer-step-2": True,
            },
            "savedProjects": [
                {"id": "p1", "status": "completed"},
                {"id": "p3", "status": "completed"},
                {"id": "p2", "status": "in_progress"},
            ],
            "proofs": [],
            "readinessHistory": [
                {"month": "January", "value": 42},
                {"month": "February", "value": 51},
                {"month": "March", "value": 63},
                {"month": "April", "value": 67},
            ],
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        res = await db.users.insert_one(demo)
        demo_id = str(res.inserted_id)
        # Demo applications
        demo_apps = [
            {"company": "TechNova Labs", "role": "Software Developer Intern", "status": "interview", "deadline": "2026-07-15", "appliedDate": "2026-06-01", "interviewDate": "2026-06-20", "notes": "Technical round scheduled.", "opportunityId": "o1"},
            {"company": "Brightframe", "role": "Full Stack Developer Intern", "status": "applied", "deadline": "2026-07-20", "appliedDate": "2026-06-05", "notes": "Waiting for response.", "opportunityId": "o2"},
            {"company": "CloudPile", "role": "Backend Developer (Junior)", "status": "assessment", "deadline": "2026-07-30", "appliedDate": "2026-06-08", "notes": "Coding assessment due.", "opportunityId": "o4"},
            {"company": "Open Source Orgs", "role": "Google Summer of Code", "status": "saved", "deadline": "2026-07-12", "notes": "Shortlist a mentor org.", "opportunityId": "o9"},
            {"company": "Government of India", "role": "Smart India Hackathon 2026", "status": "applied", "deadline": "2026-07-05", "appliedDate": "2026-06-10", "notes": "Forming a team.", "opportunityId": "o6"},
        ]
        for a in demo_apps:
            a["user_id"] = demo_id
            a["created_at"] = datetime.now(timezone.utc).isoformat()
        await db.applications.insert_many(demo_apps)
    logger.info("Seeding complete.")
