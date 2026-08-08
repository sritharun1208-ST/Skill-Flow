# Auth Testing Playbook (Emergent Google Auth + JWT)

Skill Flow supports two auth methods, both issuing an **app Bearer token** stored in localStorage key `sf_token`:
1. Email/password (JWT) — primary.
2. Emergent-managed Google Auth — "Continue with Google".

## Google Auth flow
- Frontend "Continue with Google" redirects to `https://auth.emergentagent.com/?redirect=<origin>/app/dashboard`.
- Google returns to `<origin>/app/dashboard#session_id=...`.
- `AppRoutes` (App.js) detects `location.hash` with `session_id` → renders `AuthCallback`.
- `AuthCallback` POSTs `{ session_id }` to `POST /api/auth/google`.
- Backend calls `https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data` with header `X-Session-ID`, gets `{email,name,picture,session_token}`, upserts the user by email, and returns our own app JWT `token`.
- Frontend stores `token` in `sf_token` and routes to onboarding (new user) or dashboard.

## Backend test (JWT / Bearer)
```
curl -X POST $URL/api/auth/login -H 'Content-Type: application/json' -d '{"email":"arjun@skillflow.com","password":"skillflow123"}'
# -> returns { ..., "token": "<JWT>" }
curl $URL/api/auth/me -H "Authorization: Bearer <JWT>"   # 200 with user
```

## Google session simulation (backend cannot be curl'd without a real session_id)
Google session_id comes from the real OAuth redirect; it cannot be faked via curl. Test the Google button by clicking it in the browser and completing Google login.

## Test identities
- Demo student (password): arjun@skillflow.com / skillflow123
- Admin (password): admin@skillflow.com / admin123
- Google: any real Google account allowed by Emergent Auth. No app password stored for Google users (password_hash = null; `auth_provider = "google"`).
