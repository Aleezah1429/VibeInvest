# Agent Observations — Codebase Architecture

> **Trace ID**: `f3d9c2e1-8a47-4b6e-bf52-1c9e0d4a7b38`
> **Generated**: 2026-05-21
> **Supersedes**: trace `892ab532-e0ea-41be-80ee-7dfb0abfa3b5` (2026-05-17)

---

## Project Structure

```
VibeInvest/
├── .agents/specs/          PRD.md, PLAN.md, BACKEND-PLAN.md
├── .agents/skills/         6 skill templates (add-screen, add-component,
│                           add-api-call, write-test, debug-platform-issue,
│                           create-task-log)
├── .agents/traces/         this trace (8 summary files) + logs/ (15 task logs)
├── app/                    10 screens (Expo Router file-based routing)
│   ├── _layout.tsx         Root — Auth/Reports/Toast providers + Stack + splash (109)
│   ├── index.tsx           Home / dashboard / trending picks (1905 — LARGEST)
│   ├── auth.tsx            Signup / signin / Google (644)
│   ├── search.tsx          Search form + pitch-deck upload (410)
│   ├── loading.tsx         4 agent scenes + real poll loop (781)
│   ├── handoff.tsx         Agent chat room (448 — not in PRD)
│   ├── report.tsx          Report + PDF + share (1194)
│   ├── how-they-work.tsx   Agent explainer screen (359)
│   ├── profile.tsx         Profile / password settings (479)
│   └── reports.tsx         Report history (317)
├── backend/                FastAPI app — REAL, deployed to Railway
│   ├── app/                23 Python modules (see Backend section)
│   ├── DEPLOY.md           Canonical Railway deployment guide
│   ├── Procfile            uvicorn app.main:app --host 0.0.0.0 --port $PORT
│   ├── requirements.txt    FastAPI, SQLAlchemy, anthropic, reportlab, psycopg2…
│   ├── run.sh              Local dev runner
│   └── data.db*            Local SQLite dev DB + WAL sidecars (gitignored)
├── context/                AuthContext.tsx, ReportsContext.tsx, ToastContext.tsx
├── services/               api.ts (API client), types.ts (schema mirror)
├── components/             Expo scaffold defaults — still unused by screens
├── constants/theme.ts      Colors + platform-adaptive Fonts
├── hooks/                  Expo defaults only
├── google-adk-agent/       EMPTY (gitignored) — planned ADK agent never built
├── assets/images/          Brand logo + splash GIF + icons
├── eas.json                EAS build profiles (API base URL per profile)
├── app.json                Expo config
├── .env                    Real LLM keys — gitignored, never committed
└── dist/                   Web build output (gitignored)
```

---

## Key Architectural Observations

### 1. The service layer now exists
`services/api.ts` (231 lines) is a typed `fetch` client; `services/types.ts` mirrors `backend/app/schemas.py`. The 2026-05-17 trace reported "no `services/` directory" — that is no longer true. All screens now call the real API.

### 2. There is a real, deployed backend
`backend/` is a FastAPI application running on Railway against a Railway-managed PostgreSQL database (`https://vibeinvest-backend-production.up.railway.app`). The 4-agent pipeline, Aura Score scoring, auth, and PDF generation all run server-side.

### 3. The pipeline is poll-based, not SSE
The PRD specified an SSE stream (`POST /api/run/google-adk`). The implementation instead uses request/poll: `createAnalysis()` POSTs to `/api/analyses`, then `pollAnalysis()` polls `GET /api/analyses/{id}` every 2 s (240 s timeout) until `status` is `completed`/`failed`. No `EventSource`, no SSE library — a deliberate, simpler choice for React Native.

### 4. Global state via three React contexts
`_layout.tsx` nests `AuthProvider → ReportsProvider → ToastProvider` around the Stack. No Redux/Zustand — plain Context API.

### 5. Screens are still monolithic
`index.tsx` is now **1905 lines**, `report.tsx` **1194**, `loading.tsx` **781**. Sub-components (scenes, cards, bubbles) remain inline. No extraction to `components/` has occurred — this is the largest outstanding code-quality debt.

### 6. `components/` and `hooks/` are still untouched scaffold
Both directories hold only Expo's auto-generated defaults. None are imported by any app screen. Custom logic lives in `context/` and `services/` instead.

### 7. Backend rolls its own auth crypto
`backend/app/auth.py` implements PBKDF2-SHA256 password hashing and HMAC-SHA256 signed tokens using only Python's standard library (`hashlib`, `hmac`, `secrets`) — no `passlib`, no `pyjwt`. Tokens are JWT-style but custom.

### 8. The planned web/ADK stack was abandoned
`frontend/` (Next.js), `.temp/` (prototypes), and `api/` (Python venv) — all present in the 2026-05-17 trace — have been **deleted**. `google-adk-agent/` is now empty. `frontend/` and `google-adk-agent/` are gitignored. The README's "Next.js 15 + Google ADK" architecture never materialized; the real stack is Expo + FastAPI.

### 9. Pitch-deck upload is supported
`search.tsx` uses `expo-document-picker`; `createAnalysis()` sends the file as multipart form-data; `backend/app/pdf_parser.py` (pypdf) extracts deck text for the agents.

### 10. Two icon systems, Reanimated still idle
`@expo/vector-icons` (Ionicons) handles UI chrome; `lucide-react-native` handles agent iconography. `react-native-reanimated@4.1.1` is installed but custom animations still use RN's built-in `Animated` API.

### 11. Session persistence is web-only
The auth session persists across reloads on web via `localStorage` (`vibe.auth.session`). On native iOS/Android a cold start still loses the session — `@react-native-async-storage/async-storage` is not installed. Known, documented gap (log-012).

### 12. Secrets handling
`.env` holds real `GOOGLE_API_KEY`, `OPENAI_API_KEY`, `CLAUDE_API_KEY`, `TAVILY_API_KEY` in plaintext. It **is** in `.gitignore` and `git log` shows it was **never committed**. The non-secret `EXPO_PUBLIC_API_BASE_URL` is committed in `eas.json` (safe — public endpoint).

---

## Backend Module Map (`backend/app/`)

| Module | Responsibility |
|--------|----------------|
| `main.py` | FastAPI app, CORS (`allow_origins=["*"]`), `/health`, startup `init_db()` |
| `config.py` | Env resolution, `_resolve_database_url()` (DATABASE_URL/POSTGRES_URL) |
| `db.py` | SQLAlchemy engine, `IS_SQLITE` gate, `pool_pre_ping`, `init_db()` |
| `models.py` | ORM tables — `users`, `analyses`, `agent_runs`, `raw_evidence` |
| `schemas.py` | Pydantic request/response models (mirrored by `services/types.ts`) |
| `auth.py` | PBKDF2-SHA256 hashing + HMAC-SHA256 token signing (std lib only) |
| `orchestrator.py` | Runs the 4-agent pipeline |
| `scoring.py` | Aura Score computation → score /1000 + verdict |
| `pdf_generator.py` | ReportLab investor-grade PDF |
| `pdf_parser.py` | pypdf — extracts text from uploaded pitch decks |
| `agents/` | `base.py`, `skeptic.py`, `munshi.py`, `hype.py`, `cvo.py`, `tools.py` |
| `routes/` | `auth.py`, `analyses.py` |
| `services/` | `auth.py`, `deps.py` (`get_current_user`), `google_auth.py` |

---

## Design System Observations

| Token | Value | Usage |
|-------|-------|-------|
| Background | `#09090F` | All screen containers |
| Primary accent | `#6366f1` | Buttons, links, score highlight |
| Primary light | `#818cf8` | Subtle accent text |
| Skeptic | `#FF6B6B` | Red — risk, warnings |
| Munshi | `#D4FF3D` | Lime — financial data |
| Hype | `#A78BFA` | Purple — brand, social |
| CVO | `#FFC83C` | Gold — final verdict |
| Success | `#22c55e` | Positive metrics, INVEST stamp |
| Warning | `#f59e0b` | Watch indicators |
| Danger | `#ef4444` | Risk flags, REJECTED stamp |
| Card bg | `rgba(255,255,255,0.04–0.06)` | Glassmorphic cards |
| Toast | `BlurView` + glow overlay | Glassmorphic notifications, notch-safe |

Finding colors are centralized in `services/types.ts:findingColor()`.

---

## Dependency Analysis

### Added since the 2026-05-17 trace
`expo-blur` (toast glass), `expo-document-picker` (deck upload), `expo-print` + `expo-sharing` (PDF), `expo-linear-gradient`, `expo-linking`, `expo-system-ui`, `react-native-gesture-handler`, `react-native-worklets`.

### Used in app code
`expo-router`, `react-native` (`Animated`), `@expo/vector-icons`, `lucide-react-native`, `expo-splash-screen`, `expo-blur`, `expo-document-picker`, `expo-print`, `expo-sharing`, `react-native-safe-area-context`.

### Installed but unused by app screens
`react-native-reanimated` (scaffold only), `expo-haptics` (scaffold tab only), `expo-web-browser` (used for PDF on native + scaffold), `expo-image`, `expo-font`, `expo-constants`, `expo-symbols`, `@react-navigation/bottom-tabs` (no tab nav).

---

## Git Topology

```
main (441ebbc)  ← HEAD — "remove skip, add backend url"
3 merged PRs:  #1 update-docs · #2 user-api · #3 user-api
Local branches: main, backend-setup, mob_app, ui-changes, update-docs
Remote-only:    UI-Phase1, backend, kill-switch, logo-addition,
                merge-updated-ui, postgres-setup
```

History is no longer linear — backend, UI, and auth work proceeded on parallel branches and were merged. Several stale branches remain unmerged.
