# Task Plan — Completed & Pending Tasks

> **Trace ID**: `f3d9c2e1-8a47-4b6e-bf52-1c9e0d4a7b38`
> **Generated**: 2026-05-21
> **Supersedes**: trace `892ab532-e0ea-41be-80ee-7dfb0abfa3b5` (2026-05-17)

Legend: `[x]` done · `[/]` partial · `[ ]` not started

---

## Phase 1: Scaffolding + UI  (logs 001–006)

- [x] Initialize Expo project with TypeScript strict mode
- [x] Configure Expo Router Stack navigator (`app/_layout.tsx`)
- [x] Register screens: index, auth, search, loading, handoff, report, how-they-work, profile, reports (9 in stack)
- [x] Home screen (`app/index.tsx`) — branding, stats, trending picks, dashboard
- [x] Search screen (`app/search.tsx`) — input, intent selector, context fields, deck upload
- [x] Loading screen (`app/loading.tsx`) — 4 agent scenes (Skeptic/Munshi/Hype/CVO)
- [x] Handoff screen (`app/handoff.tsx`) — scripted agent chat room (bonus)
- [x] Report screen (`app/report.tsx`) — Aura Score, dimensions, metrics, agent cards
- [x] Custom animated GIF splash (3.5 s hold + 600 ms fade) in `_layout.tsx`
- [x] Dark-only theme + `constants/theme.ts`
- [x] Brand assets — logo, splash GIF, Android adaptive icons

## Phase 2: FastAPI Backend + 4-Agent Pipeline  (log-007 plan; git `6783ca4`, `d21892d`)

- [x] FastAPI app (`backend/app/main.py`) — CORS, `/health`, startup `init_db()`
- [x] SQLAlchemy models — `users`, `analyses`, `agent_runs`, `raw_evidence`
- [x] Pydantic schemas (`schemas.py`) mirrored by `services/types.ts`
- [x] 4 agents — `skeptic.py`, `munshi.py`, `hype.py`, `cvo.py` + `base.py`, `tools.py`
- [x] Pipeline orchestrator (`orchestrator.py`)
- [x] Aura Score engine (`scoring.py`) — score /1000 + verdict
- [x] Analyses routes — `POST /api/analyses`, `GET /{id}`, list, `recent`, `DELETE`
- [x] Pitch-deck ingestion — `pdf_parser.py` (pypdf) on uploaded files
- [x] Frontend API client `services/api.ts` + `services/types.ts`
- [x] `createAnalysis` multipart upload + `pollAnalysis` poll loop (2 s / 240 s timeout)
- [x] Loading screen wired to real poll progress (replaced fake timer)
- [x] Report screen bound to live `ReportData` from the API

## Phase 3: Authentication  (logs 008, 009, 011)

- [x] Auth screen (`app/auth.tsx`) — signup / signin / Google, validation, haptics
- [x] Global `AuthContext` + route guards on protected screens
- [x] Backend `auth.py` — PBKDF2-SHA256 hashing, HMAC-SHA256 signed tokens (std lib only)
- [x] Backend `routes/auth.py` — `signup`, `signin`, `google`, `me`, `me/change-password`
- [x] `services/google_auth.py` — Google ID-token verification via `httpx`
- [x] Frontend ↔ backend wiring — real API calls replace local mocks
- [x] Backend error `detail` parsed and surfaced on the mobile UI
- [x] Session persistence on **web** (`localStorage` key `vibe.auth.session`)
- [x] `/auth` redirects already-logged-in users back to `/`
- [ ] Session persistence on **native** — needs `@react-native-async-storage/async-storage`

## Phase 4: PDF, Per-User Data, Toasts  (logs 010, 012, 013)

- [x] Server-side PDF (`pdf_generator.py`, ReportLab) + `GET /api/analyses/{id}/pdf`
- [x] Master PDF / Share controls on the report header
- [x] PDF download works on web (real file save) and native (`expo-web-browser`)
- [x] Per-user data scoping — `user_id` on `analyses`, ownership checks on every route
- [x] `get_current_user` dependency (`services/deps.py`)
- [x] Glassmorphic toast system — `context/ToastContext.tsx` + `useToast()`
- [x] Toasts wired across search, index, loading, auth, profile
- [x] Polling fail-safes — warn after 3 failures, exit after 8 consecutive
- [x] Profile screen (`app/profile.tsx`) — name / password updates
- [x] Reports history screen (`app/reports.tsx`)
- [x] How-it-works explainer screen (`app/how-they-work.tsx`)

## Phase 5: PostgreSQL + Deployment  (logs 014–015)

- [x] SQLite → PostgreSQL migration
- [x] `config.py` `_resolve_database_url()` — `DATABASE_URL`/`POSTGRES_URL`, scheme normalize
- [x] `Procfile`, `requirements.txt` (`psycopg2-binary`), `run.sh`
- [x] `backend/DEPLOY.md` — canonical Railway deployment guide
- [x] Backend deployed to Railway (Postgres-backed, public HTTPS)
- [x] `eas.json` — `EXPO_PUBLIC_API_BASE_URL` set on development/preview/production
- [x] Backend verified live (`/health` 200, auth + DB confirmed)

## Phase 6: Hardening & Tests  (pending)

- [ ] Native session persistence (AsyncStorage / SecureStore)
- [ ] Automated tests — `scoring.py`, `services/api.ts`, auth flow (no runner wired up)
- [ ] Narrow CORS `allow_origins` from `["*"]` to real frontend domains
- [ ] Set a stable `SECRET_KEY` Railway variable (tokens break across redeploys otherwise)
- [ ] Confirm all LLM keys set as Railway env vars (pipeline fails server-side without them)
- [ ] Adopt Alembic migrations — `init_db()` `create_all` is add-only
- [/] Pre-migration orphan analyses (`user_id = NULL`) — left in place by design

---

## Summary

| Phase | Done | Partial | Pending | Total |
|-------|------|---------|---------|-------|
| P1 — Scaffolding + UI | 11 | 0 | 0 | 11 |
| P2 — Backend + pipeline | 12 | 0 | 0 | 12 |
| P3 — Authentication | 9 | 0 | 1 | 10 |
| P4 — PDF / per-user / toasts | 11 | 0 | 0 | 11 |
| P5 — Postgres + deployment | 8 | 0 | 0 | 8 |
| P6 — Hardening & tests | 0 | 1 | 6 | 7 |
| **Total** | **51** | **1** | **7** | **59** |

**Completion**: ~86% done, ~12% pending, ~2% partial. The product is end-to-end functional and deployed; remaining work is hardening, native session persistence, and test coverage.
