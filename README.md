# VibeInvest

**Type any startup name. Get an investor-grade due-diligence report in ~60 seconds.**

VibeInvest is an Expo (Android/web) + FastAPI application powered by a four-agent pipeline. A user enters a startup name (optionally with a pitch-deck PDF, sector, stage, funding hint, and free-form context); four AI agents — **The Skeptic**, **The Munshi**, **The Hype**, and **The CVO** — run sequentially, share evidence, and synthesise a single **Aura Score (0–1000)** and a verdict of `INVEST · WATCH · REJECT · ACQUIRE`. The full report is persisted and exportable as a styled PDF.

# APK
https://expo.dev/accounts/aleezah1429/projects/VibeInvestApp/builds/8a3b8f9c-9392-417d-9e29-22dc8c580a34 

---

## 1. Overview

### What it does
Investors, acquirers, and VCs normally spend hours per deal reading decks, hunting funding announcements, and tracking competitor signals before a first meeting. VibeInvest collapses that pre-screen into one text input:

1. The user signs in (email/password or Google).
2. They type a startup name (optionally with a PDF deck and structured hints) on the dashboard or `/search` screen.
3. The backend creates an analysis row, kicks off a background job, and returns the new ID.
4. Four LLM-backed agents run in sequence against a shared evidence pool.
5. The client polls until the run is `completed`, then renders the score, breakdowns, agent briefs, and a downloadable PDF.

### Design philosophy
- **One screen, one answer.** The product is built around the score + verdict; everything else is one tap deeper.
- **Cheap to run, easy to deploy.** Single FastAPI service. SQLite in dev, Postgres in prod via the same code.
- **Evidence-first agents.** Every web search and every PDF page the agents see is persisted to `raw_evidence` so the output is auditable.

---

## 2. Architecture

```
┌────────────────────────────────────────────┐        ┌──────────────────────────────────────────┐
│  Expo Router app (Android / Web)           │        │  FastAPI backend (backend/app)           │
│                                            │        │                                          │
│  app/auth.tsx        ──── POST /api/auth/* ├───────▶│  routes/auth.py                          │
│  app/index.tsx       ──── GET  /api/analyses/recent │  routes/analyses.py                      │
│  app/search.tsx      ──── POST /api/analyses (multi)│   (multipart: name + optional PDF)       │
│  app/loading.tsx     ──── poll GET /api/analyses/id │                                          │
│  app/report.tsx      ──── GET  /api/analyses/{id}   │   ┌──────────────────────────────────┐   │
│                      ──── GET  /api/analyses/{id}/pdf   │ orchestrator.run_pipeline()      │   │
│                                            │        │   │ Skeptic → Munshi → Hype → CVO    │   │
│  services/api.ts        (fetch wrapper +   │        │   └──────────────────────────────────┘   │
│   localStorage Bearer token on web)        │        │                │                         │
│  context/AuthContext.tsx (session, 401)    │        │                ▼                         │
│  context/ReportsContext.tsx (dashboard)    │        │   SQLAlchemy 2.x ORM                     │
│  context/ToastContext.tsx (global toasts)  │        │   users · analyses · agent_runs ·        │
│                                            │        │   raw_evidence                           │
│                                            │        │                                          │
│                                            │        │   pdf_parser.py / pdf_generator.py       │
│                                            │        │   agents/tools.py ── Tavily search       │
│                                            │        │   agents/base.py  ── Anthropic Claude    │
│                                            │        │   services/google_auth.py ── Google OAuth│
│                                            │        │   services/auth.py ── PBKDF2 + HMAC JWT  │
└──────────────────────────────────────────┬─┘        └──────────────────────────────────────────┘
                                           │
                                           ▼
                              ┌──────────────────────────┐
                              │  External services        │
                              │  ─ api.anthropic.com      │ (Claude Sonnet 4.5 / Opus 4.5)
                              │  ─ api.tavily.com/search  │ (web search)
                              │  ─ oauth2.googleapis.com  │ (Google ID-token verification)
                              │  ─ Neon Postgres          │ (managed DB in prod)
                              └──────────────────────────┘
```

---

## 3. Agents Developed

Four cooperating LLM agents run sequentially: **Skeptic** (market & competition) → **Munshi** (financials) → **Hype** (brand & sentiment) → **CVO** (synthesis + final verdict). Each agent persists its own findings and hands off to the next.

> **Reference:** [.agents/specs/AGENT_SPECS.md](.agents/specs/AGENT_SPECS.md) — full per-agent prompts, JSON schemas, tools, scoring weights, and the hand-off graph.

---

## 4. APIs Used

We use three real external APIs. **Nothing is mocked in normal operation** — every call goes to the live provider.

| API | What it does | How we authenticate |
|---|---|---|
| **Anthropic Claude** | Powers every agent's reasoning. Sonnet 4.5 for agents 1–3, Opus 4.5 for the CVO. | `CLAUDE_API_KEY` env var, official `anthropic` Python SDK |
| **Tavily Search** | Live web search for the Skeptic (4 queries per run) and the Hype (2 queries). | `TAVILY_API_KEY` sent in the request body |
| **Google OAuth2** | Verifies the Google ID token when a user signs in with Google. | The user's Google ID token is sent to `oauth2.googleapis.com/tokeninfo` |

> **Reference:** [.agents/specs/API.md](.agents/specs/API.md) — full request/response shapes for every internal `/api/*` endpoint.

---

## 5. Integrations Implemented

| Integration | What it does |
|---|---|
| **Anthropic SDK** | Backend → Claude. The shared `LLMClient` formats each agent's prompt, posts to `messages.create`, and parses the JSON reply. |
| **Tavily HTTP** | Backend → Tavily. Search results are saved to `raw_evidence` so later agents (and users) can audit what the LLM saw. |
| **Expo Document Picker** | Client → Backend. Lets the user attach a pitch-deck PDF; backend extracts the text with `pypdf` and stores it as evidence. |
| **Expo Print + Sharing** | Client-side. Wired in for share-sheet flows on the report screen. |
| **Neon Postgres** | Backend → Postgres in prod (free, persistent). SQLAlchemy normalises the legacy `postgres://` scheme and enables connection pooling. |

---

## 6. Data Schemas

There are four tables; everything else is derived from them:

- **`users`** — the account (email, hashed password, optional `google_id`).
- **`analyses`** — one row per due-diligence run (startup name, intent, status, final score, verdict, denormalised `report_json`).
- **`agent_runs`** — one row per agent execution within an analysis (agent ID, badge, narrative output, findings).
- **`raw_evidence`** — every web search result and PDF page the agents consumed.

An analysis owns its agent runs and evidence (cascade-delete). The full `ReportData` JSON blob lives on `analyses.report_json` so the report screen and PDF endpoint can render without joining.

> **Reference:** [.agents/specs/DATA_SCHEMAS.md](.agents/specs/DATA_SCHEMAS.md) — every column, every Pydantic shape, and the TypeScript mirror.

---

## 7. Tools & Technologies

**Frontend** — Expo SDK 54, React 19, React Native 0.81, Expo Router 6 (file-based, typed routes), TypeScript 5.9 (strict). Picked for one codebase across Android, iOS, and web; React Compiler experiment is on to skip most memoisation boilerplate.

**Backend** — FastAPI ≥ 0.115, Uvicorn, SQLAlchemy 2.0, Pydantic 2.7, Anthropic SDK, httpx, pypdf, reportlab, python-multipart, python-dotenv, psycopg2-binary, alembic. Picked for async-native HTTP, free OpenAPI docs, and a clean SQLite → Postgres swap via the same code.

**Hosting** — Back4App Containers (Docker from GitHub, free, no card) for the backend, Neon Postgres in prod (free, persistent), Expo EAS for native builds. See [backend/DEPLOY_BACK4APP.md](backend/DEPLOY_BACK4APP.md).

---

## 8. Core Logic — The Aura Score

The product's unique mechanism is the **Aura Score**: a single 0–1000 number that fuses four agent verdicts into one decision. Source: [backend/app/scoring.py](backend/app/scoring.py).

```python
def aura_score(market_fit, financials, brand_power, strategy) -> int:
    weighted = 0.30 * market_fit + 0.25 * financials + 0.20 * brand_power + 0.25 * strategy
    return max(0, min(1000, round(weighted * 10)))
```

Each input is the 0–100 score produced by one agent: `market_fit` (Skeptic), `financials` (Munshi), `brand_power` (Hype), `strategy` (CVO). Weights are intentionally market-heavy (30%) because TAM + competitive position is the most decision-shaping signal for an early-stage pre-screen.

### Verdict semantics
The CVO picks exactly one of:

- **`INVEST`** — strong overall. Go for it.
- **`WATCH`** — promising but risky. Revisit later.
- **`REJECT`** — not now.
- **`ACQUIRE`** — only when the user's intent is `acquire` and the target is a strong strategic fit.

---

## 9. Setup & Installation

### Prerequisites
- Node 20+ with npm (or yarn 1.22+) for the Expo app
- Python 3.10+ (3.12 tested) for the backend
- An Anthropic Claude key, a Tavily key, and (optional) a Google API key

### 1. Install

```bash
git clone https://github.com/Aleezah1429/VibeInvest.git
cd VibeInvest

# Frontend deps
npm install

# Backend deps
cd backend
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt
cd ..
```

### 2. Configure env

The backend's `config.py` loads `.env` from the **repo root** (not `backend/`):

```bash
cp backend/.env.example .env
# then edit .env and set:
#   CLAUDE_API_KEY=sk-ant-…
#   TAVILY_API_KEY=tvly-…
#   SECRET_KEY=$(python -c "import secrets; print(secrets.token_hex(32))")
#   # optional: DATABASE_URL=postgresql://... for Postgres
```

For the frontend to talk to a non-localhost backend:
```env
EXPO_PUBLIC_API_BASE_URL=https://your-backend.b4a.run
```

### 3. Run

```bash
# Backend (from repo root)
./backend/run.sh
curl http://127.0.0.1:8000/health      # {"status":"ok"}

# Frontend (separate terminal)
npm run web          # browser
npm run android      # Android emulator
npm run ios          # iOS simulator (if available)
npm run lint
```

### 4. Production
See [backend/DEPLOY_BACK4APP.md](backend/DEPLOY_BACK4APP.md) for the Back4App + Neon runbook (free, no credit card).

---

## 10. Privacy & Security Notes

We store passwords as PBKDF2-SHA256 hashes (100k iterations, per-user salt) and sign sessions with an HMAC-SHA256 token whose `SECRET_KEY` **must** be overridden via env var in production. Every read/write under `/api/analyses` is scoped to the calling user, and cross-user access returns 404. The startup name, any context, and PDF text are sent to Anthropic and Tavily for processing — treat anything you paste in as shared with those providers.

---

## 11. Cost & Latency

A typical run takes **~40–90 s** end-to-end (four sequential Claude calls + ~6 Tavily searches) and costs roughly **$0.05–$0.20 in API spend** (Anthropic + Tavily combined). Tavily's free tier covers ~166 analyses/month; Anthropic's per-tier RPM caps the practical concurrency around ~25 runs.

---

## 12. Scalability

The backend is a single FastAPI process today. To scale: run more Uvicorn workers, move the pipeline off `BackgroundTasks` onto a real worker (Celery/Arq + Redis), and run more stateless container replicas. The DB is already Postgres in prod (Neon), so the data layer scales independently.

### Known bottlenecks
1. **In-process pipeline.** Each analysis holds one background task slot for ~60 s; concurrent runs queue up behind it.
2. **Polling overhead.** Every active client polls every 2 s — fine for tens of users, wasteful at hundreds. Switch to SSE.
3. **LLM/search latency floor.** Four sequential Claude calls + Tavily searches set the wall time; horizontal scaling can't beat it. Parallelising Hype's search with Skeptic's and caching identical startup names would cut ~10–15 s.
4. **No retries.** A single flaky LLM/search call fails the whole run.

---

## 13. Robustness

The pipeline keeps producing a usable report even when individual pieces misbehave. A few examples already handled in code:

- **Web search fails or returns nothing** — the agent still runs against the rest of the evidence; the report is generated with whatever was available.
- **The LLM returns messy or non-JSON output** — code fences and stray prose are stripped before parsing, so a slightly malformed reply still works.
- **The CVO picks an unknown verdict** — it's safely defaulted to `WATCH` so the report always has a valid label.
- **Scores come back out of range** — clamped to their allowed bounds (0–100 per agent, 0–1000 total).
- **The uploaded pitch deck can't be read** — the pipeline continues without it instead of failing.
- **A past report row is corrupted** — the dashboard skips that one row rather than breaking the whole list.
- **Anything else blows up mid-pipeline** — the run is marked `failed` with a clear error message, not a 500.
- **A session token expires** — the app catches it, signs the user out, and sends them back to the login screen automatically.
- **Someone tries to access another user's report** — the API returns "not found" rather than revealing which IDs exist.

What's **not** covered yet: automatic retries on Anthropic/Tavily errors, enforced per-agent timeouts, and live streaming reconnect — see [§15 Limitations](#15-limitations).

---

## 14. Baseline Comparison

| Dimension | Baseline (manual pre-screen) | VibeInvest |
|---|---|---|
| **Time per startup** | 30–120 min (Crunchbase + news + LinkedIn + deck) | **40–90 s** end-to-end |
| **Cost per startup** | Analyst time at $50–200/hr → **$25–$200** | **~$0.05–$0.20** in API spend |
| **Consistency** | Varies by analyst and mood | Same prompts and scoring formula every run |
| **Output** | Notes doc, email, or nothing | Persisted DB rows + a styled PDF + a dashboard tile |
| **Auditability** | Mental | `raw_evidence` keeps every search result and PDF page |

The trade-off: VibeInvest's outputs are **opinions formed from public web text**, not authoritative private data. It replaces the analyst's *first hour*, not their *final hour*.

---

## 15. Limitations

### Rough edges
- **No native session persistence.** Cold launches on Android/iOS force a re-sign-in.
- **`PIPELINE_TIMEOUT_SEC` / `AGENT_TIMEOUT_SEC` are read but not enforced** — long Claude/Tavily hangs block the slot until the underlying SDK's own timeout fires.
- **No retries** on LLM or search calls; a single transient error fails the whole analysis.
- **Alembic is installed but unused.** Non-additive schema changes will silently no-op.
- **Wide-open CORS** (`allow_origins=["*"]`) is a deploy footgun once the API is public.

### Not yet supported
- Real-time streaming UI (SSE).
- Side-by-side startup comparison.
- Search / filter past analyses.
- Multi-language prompts (English-only today; the Munshi is PKR-flavoured).
- Crunchbase / PitchBook / private data integration.
- Scheduled re-analysis.
- Per-user cost & usage reporting.

---

*See [AGENTS.md](AGENTS.md) for the coding standards and "never without approval" list.*
