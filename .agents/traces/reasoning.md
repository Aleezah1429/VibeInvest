# Reasoning — Design Decisions & Rationale

> **Trace ID**: `f3d9c2e1-8a47-4b6e-bf52-1c9e0d4a7b38`
> **Generated**: 2026-05-21
> **Supersedes**: trace `892ab532-e0ea-41be-80ee-7dfb0abfa3b5` (2026-05-17)

> The 2026-05-17 trace described a UI-only demo shell. Several of its decisions
> (hardcoded data, fake timer, no service layer) have since been **reversed** as
> the real backend landed. Those reversals are noted inline.

---

## Decision 1: Real backend over hardcoded data  *(reverses 05-17 Decision 1)*

**What**: The app now performs real analysis. `createAnalysis()` POSTs to the FastAPI backend, which runs the 4-agent pipeline and returns a live `ReportData`.

**Why**: A hardcoded demo can only ever show one startup. Once the backend pipeline and Aura Score scoring were stable, wiring the app to it made every screen functional for any input — the difference between a pitch demo and a usable product.

**Trade-off**: The app now depends on a reachable backend and valid LLM keys. A deterministic offline demo is no longer guaranteed; network and pipeline failures are real failure modes (mitigated by the toast system — Decision 8).

---

## Decision 2: Request/poll over SSE  *(reverses 05-17 Decision 3)*

**What**: The PRD specified an SSE stream. The implementation instead POSTs an analysis, then `pollAnalysis()` polls `GET /api/analyses/{id}` every 2 s (240 s timeout) until `completed`/`failed`.

**Why**: React Native has no native `EventSource`, and adding an SSE library was avoidable. Polling is trivially correct, survives transient network drops (each poll is independent), and needs no special server framing. The loading screen's 4 agent scenes give the perceived real-time feel while the poll runs underneath.

**Trade-off**: Slightly higher request volume and up to 2 s latency between a status change and the UI reflecting it — negligible for an analysis that takes tens of seconds.

---

## Decision 3: Custom auth crypto over `passlib` / `pyjwt`

**What**: `backend/app/auth.py` implements PBKDF2-SHA256 password hashing and HMAC-SHA256 signed session tokens using only Python's standard library.

**Why**: `AGENTS.md` forbids installing dependencies without approval. `hashlib`, `hmac`, and `secrets` cover password hashing and tamper-proof token signing with no new packages. PBKDF2 is a sound, well-understood KDF; an HMAC-signed token is a legitimate stateless session primitive.

**Trade-off**: Not a standards-compliant JWT — third-party tooling can't validate the token. Acceptable since only this backend issues and verifies it. `SECRET_KEY` must stay stable across deploys or all tokens invalidate (flagged in `DEPLOY.md`).

---

## Decision 4: Server-side PDF (ReportLab) over client HTML-to-PDF

**What**: The investor report PDF is compiled on the backend with ReportLab and streamed from `GET /api/analyses/{id}/pdf`.

**Why**: Server-side generation prints consistently regardless of device, avoids shipping a heavy HTML-to-PDF engine into the RN bundle, and keeps the report layout in one place. The client just downloads (web: real file save; native: `expo-web-browser`/share sheet).

**Trade-off**: PDF rendering depends on the backend being up. Route ordering matters — `/{id}/pdf` must be declared before the generic `/{id}` or FastAPI matches the wrong route (a bug that was hit and fixed, log-010).

---

## Decision 5: Context API for global state over Redux/Zustand

**What**: Auth, reports, and toast state each live in a React Context (`context/AuthContext.tsx`, `ReportsContext.tsx`, `ToastContext.tsx`), nested in `_layout.tsx`.

**Why**: The app has three discrete, mostly-independent slices of global state. Context handles that directly with zero new dependencies (AGENTS.md constraint) and minimal boilerplate. A full state library would be overkill at this scale.

**Trade-off**: No time-travel debugging or middleware. Context re-renders are coarse, but the slices are small and update infrequently, so it isn't a measurable problem.

---

## Decision 6: SQLite for dev, PostgreSQL for production

**What**: Local development runs on SQLite (`backend/data.db`); production runs on Railway-managed PostgreSQL. `config.py:_resolve_database_url()` selects between them; `db.py` has an `IS_SQLITE` gate for engine differences.

**Why**: SQLite needs zero setup for local iteration. Postgres is required for a real deployment — concurrent connections, durability, managed backups. Resolving the URL from `DATABASE_URL`/`POSTGRES_URL` means the same code runs in both environments with no branching at the call site.

**Trade-off**: Two database engines to keep behaviourally compatible. `init_db()` uses `create_all` (add-only) — column renames/type changes need a manual drop or Alembic (already a dependency, not yet wired).

---

## Decision 7: Multipart upload supporting pitch decks

**What**: `POST /api/analyses` accepts `multipart/form-data` with an optional `file`; `pdf_parser.py` (pypdf) extracts deck text and feeds it to the agents.

**Why**: Investors evaluate startups from pitch decks. Letting a user upload the actual deck makes the analysis grounded in real material instead of only the agents' web research.

**Trade-off**: `POST /api/analyses` can't be a plain JSON body — it uses `Form(...)` params. A stale uvicorn worker serving the old JSON-body signature caused confusing 500s during development (log-012).

---

## Decision 8: Glassmorphic toast system for error feedback

**What**: A custom `ToastContext` + `useToast()` renders animated, notch-safe glassmorphic notifications, replacing native `Alert`s across the app.

**Why**: With a real backend, network drops and 500s are real. Silent failures are bad UX; spammy native dialogs are worse. A toast surfaces the problem without blocking. The loading screen escalates intelligently — silent on transient poll failures, a warning toast after 3, an error toast + exit after 8 consecutive.

**Trade-off**: A hand-built notification system to maintain. Justified by AGENTS.md's no-new-deps rule and the polish it adds.

---

## Decision 9: Per-user data scoping via token-decode dependency

**What**: `analyses` carries a `user_id`; a `get_current_user` FastAPI dependency decodes the HMAC token on every analyses route and enforces ownership on GET/PDF/DELETE.

**Why**: Multiple users share one backend; one user's analyses must not be visible to another. Enforcing ownership at the route dependency keeps the check in exactly one place.

**Trade-off**: Pre-migration rows have `user_id = NULL` and are now orphaned (invisible to everyone). The team chose to leave them rather than backfill or delete (log-012).

---

## Decision 10: Web session persistence now, native deferred

**What**: The auth session persists across reloads on web via `localStorage` (`vibe.auth.session`), read synchronously in a `useState` initializer so the first render is already correct. Native persistence is not yet implemented.

**Why**: The immediate demo/test surface was web. `localStorage` needs no dependency; native persistence requires `@react-native-async-storage/async-storage`, an install that needs approval. Web persistence shipped immediately; native was deferred deliberately, not forgotten.

**Trade-off**: A native cold start still drops the session and bounces the user to `/auth`. Documented as the clear next step.

---

## Decision 11: Wide-open CORS during iteration

**What**: `backend/app/main.py` sets `allow_origins=["*"]`.

**Why**: While the frontend's origin keeps changing (Expo web dev port, EAS preview, Railway), pinning origins would cause constant breakage. Wide-open CORS keeps iteration friction-free.

**Trade-off**: Not safe for a public launch. `DEPLOY.md §9` explicitly flags narrowing `allow_origins` to real frontend domains before sharing the URL publicly.

---

## Decision 12: Dark mode only  *(unchanged from 05-17)*

**What**: `DarkTheme` is forced; every screen uses `#09090F`. No light mode.

**Why**: In scope per the PRD; the indigo/lime/gold accent palette is built for a near-black canvas and reads as the product's "analyst" aesthetic.

**Trade-off**: None for v1 — light mode is explicitly out of scope.
