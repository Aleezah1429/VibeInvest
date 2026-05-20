# Backend Plan — VibeInvest

> **Status**: approved 2026-05-19. Building today's half-day cut.
> **Last updated**: 2026-05-19
> **Builds on**: [PRD.md](./PRD.md), [PLAN.md](./PLAN.md), [../traces/outcomes.md](../traces/outcomes.md)

---

## 0. Decisions (locked 2026-05-19)

| # | Decision | Choice |
|---|---|---|
| 1 | Agent framework | **Option A — plain SDK with Claude** |
| 2 | LLM provider | **Claude (primary)** + Gemini adapter scaffolded for side-by-side comparison (tomorrow) |
| 3 | Web search | **Tavily** for dev (free tier) → Google API later |
| 4 | Endpoint name | **Renamed** from `/api/run/google-adk` → `/api/analyses` |
| 5 | Database | **SQLite today** (zero infra) → **Postgres tomorrow** (same SQLAlchemy code, swap connection string) |
| 6 | Recent reports | **Real, today** — `GET /api/analyses?limit=10` wired into search screen |

## 0a. Today's half-day cut (locked)

Shipping today (~4 hours):
- ✅ FastAPI backend with SQLite, SQLAlchemy 2.0, Alembic
- ✅ All 4 agents running on Claude with Tavily search
- ✅ Orchestrator runs them sequentially in a background task; each step persists
- ✅ Real Aura score + verdict + dimension scores + per-agent findings
- ✅ Mobile app calls real backend; loading screen polls for completion; report screen shows real data
- ✅ Real recent reports list on search screen

Deferred to tomorrow:
- ⏸ Postgres swap (one connection string change + run migrations)
- ⏸ Gemini provider activation (adapter exists, just flip the flag)
- ⏸ Real SSE streaming (today polls; needs `react-native-sse` install which needs your approval per AGENTS.md)
- ⏸ Error polish (timeouts, reconnect, user-visible error states)

---

## 1. Goal in one paragraph

User types a startup name in the Expo app → backend runs four agents in sequence (Skeptic → Munshi → Hype → CVO). Each agent's input, output, and intermediate evidence is persisted. While they run, the backend streams progress events to the app over Server-Sent Events (SSE) so the Loading + Handoff screens become real instead of timer-driven. When the chain finishes, the backend writes a final report row and emits a `pipeline_complete` event whose payload matches the `ReportData` shape the Report screen already expects. The user can later open past analyses by ID and the same payload is returned without re-running the agents.

---

## 2. High-level architecture

```
┌──────────────────────────┐         ┌────────────────────────────────────────┐
│  Expo app (existing)     │         │  Backend (new — to build)              │
│                          │         │                                        │
│  search.tsx              │  POST   │  POST /api/analyses                    │
│   └─ "Run Due Diligence" │ ──────▶ │   creates analysis row, returns id     │
│                          │         │                                        │
│  loading.tsx             │   SSE   │  GET  /api/analyses/{id}/stream        │
│   └─ EventSource         │ ◀────── │   emits agent_start/agent_text/        │
│  handoff.tsx             │         │   pipeline_complete                    │
│                          │         │                                        │
│  report.tsx              │  GET    │  GET  /api/analyses/{id}               │
│   └─ render ReportData   │ ──────▶ │   returns persisted final report       │
│                          │         │                                        │
│  search.tsx recent list  │  GET    │  GET  /api/analyses?limit=10           │
│                          │ ──────▶ │   returns recent analyses              │
└──────────────────────────┘         │                                        │
                                     │  ┌──────────────────────────────────┐  │
                                     │  │ Orchestrator                     │  │
                                     │  │  Agent1 → Agent2 → Agent3 →Agent4│  │
                                     │  │  each step persists output       │  │
                                     │  └──────────────────────────────────┘  │
                                     │            │                           │
                                     │            ▼                           │
                                     │     SQLite (analyses, agent_runs,      │
                                     │              raw_evidence, events)     │
                                     └────────────────────────────────────────┘
                                              │
                                              ▼
                                     external: LLM API + web-search API
```

---

## 3. Stack decisions (these need your sign-off)

The PRD already commits to FastAPI + SSE + Google ADK. I'm flagging the ones I'd recommend revisiting.

| Concern | PRD says | My recommendation | Why |
|---|---|---|---|
| Web framework | FastAPI + `sse-starlette` | **Keep** | Async-native, SSE library is one import, types via Pydantic match our `ReportData`. |
| Agent framework | Google ADK | **Reconsider — see §3a** | ADK is Gemini-only and adds learning overhead. Plain LLM-with-tools may be simpler for 4 sequential agents. |
| LLM provider | (unstated) | **Decide — see §3a** | Drives cost, latency, and which SDK we install. |
| Web-search tool | (unstated) | **Tavily** (free tier, JSON-clean results) or **SerpAPI** (richer, paid) | Agent 1 needs web access. Avoid raw scraping. |
| Database | Firestore listed out-of-scope | **SQLite via SQLModel** | One file, zero infra, async-friendly. Swap to Postgres later if needed. |
| Streaming | SSE | **Keep** | PRD-aligned. RN needs a polyfill — `react-native-sse` is the standard answer. |
| Mobile → backend reach | (unstated) | **Expo dev tunnel + local FastAPI** | Avoids LAN-IP hardcoding during dev. Deploy to Render/Fly later. |

### 3a. Agent framework — three realistic options

Pick one. This is the biggest decision in the plan.

**Option A — Plain LLM SDK with tool use (recommended for v1)**
- One SDK (Anthropic *or* OpenAI *or* Gemini). One file per agent. Orchestrator is a `for` loop.
- Pros: nothing exotic; full control over prompts, retries, streaming, persistence; easiest to debug.
- Cons: you write the orchestration yourself (~100 lines).

**Option B — Google ADK (what the PRD says)**
- Gemini-only. Built-in multi-agent + tool primitives.
- Pros: matches the PRD endpoint name; less orchestration code.
- Cons: Gemini lock-in; the `google-adk-agent/` directory is empty, so you're starting from zero examples; ADK's SSE shape may not map cleanly to our event names.

**Option C — LangGraph**
- Provider-agnostic graph of agent nodes with built-in state + checkpointing.
- Pros: persistence/replay come for free; clean visualisation of the pipeline.
- Cons: another framework to learn; overkill for a strictly sequential 4-step chain.

> **My pick: Option A with Anthropic Claude (Sonnet 4.6 for agents 1–3, Opus 4.7 for CVO synthesis).** You can rename the endpoint from `/api/run/google-adk` to `/api/analyses` so we're not lying about the implementation.

---

## 4. Data model (SQLite tables)

```sql
-- One row per user-initiated analysis.
analyses(
  id              TEXT PRIMARY KEY,        -- ulid
  startup_name    TEXT NOT NULL,
  intent          TEXT,                    -- invest | acquire | research | partner
  sector          TEXT,
  stage           TEXT,
  context         TEXT,
  status          TEXT NOT NULL,           -- queued | running | completed | failed
  score           INTEGER,                 -- final Aura score, null until done
  verdict         TEXT,                    -- INVEST | WATCH | PASS | ACQUIRE
  verdict_sub     TEXT,                    -- e.g. "WITH CONDITIONS"
  report_json     TEXT,                    -- full ReportData blob (denormalized)
  error           TEXT,                    -- populated if status=failed
  created_at      DATETIME NOT NULL,
  completed_at    DATETIME
)

-- One row per agent execution within an analysis.
agent_runs(
  id              TEXT PRIMARY KEY,
  analysis_id     TEXT NOT NULL REFERENCES analyses(id),
  agent_id        INTEGER NOT NULL,        -- 1..4
  agent_name      TEXT NOT NULL,           -- skeptic | munshi | hype | cvo
  status          TEXT NOT NULL,           -- running | done | failed
  input_summary   TEXT,                    -- what was handed in from prev agent
  output_text     TEXT,                    -- the agent's narrative body
  findings_json   TEXT,                    -- [{ text, type }]
  badge           TEXT,                    -- short verdict per agent
  started_at      DATETIME NOT NULL,
  completed_at    DATETIME
)

-- Raw evidence Agent 1 collects so later agents (and you) can audit it.
raw_evidence(
  id              TEXT PRIMARY KEY,
  analysis_id     TEXT NOT NULL REFERENCES analyses(id),
  source          TEXT,                    -- url or "search:<query>"
  kind            TEXT,                    -- news | profile | funding | social
  content         TEXT,
  fetched_at      DATETIME NOT NULL
)

-- Append-only event log so SSE can be replayed if the client reconnects.
events(
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  analysis_id     TEXT NOT NULL REFERENCES analyses(id),
  type            TEXT NOT NULL,           -- pipeline_start | agent_start | ...
  payload_json    TEXT NOT NULL,
  created_at      DATETIME NOT NULL
)
```

The `report_json` blob is denormalized on purpose — the Report screen reads it as-is, so we avoid recomputing joins on every load.

---

## 5. API surface

```
POST   /api/analyses                  → { id }                        # kicks off a run
GET    /api/analyses/{id}/stream      → text/event-stream             # SSE for loading screen
GET    /api/analyses/{id}             → ReportData                    # for report screen / history
GET    /api/analyses?limit=10         → [{ id, name, score, ... }]    # for "recent reports"
DELETE /api/analyses/{id}             → 204                           # optional
```

**POST request body** matches PRD's `StartupQuery`:
```json
{ "name": "Bykea", "intent": "invest", "sector": "Mobility", "stage": "Series A", "context": "..." }
```

**SSE event types** (PRD-specified, fleshed out):

| Event | When | Payload |
|---|---|---|
| `pipeline_start` | Immediately after POST returns | `{ analysis_id, agents: [...] }` |
| `agent_start` | Each agent begins | `{ agent_id, agent_name }` |
| `tool_call` | Agent invokes a tool (search, fetch) | `{ agent_id, tool, args }` |
| `agent_text` | Streaming tokens from the agent | `{ agent_id, delta }` |
| `agent_complete` | Agent finishes, output saved | `{ agent_id, findings, badge }` |
| `pipeline_complete` | All 4 done, report built | `ReportData` (PRD shape) |
| `error` | Any failure | `{ agent_id?, message }` |

If the mobile app disconnects mid-run, it can reconnect to the same `/stream` URL and the server replays events from the `events` table.

---

## 6. The four agents

Each agent is a function: `(input: AgentInput) -> AgentOutput`. The orchestrator hands the previous agent's output (and the persisted raw evidence) to the next.

### Agent 1 — Skeptic (data gatherer + red-flag finder)
- **Tools**: `web_search(query)`, `fetch_url(url)`.
- **Job**: search the startup name, founder names, news, funding announcements. Save everything to `raw_evidence`. Identify factual basis + red flags (lawsuits, layoffs, pivots).
- **Output**: structured `{ company_profile, recent_news[], red_flags[], findings[] }` + a narrative `body`.
- **Persisted to**: `agent_runs` row, plus N `raw_evidence` rows.

### Agent 2 — Munshi (financial analyst)
- **Tools**: none (reads Agent 1's evidence). Optional: a numeric calculator.
- **Job**: extract financial signals — valuation, GMV, burn, runway, revenue if available. Score the "Financials" dimension.
- **Output**: `{ metrics[], financial_score, findings[], body }`.

### Agent 3 — Hype (brand/market analyst)
- **Tools**: `web_search` (for press, social presence). Reuses Agent 1 evidence too.
- **Job**: assess brand strength, market sentiment, competitive position. Score "Market" and "Brand" dimensions.
- **Output**: `{ market_score, brand_score, sentiment, findings[], body }`.

### Agent 4 — CVO (synthesizer)
- **Tools**: none.
- **Job**: read all three prior agent outputs, compute the final **Aura Score (0–1000)**, pick a verdict (`INVEST` / `WATCH` / `PASS` / `ACQUIRE`), score "Strategy" dimension, write the final summary. Build the `ReportData` blob.
- **Output**: full `ReportData`, persisted to `analyses.report_json` and emitted as `pipeline_complete`.

Scoring formula (starting point — tune later):
```
score = round(
  0.30 * market_score +
  0.25 * financial_score +
  0.20 * brand_score +
  0.25 * strategy_score
) * 10                                     # bring to 0–1000 scale
```

---

## 7. Backend file structure (proposed)

```
backend/
  pyproject.toml
  .env.example                  # ANTHROPIC_API_KEY, TAVILY_API_KEY
  app/
    main.py                     # FastAPI app + routes
    config.py                   # env loading
    db.py                       # SQLModel engine + session
    models.py                   # Analysis, AgentRun, RawEvidence, Event
    schemas.py                  # Pydantic: StartupQuery, ReportData, AgentReport
    sse.py                      # event bus + replay helper
    routes/
      analyses.py               # POST/GET/DELETE handlers
      stream.py                 # /stream SSE endpoint
    agents/
      base.py                   # shared agent interface + LLM client wrapper
      skeptic.py
      munshi.py
      hype.py
      cvo.py
      tools.py                  # web_search, fetch_url
    orchestrator.py             # run_pipeline(analysis_id) coroutine
    scoring.py                  # aura_score(...) → int, verdict(...) → str
```

Frontend additions (`/Users/a.jogiat/Desktop/code/VibeInvest`):

```
services/
  api.ts                        # fetch wrappers + SSE subscribe()
  types.ts                      # mirror of backend schemas.py (StartupQuery, ReportData, ...)
```

---

## 8. Build order (phased)

Each phase is independently demoable. Don't start a phase until the previous one runs end-to-end.

### Phase 0 — Decisions (you, ~30 min)
Pick the open items in §11. No code yet.

### Phase 1 — Skeleton (~half day)
1. Scaffold `backend/` with FastAPI, SQLModel, a `/health` route, and the four tables.
2. Implement `POST /api/analyses` (writes a row, returns id, runs nothing yet).
3. Implement `GET /api/analyses/{id}` returning the row.
4. Implement `GET /api/analyses?limit=10`.
5. Verify with `curl`. **No agents involved.**

### Phase 2 — One real agent, no streaming (~half day)
1. Implement `tools.py` (Tavily search wrapper).
2. Implement `agents/skeptic.py` end-to-end against a fixed startup name.
3. From `POST /api/analyses`, synchronously run Skeptic and persist its output.
4. `GET /api/analyses/{id}` now returns Skeptic's findings.
5. Verify with `curl`. **One agent, no SSE, no UI.**

### Phase 3 — Full chain, still no streaming (~1 day)
1. Implement Munshi, Hype, CVO.
2. Implement `orchestrator.py` running them in sequence, persisting each step.
3. Implement `scoring.py`.
4. `POST /api/analyses` returns immediately; orchestrator runs in a background task.
5. Poll `GET /api/analyses/{id}` until `status=completed`. Inspect `report_json`.

### Phase 4 — SSE (~half day)
1. Implement event bus: orchestrator writes to `events` table + in-memory pub/sub.
2. Implement `GET /api/analyses/{id}/stream` with `sse-starlette`, with replay-from-DB on reconnect.
3. Verify with `curl -N`.

### Phase 5 — Mobile wiring (~1 day)
1. Install `react-native-sse`, add `services/api.ts` and `services/types.ts`.
2. `search.tsx`: replace navigation with `POST /api/analyses` → push `/loading?id=...`.
3. `loading.tsx`: subscribe to `/stream`, drive scene transitions from `agent_start`/`agent_complete`.
4. `handoff.tsx`: feed real `agent_text` deltas into the chat bubbles.
5. `report.tsx`: read `ReportData` from route params (passed by loading on `pipeline_complete`).
6. Add a recent-reports fetcher to `search.tsx`.
7. **Verify on a real device or simulator.**

### Phase 6 — Errors + polish (~half day)
1. Error event → user-visible error state on loading screen.
2. Connection drop → reconnect to `/stream`, replay missed events.
3. Timeout per agent (e.g. 90s) with retry-once policy.
4. `KeyboardAvoidingView` on search.

---

## 9. Mobile ↔ backend glue

- **During dev**: run FastAPI on `http://localhost:8000`. Use Expo dev tunnel so the device can reach it: `npx expo start --tunnel` and set `API_BASE_URL=https://<tunnel-host>`. Avoids hardcoding LAN IPs.
- **Config**: a single `EXPO_PUBLIC_API_BASE_URL` env var in `.env`, read in `services/api.ts`.
- **Types**: `services/types.ts` is hand-mirrored from `backend/app/schemas.py`. If we add many endpoints later, generate it from the FastAPI OpenAPI schema with `openapi-typescript`.

---

## 10. What's out of scope (intentionally)

These are not in v1. Don't slip them in.

- Auth, user accounts, multi-tenant data.
- Hosting/deploy. Local + tunnel only until the app works end-to-end.
- Real Crunchbase / paid data sources. Tavily + LLM judgement only.
- PDF export of the report. UI button stays as a no-op placeholder.
- Background re-analysis or scheduled refreshes.
- Caching identical startup names (each POST starts a fresh run).
- Cost/usage tracking.

---

## 11. Decisions I need from you before Phase 1

1. **Agent framework** (§3a): Option A (plain SDK), B (Google ADK), or C (LangGraph)?
2. **LLM provider**: Anthropic Claude, OpenAI, or Gemini?
3. **Web-search tool**: Tavily (free tier, recommended), SerpAPI, or Brave Search?
4. **Endpoint name**: keep PRD's `/api/run/google-adk` or rename to `/api/analyses`?
5. **Database**: SQLite (recommended) or jump straight to Postgres?
6. **Recent reports**: enable for real (Phase 5) or keep the hardcoded Bykea/Bazaar list for now?

Once these are answered I'll start with Phase 1 — and only Phase 1 — and come back for review before continuing.
