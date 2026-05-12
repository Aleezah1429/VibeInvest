# Tech

The load-bearing stack decisions and the conventions that keep the codebase coherent across three people moving fast.

## Stack

| Layer | Choice | Why |
| --- | --- | --- |
| Frontend framework | Next.js 15 (App Router) + React 19 | Already scaffolded; PWA-installable; SSE consumer story is clean |
| Styling | Tailwind 4 utility-first | Already in stack; no separate CSS files except `globals.css` |
| Export / share | `jspdf` | Already a dep — used for Aura Card PNG and Investor Report PDF |
| Backend framework | FastAPI + `sse-starlette` | Already scaffolded; SSE for live agent streaming |
| Agent runtime | `google-adk` (primary), Anthropic + OpenAI Agents (comparison only) | ADK is what Antigravity uses — judges reward this depth |
| Model — agents | Gemini 2.5 Flash (Skeptic / Munshi / Hype) | Cost-effective for parallel-ish reasoning |
| Model — synthesis | Gemini 2.5 Pro (CVO) | Deeper synthesis warrants the cost on one call per run |
| Multimodal | Gemini vision + audio (Phase 0.5+) | Native, no extra service |
| Storage | **None in MVP** (in-memory only). Firestore in Phase 1. | Persistence is not a 2-day problem. |

Originally proposed Flutter + Firebase in the planning doc — rejected on 2026-05-11 because (a) the agent runners are already wired, (b) Next.js PWA gives mobile installability, (c) saves ~2 days from a 2-day budget.

## Conventions

### Where state lives
- **Run state** (current agent statuses, SSE events) — React state in the page component for MVP. Move to Zustand only when 3+ components need it.
- **Agent output** — accumulated in the same React state as it streams; final report displayed from there.
- **No localStorage / IndexedDB in MVP.** Refresh-and-lose is acceptable for a demo.

### Single boundaries (one file = one side effect)
- **All SSE consumption:** `frontend/lib/sse-client.ts`
- **All `jspdf` calls:** `frontend/lib/share-card.ts` (Aura Card) and `frontend/lib/investor-report.ts` (full PDF)
- **All agent prompts:** `google-adk-agent/<name>_agent.py` — one file per agent, prompt is the module's primary export
- **All agent contracts (JSON schemas):** `google-adk-agent/contracts.py` and mirrored in `frontend/lib/agent-types.ts`
- **All Gemini calls:** behind `google-adk` agents — frontend never calls Gemini directly

### Naming
- Routes — kebab-case (`/upload-hub`, `/aura-audit`)
- Components — PascalCase, one component per file (`AgentCard.tsx`)
- Agent modules — snake_case (`skeptic_agent.py`, `cvo_agent.py`)
- SSE event types — snake_case (`agent_start`, `pipeline_complete`)
- Agent contract keys — snake_case JSON (`aura_score`, `top_fixes`)

## Hard rules (do not break without team agreement)

1. **No agent prompts outside `google-adk-agent/agents/`.** Inline prompts in runners are how prompts drift across debugging sessions.
2. **No direct Gemini calls from the frontend.** Everything goes through the FastAPI SSE endpoint. If we need a quick model call for something else later (e.g., share-card copy), it lives in a new FastAPI route, not in the browser.
3. **Strict JSON from every agent.** No markdown, no preamble. One-shot retry on parse failure, then fail the run with a structured error event.
4. **Output language is a parameter, not a guess.** Pass `output_language: "en" | "ur" | "roman-ur"` explicitly. Agents respect it for free-text fields; JSON keys stay English.
5. **No persistence in MVP.** Anything that survives a refresh waits for Phase 1 (Firestore). Don't sneak `localStorage` in for "convenience."
6. **No new top-level routes without a feature folder.** If you need a new page, there should be a `features/<name>/` spec for it.

## File map

```
specs/                              # Project-level — change rarely
  mission.md                        Why VibeInvest exists
  tech.md                           This file
  roadmap.md                        Phase progress checklist

features/<name>/                    # Per-feature — created before code
  plan.md                           Design (goal, stories, architecture)
  requirements.md                   Engineer's checklist (R1, R2, ...)
  validations.md                    User-visible acceptance tests (V1, V2, ...)

api/                                FastAPI backend
  main.py                           App entry, CORS, /api/health
  routers/run.py                    SSE endpoints
  services/google_adk_runner.py     Orchestrator (calls into google-adk-agent/)

google-adk-agent/                   ADK agent definitions (Day 1 — created)
  agent_system.py                   Top-level: imports each agent, exports legacy + new aliases, helpers
  skeptic_agent.py                  Skeptic agent definition + system prompt
  munshi_agent.py                   Munshi agent definition + system prompt
  hype_agent.py                     Hype agent definition + system prompt
  cvo_agent.py                      CVO agent definition + system prompt
  contracts.py                      Pydantic models — SkepticReport, MunshiReport, HypeReport, FinalReport
  tools.py                          web_search + calculate functions
  .env                              GOOGLE_API_KEY, ALLOWED_ORIGINS (gitignored)
  .env.example                      Template, checked in

Flat structure — no `agents/` or `tools/` subdirectories. The directory name uses a hyphen, which Python cannot import as a package, so `agent_system.py` does a `sys.path` nudge to allow sibling imports.

frontend/                           Next.js 15
  app/
    page.tsx                        Launchpad (welcome screen)
    upload/page.tsx                 Upload Hub
    run/[id]/page.tsx               Live boardroom + audit + verdict
  components/
    AgentCard.tsx                   Per-agent status card
    AuraGauge.tsx                   Circular score gauge
    VerdictCard.tsx                 Final verdict + share
  lib/
    sse-client.ts                   Single SSE boundary
    share-card.ts                   Aura Card PNG export
    investor-report.ts              Full report PDF export
    agent-types.ts                  TS mirror of contracts.py

README.md                           Outward-facing project intro
WORKFLOW.md                         How we build (hackathon-mode spec-driven)
PHASES.md                           Long-form phase narrative
ROADMAP.md                          2-day sprint hour-by-hour
FEATURES.md                         Feature tiers (MVP / v1.5 / future)
AGENTS.md                           Per-agent prompts and contracts
todo.md                             Loose live capture during sprint
```

## Conventions we are deliberately deferring

| Convention | Defer until | Why now-not-yet |
| --- | --- | --- |
| Test suite (Vitest / pytest) | Phase 1 | A 2-day sprint earns more from manual smoke tests than from harness setup |
| Linting / pre-commit hooks | Phase 1 | Friction beats consistency at this budget |
| CI/CD | Phase 1 | Vercel auto-deploy is enough; backend deploys manually |
| Error tracking (Sentry) | Phase 1 | Use console + venue-side debugging for 2-day sprint |
| Auth | Phase 2 | Guest-first flow has more viral lift; auth lands with re-roast tracker |
