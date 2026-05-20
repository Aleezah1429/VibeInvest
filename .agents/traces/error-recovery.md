# Error Recovery — TODOs, Bugs, Inconsistencies

> **Trace ID**: `f3d9c2e1-8a47-4b6e-bf52-1c9e0d4a7b38`
> **Generated**: 2026-05-21
> **Supersedes**: trace `892ab532-e0ea-41be-80ee-7dfb0abfa3b5` (2026-05-17)

---

## ✅ Resolved Since the 2026-05-17 Trace

| Old ID | Issue | Resolution |
|--------|-------|------------|
| ERR-001 | No API integration | `services/api.ts` is a full typed client against the live backend |
| ERR-003 | Report data static | Report binds to live `ReportData` from `GET /api/analyses/{id}` |
| ERR-004 | Only 2 of 4 agent cards | Report renders `agent_reports[]` from the API |
| ERR-005 | Intent/context fields not sent | `createAnalysis()` sends name/intent/sector/stage/funding/context + file |
| ERR-006 | Download/Share non-functional | Server-side ReportLab PDF + working download/share |
| ERR-007 | Recent reports hardcoded | `getRecentAnalyses()` drives the dashboard |
| ERR-008 | No error states | Glassmorphic toast system surfaces all failures |
| ERR-010 | No loading states | Loading screen driven by the real `pollAnalysis` loop |
| ERR-016–019 | Data-model types / SSE not implemented | `services/types.ts` mirrors `schemas.py`; pipeline is poll-based by design |
| ERR-020 | API keys committed | `.env` is gitignored and `git log` confirms it was **never committed** |
| ERR-021 | `frontend/` dead Next.js dir | Deleted |
| ERR-024 | `.temp/` prototype files | Deleted |

`ERR-002` (no SSE library) and `ERR-019` are **not bugs** — the poll-based pipeline is a deliberate design choice (see `reasoning.md` Decision 2).

---

## 🔴 Critical — Pre-Launch Blockers

### ERR-001: LLM keys must be set as Railway env vars
- **Location**: Railway backend service → Variables
- **Risk**: The agent pipeline calls Claude / Gemini / Tavily server-side. If `CLAUDE_API_KEY`, `GOOGLE_API_KEY`, or `TAVILY_API_KEY` are unset on Railway, every analysis fails server-side even though the app and DB look healthy.
- **Fix**: Confirm all four keys (`GOOGLE_API_KEY`, `OPENAI_API_KEY`, `CLAUDE_API_KEY`, `TAVILY_API_KEY`) are present in Railway Variables. Local `.env` does **not** propagate to Railway.

### ERR-002: `SECRET_KEY` must be stable across deploys
- **Location**: `backend/app/auth.py` (token signing) / Railway Variables
- **Risk**: HMAC tokens are signed with `SECRET_KEY`. If it falls back to the hardcoded default or changes between deploys, every existing session token silently becomes invalid.
- **Fix**: Set a fixed `SECRET_KEY` Railway variable (`python -c "import secrets; print(secrets.token_hex(32))"`).

---

## 🟠 Pre-Launch Hardening

### ERR-003: CORS is wide open
- **Location**: `backend/app/main.py:10-16` — `allow_origins=["*"]`
- **Risk**: Fine while iterating; unsafe once the URL is public.
- **Fix**: Narrow `allow_origins` to the real frontend domain(s) before public launch (`DEPLOY.md §9`).

### ERR-004: No schema migration path
- **Location**: `backend/app/db.py` — `init_db()` uses `Base.metadata.create_all()`
- **Risk**: `create_all` is **add-only** — it never alters or drops columns. Any column rename/type change will silently not apply in production.
- **Fix**: Wire up Alembic (already in `requirements.txt`) before the next schema change.

### ERR-005: Real secrets sit in the working-tree `.env`
- **Location**: `.env` (project root)
- **Status**: Gitignored and never committed ✅ — but the file holds live `GOOGLE`/`OPENAI`/`CLAUDE`/`TAVILY` keys in plaintext.
- **Fix**: Treat as live secrets — don't paste the file into chats/screenshots; rotate any key that has been shared. Railway Variables are the production source of truth.

### ERR-006: Native session persistence missing
- **Location**: `context/AuthContext.tsx`
- **Actual**: Session persists on web via `localStorage`; a native (iOS/Android) cold start loses it and bounces the user to `/auth`.
- **Fix**: Install `@react-native-async-storage/async-storage` (needs approval per AGENTS.md) and persist the session there.

---

## 🟡 Code Quality

### ERR-007: Monolithic screen files
- **Location**: `app/index.tsx` (1905 lines), `app/report.tsx` (1194), `app/loading.tsx` (781)
- **Issue**: Sub-components (scenes, cards, bubbles, dashboard widgets) are still inline; `components/` holds only unused Expo scaffold.
- **Fix**: Extract reusable pieces into `components/` per the `add-component.md` skill.

### ERR-008: `any` types on inline component props
- **Location**: inline components in `report.tsx` / `index.tsx`
- **Rule**: AGENTS.md — "No `any` types unless communicating with untyped legacy APIs."
- **Fix**: Define prop interfaces. (`services/types.ts` already exists — reuse it.)

### ERR-009: Missing `accessibilityLabel` on icon-only buttons
- **Location**: back buttons / action buttons across screens
- **Fix**: Add descriptive labels to every icon-only `TouchableOpacity`.

### ERR-010: No automated tests
- **Location**: whole repo — no test runner wired up
- **Fix**: Cover `backend/app/scoring.py`, `services/api.ts`, and the auth flow. Adding a runner needs approval (AGENTS.md).

---

## 🔵 Inconsistencies & Dead Artifacts

### ERR-011: Asset filename typo
- **File**: `assets/images/vibeinevst-logo.gif` (should be `vibeinvest`)
- **Referenced**: `app/_layout.tsx:76` — `require('../assets/images/vibeinevst-logo.gif')`
- **Fix**: Rename the file and update the `require` path together.

### ERR-012: Empty `google-adk-agent/` directory
- **Status**: Empty and gitignored. The planned Google ADK agent was never built — the real backend is `backend/` (FastAPI).
- **Fix**: Delete the empty directory, or repurpose it; update any docs that still reference it.

### ERR-013: Spec docs describe a planned, not actual, architecture
- **Files**: `README.md`, `ROADMAP.md`, `FEATURES.md`, `PHASES.md`
- **Issue**: They still describe Next.js 15 + Google ADK + an `api/` SDK-runner layer. The real stack is Expo + a FastAPI `backend/`. `CLAUDE.md` already documents this gap.
- **Fix**: Update the spec docs to match the shipped architecture.

### ERR-014: Unused Expo scaffold
- **Files**: `components/*` and `hooks/*` are untouched Expo defaults, imported by no screen.
- **Fix**: Remove or repurpose during the component-extraction work (ERR-007).

### ERR-015: Orphan pre-migration analyses
- **Location**: `analyses` rows with `user_id = NULL`
- **Status**: Created before per-user scoping; invisible to every user. Left in place by design (log-012).
- **Fix**: Optional — backfill an owner or delete.

### ERR-016: Handoff screen not in PRD nav map
- **PRD**: `Loading → Report`. **Actual**: `Loading → Handoff → Report`.
- **Assessment**: Intentional narrative enhancement — update the PRD to match.

---

## ⚙️ Known Dev Gotchas (not bugs — workflow notes)

- **Stale uvicorn worker** — after editing backend route signatures, a running worker serves old code and returns confusing 500s. Restart: `lsof -ti :8000 | xargs kill -9 && ./backend/run.sh`.
- **FastAPI route order** — static suffixes (`/{id}/pdf`) must be declared **before** generic `/{id}` params or the generic route wins (caused a 404; fixed in log-010).
- **`EXPO_OFFLINE` not exported** — declaring it in `.env` isn't enough for the Expo CLI child process; export it or prefix the command.
- **Expo env re-inlining** — after changing `EXPO_PUBLIC_*` vars, run `npx expo start -c` once so the new value is re-inlined.
- **Node version** — Node 18 lacks `Array.prototype.toReversed`; use Node 20 LTS (`npm run web` crashes otherwise).
