# Workplan — Goals & Milestones

> **Trace ID**: `f3d9c2e1-8a47-4b6e-bf52-1c9e0d4a7b38`
> **Generated**: 2026-05-21
> **Supersedes**: trace `892ab532-e0ea-41be-80ee-7dfb0abfa3b5` (2026-05-17)
> **Sources**: `.agents/specs/PRD.md`, `.agents/specs/PLAN.md`, `.agents/specs/BACKEND-PLAN.md`, `.agents/traces/logs/log-001`…`log-015`

---

## Mission

Build a mobile app where an investor types a startup name **or uploads a pitch deck** and receives AI-powered due diligence from 4 autonomous agents (Skeptic, Munshi, Hype, CVO), culminating in an **Aura Score out of 1000** with an Invest / Watch / Pass / Acquire verdict and a downloadable investor-grade PDF.

---

## Delivery Phases

| Phase | Goal | Logs | Status |
|-------|------|------|--------|
| P1 | Scaffold Expo Router app, core screens, custom splash, dark theme | 001–006 | ✅ Done |
| P2 | FastAPI backend: 4-agent pipeline, orchestrator, scoring, analyses API | log-007 plan + git `6783ca4`, `d21892d` | ✅ Done |
| P3 | Auth — frontend screens, backend routes, frontend↔backend wiring | 008, 009, 011 | ✅ Done |
| P4 | Server-side PDF, per-user data scoping, glassmorphic toast system | 010, 012, 013 | ✅ Done |
| P5 | SQLite→PostgreSQL migration, Railway deployment, EAS/APK config | 014–015 | ✅ Done |
| P6 | Real-pipeline hardening, native session persistence, tests | — | 🟡 In progress / pending |

---

## High-Level Goals

| ID | Goal | Source | Status |
|----|------|--------|--------|
| G1 | Expo Router app with home, search, loading, handoff, report screens | PLAN | ✅ Done |
| G2 | Custom animated splash + dark-only theme | PLAN | ✅ Done |
| G3 | FastAPI backend with Skeptic / Munshi / Hype / CVO agents + orchestrator | BACKEND-PLAN | ✅ Done |
| G4 | Aura Score scoring engine (`scoring.py`) → score /1000 + verdict | BACKEND-PLAN | ✅ Done |
| G5 | `services/api.ts` client + `services/types.ts` mirroring backend schemas | log-007 | ✅ Done |
| G6 | `POST /api/analyses` (multipart, supports pitch-deck upload) + poll loop | log-007, log-012 | ✅ Done |
| G7 | Loading screen driven by real `pollAnalysis` progress, not a fake timer | log-013 | ✅ Done |
| G8 | Report screen bound to live `ReportData` from the API | log-010, log-012 | ✅ Done |
| G9 | User auth — signup / signin / Google, JWT-style tokens, per-user data | 008, 009, 011, 012 | ✅ Done |
| G10 | Server-side ReportLab PDF + download / share | log-010 | ✅ Done |
| G11 | Glassmorphic toast notification system for errors / network drops | log-013 | ✅ Done |
| G12 | PostgreSQL persistence + Railway deployment + APK build config | 014–015 | ✅ Done |
| G13 | Native session persistence (AsyncStorage/SecureStore) | log-012 caveat | ⬜ Pending |
| G14 | Automated tests (scoring, API client, auth) | AGENTS.md | ⬜ Pending |
| G15 | Tighten CORS, rotate/secure secrets before public launch | DEPLOY.md §9 | ⬜ Pending |

---

## Navigation Map (actual)

```
index (/)
  ├─ unauthenticated → auth (/auth)
  └─ authenticated  → search (/search) ─ or ─ how-they-work (/how-they-work)
                                       └─ reports (/reports) ─ profile (/profile)

search (/search) → loading (/loading)  [POST /api/analyses, then poll]
loading (/loading) → handoff (/handoff) → report (/report)
report (/report) → search (/search)
```

10 screens registered in `app/_layout.tsx`. The PRD's original 4-screen linear flow has grown: `auth`, `how-they-work`, `profile`, and `reports` were added; `handoff` remains the bonus narrative screen.

---

## API Contract (actual — implemented)

Base URL resolves from `EXPO_PUBLIC_API_BASE_URL`, production = `https://vibeinvest-production.up.railway.app`.

**Auth** (`backend/app/routes/auth.py`)
- `POST /api/auth/signup` `{name,email,password}` → `TokenResponse`
- `POST /api/auth/signin` `{email,password}` → `TokenResponse`
- `POST /api/auth/google` `{id_token,name,email,google_id}` → `TokenResponse`
- `PATCH /api/auth/me` `{name}` → `AuthUser`
- `POST /api/auth/me/change-password` `{current_password,new_password}` → `AuthUser`

**Analyses** (`backend/app/routes/analyses.py`) — all require `Authorization: Bearer <token>`
- `POST /api/analyses` — multipart form `(name, intent?, sector?, stage?, funding?, context?, file?)` → `AnalysisDetail`
- `GET /api/analyses/{id}` → `AnalysisDetail`
- `GET /api/analyses?limit=N` → `AnalysisSummary[]`
- `GET /api/analyses/recent?limit=N` → `RecentAnalysisItem[]`
- `GET /api/analyses/{id}/pdf` → ReportLab PDF stream
- `DELETE /api/analyses/{id}`
- `GET /health` → `{status:"ok"}`

**Pipeline model**: request/poll, **not SSE**. Client `POST`s an analysis, receives an `AnalysisDetail` with `status: queued|running`, then `pollAnalysis()` polls `GET /api/analyses/{id}` every 2 s (240 s timeout) until `status` is `completed` or `failed`.

---

## Data Model (actual — `services/types.ts`, mirrors `backend/app/schemas.py`)

```typescript
StartupQuery    { name, intent?, sector?, stage?, funding?, context? }
Finding         { text, type: 'positive'|'negative'|'warning'|'neutral' }
AgentReport     { id, name, role, badge, body, findings: Finding[] }
Dimension       { name, score }
Metric          { label, value, change, change_type }
ReportData      { startup_name, intent?, tags[], score, verdict,
                  verdict_sub?, dimensions[], metrics[], agent_reports[] }
AgentProgress   { agent_id, agent_name, status, badge?, started_at?, completed_at? }
AnalysisSummary { id, startup_name, intent?, status, score?, verdict?,
                  created_at, completed_at? }
AnalysisDetail  extends AnalysisSummary
                { sector?, stage?, funding?, context?, error?,
                  report?: ReportData, progress: AgentProgress[] }
TokenResponse   { access_token, token_type, user: AuthUser }
AuthUser        { id, name, email, created_at }
```

`Verdict = 'INVEST' | 'WATCH' | 'REJECT' | 'ACQUIRE'`. The dashboard widget additionally renders `'PIVOT' | 'ITERATE'` (`api.ts:DashboardVerdict`).

---

## Backend Architecture (`backend/app/`)

```
main.py            FastAPI app, CORS (allow_origins=["*"]), /health, startup init_db()
config.py          env resolution incl. _resolve_database_url() (DATABASE_URL/POSTGRES_URL)
db.py              SQLAlchemy engine, IS_SQLITE gate, init_db()
models.py          ORM: users, analyses, agent_runs, raw_evidence
schemas.py         Pydantic request/response models (mirror of services/types.ts)
auth.py            PBKDF2-SHA256 hashing + HMAC-SHA256 signed tokens (std lib only)
orchestrator.py    Runs the 4-agent pipeline
scoring.py         Aura Score computation → score /1000 + verdict
pdf_generator.py   ReportLab investor-grade PDF
pdf_parser.py      pypdf — extracts text from uploaded pitch decks
agents/            base.py, skeptic.py, munshi.py, hype.py, cvo.py, tools.py
routes/            auth.py, analyses.py
services/          auth.py, deps.py (get_current_user), google_auth.py
```

LLM providers: Claude (default — `claude-sonnet-4-5`, `claude-opus-4-5` for CVO) and Gemini; Tavily powers the Skeptic agent's web search.

---

## Remaining Work (priority order)

1. **Native session persistence** — install `@react-native-async-storage/async-storage`; web already persists via `localStorage`, native cold-start still drops the session.
2. **Pipeline hardening** — confirm all LLM keys (`GOOGLE_API_KEY`, `OPENAI_API_KEY`, `CLAUDE_API_KEY`, `TAVILY_API_KEY`) are set as Railway env vars; agent pipeline fails server-side without them.
3. **Tests** — no test runner is wired up; cover `scoring.py`, `services/api.ts`, and the auth flow.
4. **Security hardening** — narrow `allow_origins` from `["*"]`, set a stable `SECRET_KEY` Railway variable, keep `.env` out of git (currently gitignored ✅).
5. **Schema migrations** — `init_db()` is add-only (`create_all`); adopt Alembic (already in `requirements.txt`) before any column rename/type change.
