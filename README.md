# VibeInvest

**Your AI boardroom for Pakistan's next generation of founders.**
*Get roasted before you get rejected.*

Submission target: AI Seekho 2026 — Phase 2 Hackathon.
Built on Google ADK (Antigravity) for agent orchestration and Gemini 2.5 for multimodal reasoning.

---

## What it does

A founder drops in a startup idea (typed, voice note in Urdu/English, photo of a handwritten plan, or a pitch deck PDF). Four specialized agents tear into it from different angles, hand notes to each other, and a final agent — the CVO — produces an **Aura Score out of 1000** with a verdict (Invest / Iterate / Pivot / Pass) and a concrete fix list.

The four agents:

| Agent | Role | Maps to existing scaffold |
| --- | --- | --- |
| The Skeptic | Market research, competitors, saturation | `Researcher` |
| The Munshi | Unit economics, PKR-grounded financials | `Analyzer` |
| The Hype | Branding, taglines, pitch reframing | `Writer` |
| The CVO | Synthesis, contradictions, Aura Score | `QA/Review` |

See [AGENTS.md](AGENTS.md) for system prompts, tools, and I/O contracts.

---

## Repo layout

```
VibeInvest/
├── specs/                 Project-level spec system (mission, tech, roadmap)
├── features/              Per-feature folders (plan + requirements + validations)
│   ├── launchpad/
│   ├── upload-hub/
│   ├── agent-pipeline/
│   ├── squad-report/
│   ├── aura-audit/
│   └── final-verdict/
├── api/                   FastAPI backend + agent runners (Python)
│   ├── main.py            App entry, CORS, /api/health
│   ├── routers/run.py     SSE endpoints: /api/run/{claude,openai,google-adk}
│   └── services/          One runner per SDK (claude, openai, google-adk)
├── frontend/              Next.js 15 + Tailwind 4 + jsPDF
│   ├── app/               Routes (home + /sdk/[slug] detail)
│   ├── components/        SdkCard, TerminalOutput, TestNowForm
│   └── lib/sdk-data.ts    SDK metadata (to be replaced with agent metadata)
├── VibeInvest/            Inner git repo — submission artifact
├── README.md              ← you are here
├── WORKFLOW.md            How we build (spec-driven, hackathon edition)
├── ROADMAP.md             2-day hour-by-hour sprint plan
├── FEATURES.md            MVP / v1.5 / future feature tiers
├── PHASES.md              Hackathon → 12-month vision
├── AGENTS.md              Per-agent specs, prompts, tools
└── todo.md                Live sprint capture (informal)
```

**Spec-driven structure.** Every feature lives in `features/<name>/` with three files: `plan.md` (the design), `requirements.md` (R1, R2, … developer checklist), and `validations.md` (V1, V2, … user-visible acceptance tests). Read [WORKFLOW.md](WORKFLOW.md) before starting work on any feature.

**Note:** the `google-adk-agent/` directory referenced by `api/services/google_adk_runner.py` does not exist yet. Creating it (with `agent_system.py` defining the four agents and their tools) is task #1 — see [ROADMAP.md](ROADMAP.md) Day 1.

---

## Stack

| Layer | Choice | Why |
| --- | --- | --- |
| Frontend | Next.js 15 (App Router), React 19, Tailwind 4 | Already scaffolded; PWA-friendly for mobile |
| PDF/share | `jspdf` | Already a dep — used for Aura Card and report export |
| Backend | FastAPI + `sse-starlette` | Already scaffolded; SSE for live agent streaming |
| Agents | `google-adk` (primary), Anthropic + OpenAI Agents (comparison) | ADK is what Antigravity uses; multi-SDK shows depth |
| Model | Gemini 2.5 Flash (agents), Gemini 2.5 Pro (CVO synthesis) | Cost/quality split |
| Multimodal | Gemini vision + audio (handwritten plan OCR, Urdu voice) | Native, no extra service |
| Storage | Firestore *(optional, for v1.5)* | Reports, share cards, "re-roast" history |

The planning doc originally proposed Flutter + Firebase. We are keeping the existing Next.js + FastAPI scaffold instead because (a) the agent runners are already wired up, (b) Next.js PWA gives us a mobile-installable experience without rewriting, (c) it saves ~2 days of the 10-day budget.

---

## Quickstart

### Backend

```bash
cd api
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt

# Set up env for Gemini
echo "GOOGLE_API_KEY=your_key_here" > ../google-adk-agent/.env
echo "ALLOWED_ORIGINS=http://localhost:3000" >> ../google-adk-agent/.env

# Run from project root so the `api.` import path resolves
cd ..
uvicorn api.main:app --reload --port 8000
```

Health check: `curl http://localhost:8000/api/health` → `{"status":"ok"}`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000.

### Smoke test the pipeline (after Day 1 work)

```bash
curl -N -X POST http://localhost:8000/api/run/google-adk \
  -H "Content-Type: application/json" \
  -d '{"company_name":"Chai delivery for LUMS campus"}'
```

You should see a stream of SSE events: `pipeline_start` → `agent_start` (×4) → `tool_call` / `agent_text` events → `pipeline_complete`.

---

## Environment variables

| Var | Where | Purpose |
| --- | --- | --- |
| `GOOGLE_API_KEY` | `google-adk-agent/.env` | Gemini auth for ADK agents |
| `ANTHROPIC_API_KEY` | `api/.env` *(optional)* | Claude SDK comparison runner |
| `OPENAI_API_KEY` | `api/.env` *(optional)* | OpenAI Agents comparison runner |
| `ALLOWED_ORIGINS` | shell or `.env` | CORS allowlist for the FastAPI app |

---

## Timeline

**2 days, 3 people.** See [ROADMAP.md](ROADMAP.md) for the hour-by-hour plan and the explicit cut list. The full multimodal experience promised in the pitch lands in Phase 0.5 (Week 1 after submission) — see [PHASES.md](PHASES.md).

---

## Demo (3 min, hackathon)

Pre-loaded idea: *"Chai delivery startup for university campuses in Lahore."*

1. **0:00–0:20** — Open with the 70% failure stat; pitch the boardroom metaphor.
2. **0:20–0:35** — Paste the idea into the textarea. (Voice input lands in Phase 0.5 — show the mic icon to signal it's coming.)
3. **0:35–1:20** — Show the four agents activating; highlight the Skeptic naming three plausible chai competitors and the Munshi running PKR-50/cup unit economics.
4. **1:20–1:50** — CVO reveal: **640 / 1000 — Iterate.** Top three fixes appear.
5. **1:50–2:05** — Tap "Share" → Aura Card exports to PNG via `jspdf`.
6. **2:05–3:00** — Close on MoITT alignment, the Phase 0.5 multimodal roadmap, and the long-term vision in [PHASES.md](PHASES.md).

---

## Where to go next

- New to the project? Read [specs/mission.md](specs/mission.md), then [WORKFLOW.md](WORKFLOW.md).
- Picking up a feature? Open its folder in [features/](features/) — start with `plan.md`, then `requirements.md`.
- Building an agent? Read [AGENTS.md](AGENTS.md) and [features/agent-pipeline/](features/agent-pipeline/).
- Day-by-day plan? Read [ROADMAP.md](ROADMAP.md) (Phase 0) and [specs/roadmap.md](specs/roadmap.md) (all phases).
- Pitching the long-term vision? Read [PHASES.md](PHASES.md).

---

*Built with vibes by Team VibeInvest.*

tetsing