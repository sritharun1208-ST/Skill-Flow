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
- P1: Password reset UI page (`/reset-password?token=`) — backend endpoint exists; add the form.
- P2: Real Google OAuth (currently UI-only button).
- P2: Persist AI chat history across sessions in the UI.
- P2: Drag-and-drop polish on mobile Kanban; deadline reminders.
- P2: Readiness score tuning / richer monthly history.

## Test Credentials
- Student: arjun@skillflow.com / skillflow123
- Admin: admin@skillflow.com / admin123
