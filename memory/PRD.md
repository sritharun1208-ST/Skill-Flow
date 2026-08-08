# Skill Flow — Product Requirements Document

## Original Problem Statement
Build "Skill Flow", an AI-powered career navigation platform for students — a "Personal Career GPS" (NOT a LinkedIn clone). Flow: Current Skills → Target Career → Required Skills → Skill Gap → What to Learn → What to Build → Opportunities → Application Tracking → Career Progress. Strong orange (#FF6B00) SaaS brand. Tagline: "Turn Your Skills Into Your Career."

## User Choices
- Auth: JWT email/password; Google button is UI-only.
- Demo data preloaded (student "Arjun Kumar").
- Full end-to-end build, all pages functional.
- Visual: clean minimal SaaS with bold energetic orange accents.
- AI model default: Claude Sonnet 4.6 (claude-sonnet-4-6) via Emergent Universal Key.

## Architecture
- Frontend: React 19, react-router, TailwindCSS, shadcn/ui, framer-motion, recharts, lucide-react. Fonts: Outfit (headings) + DM Sans (body).
- Backend: FastAPI, MongoDB (motor). All routes under `/api`.
- Auth: **Bearer token in localStorage (`sf_token`)**, returned in login/register body. (httpOnly cookies also set but frontend relies on Bearer — cookies were unreliable because the platform marks them SameSite=None;Partitioned and credentialed XHR hung. API client is fetch-based.)
- Career intelligence (careers, required skills, learning paths, resources, projects, opportunities, badges) is defined in `/app/backend/data.py`. User-specific state (skills, learning progress, projects, applications, chat) in MongoDB.
- AI: `/api/ai/chat` streams Claude responses (emergentintegrations) using the student's real data as context.

## User Personas
- Student (primary): builds profile, discovers gaps, learns, builds projects, applies, tracks progress.
- Admin (seeded): admin@skillflow.com.

## Core Requirements (static)
Landing, Auth (login/register/forgot), Onboarding wizard (5 steps), Dashboard (circular readiness + stat cards), AI Skill Gap analysis, Learning Path (toggle completion), Projects, Opportunities (match scoring + filters), Kanban Application Tracker, Career Explorer + comparison, Progress (charts), Profile + Proof of Skills + portfolio, floating Skill Flow AI, gamification badges, responsive (sidebar → bottom nav).

## Implemented (2026-06-08)
- Full backend API: auth (Bearer), onboarding, profile/skills, careers catalog + match, dashboard aggregate, skill-gap, learning-path + toggle, projects + status, opportunities + match, applications CRUD + stats, progress + history, readiness, proof-of-skills, badges, AI chat (Claude streaming) + history.
- Demo user Arjun Kumar with skills, experience, projects, 5 applications, learning progress, career readiness ~51%.
- Full frontend: Landing, Login/Register/Forgot, Onboarding wizard, Dashboard, My Skills, Skill Gap (radar + table + categories), Learning Path (timeline + resources), Projects, Opportunities, Applications (Kanban drag + modal), Career Explorer (+ comparison + detail modal), Progress (area + bar charts), Profile (overview + proof + edit + portfolio), floating AI assistant.
- Testing: testing agent iteration_1 — 21/21 backend pass, all critical frontend flows pass, real Claude AI streaming verified.

## Backlog / Remaining (P1/P2)
- P2: Persist AI chat history across sessions in the UI.
- P2: Drag-and-drop polish on mobile Kanban; deadline reminders.
- P2: Readiness score tuning / richer monthly history.
- P2: Before real production, stop returning the reset token in the forgot-password response (currently returned for demo convenience) and send it by email instead.

## Added 2026-06-08 (iteration 2)
- **Password Reset** screen (`/reset-password?token=`) + forgot-password surfaces a demo reset link.
- **Resume Import** in onboarding: upload PDF/DOCX/TXT → Claude extracts skills/experience/profile to auto-fill.
- **Real Google Login** via Emergent-managed OAuth (`/api/auth/google` exchanges session_id → issues our app JWT); AuthCallback handles the redirect. Existing email/password Bearer auth unchanged.
- **Interview Prep** (`/app/interview`): AI mock-interview mode (Claude) tailored to a selected opportunity or target career; one question at a time with scored feedback. "Practice" entry on Opportunities cards.
- Verified: testing agent iteration_2 — 34/34 backend pass, all 4 features + regressions pass.

## Test Credentials
- Student: arjun@skillflow.com / skillflow123
- Admin: admin@skillflow.com / admin123
