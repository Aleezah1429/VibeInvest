# VibeInvest

**Type any startup name. Get instant investor-grade due diligence.**  
*Powered by 4 AI agents that autonomously research, analyze, and score — so you know if a startup is worth your money before you take a single meeting.*

Built on Google ADK (Antigravity) for agent orchestration and Gemini 2.5 for multimodal reasoning.

---

## What It Does

Enter a startup name — like "Airlift", "Bazaar Technologies", or "Retailo" — and four specialized AI agents activate in sequence. They search the web, analyze financials, score the brand, hand findings to each other, and deliver a final **Aura Score out of 1000** with a verdict: **Invest · Watch · Pass · Acquire**.

No pitch decks to read. No analyst hours burned. Just a name.

---

## 👥 Who Uses This

**Primary users:**

- **Angel investors** evaluating a deal
- **Acquirers** researching a target company
- **VCs** doing quick pre-screening

**Secondary users:**

- **Founders** researching competitors
- **Journalists** covering startups
- **Accelerators** screening applicants

---

## 🤖 The Four Agents


| Agent              | Role                | What It Does                                                                                                    |
| ------------------ | ------------------- | --------------------------------------------------------------------------------------------------------------- |
| 🔍 **The Skeptic** | Market Intelligence | Searches the web for funding history, competitors, market position, news mentions, and red flags                |
| 💰 **The Munshi**  | Financial Signals   | Estimates revenue model viability, funding rounds, burn rate signals, valuation reasonableness from public data |
| ✨ **The Hype**     | Brand & Perception  | Analyzes online presence, social traction, founder credibility, PR sentiment, and product-market fit signals    |
| 👑 **The CVO**     | Investment Verdict  | Synthesizes all three reports into a final Aura Score with verdict                                              |


See [AGENTS.md](AGENTS.md) for system prompts, tools, and I/O contracts.

---

## 🔄 How It Works

```
[1] INPUT
    User types a startup name
    e.g. "Airlift", "Bazaar Technologies", "Retailo"
    ↓
[2] AGENTS ACTIVATE
    Skeptic → web searches startup, news, funding, competitors
    Munshi  → analyzes business model, revenue signals, valuation
    Hype    → scores brand, social presence, founder reputation
    ↓
[3] AGENT HANDOFFS (visible in UI)
    Skeptic findings → feeds into Munshi risk assessment
    Munshi flags     → Hype checks if brand can recover
    All three        → CVO for final synthesis
    ↓
[4] AURA SCORE REVEAL
    "Bazaar Technologies scores 810/1000 — INVEST ✅"
    Breakdown: Market 9/10 · Financials 7/10 · Brand 8/10
    ↓
[5] FULL REPORT
    • Funding history & investors
    • Competitor landscape
    • Key risks & red flags
    • Strengths
    • Final recommendation
    ↓
[6] ACTION SIMULATION
    CVO auto-generates:
    → Investor brief PDF
    → "Questions to ask before investing" list
    → Deal memo draft
```

---

## Repo Layout

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
│   ├── components/        UI components for agent pipeline + reports
│   └── lib/               SDK metadata and utilities
├── google-adk-agent/      ADK agent definitions and tools
├── README.md              ← you are here
├── SETUP.md               Full setup guide
├── WORKFLOW.md            How we build (spec-driven, hackathon edition)
├── ROADMAP.md             Sprint plan
├── FEATURES.md            MVP / v1.5 / future feature tiers
├── PHASES.md              Hackathon → 12-month vision
└── AGENTS.md              Per-agent specs, prompts, tools, contracts
```

---

## Stack


| Layer     | Choice                                                         | Why                                                 |
| --------- | -------------------------------------------------------------- | --------------------------------------------------- |
| Frontend  | Next.js 15 (App Router), React 19, Tailwind 4                  | PWA-friendly, already scaffolded                    |
| PDF/Share | `jspdf`                                                        | Aura Card and report export                         |
| Backend   | FastAPI + `sse-starlette`                                      | SSE for live agent streaming                        |
| Agents    | `google-adk` (primary), Anthropic + OpenAI Agents (comparison) | ADK is the Antigravity stack; multi-SDK shows depth |
| Model     | Gemini 2.5 Flash (agents), Gemini 2.5 Pro (CVO synthesis)      | Cost/quality split                                  |
| Storage   | Firestore *(optional, for v1.5)*                               | Reports, share cards, history                       |


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

Open [http://localhost:3000](http://localhost:3000).

### Smoke Test

```bash
curl -N -X POST http://localhost:8000/api/run/google-adk \
  -H "Content-Type: application/json" \
  -d '{"company_name":"Bazaar Technologies"}'
```

You should see a stream of SSE events: `pipeline_start` → `agent_start` (×4) → `tool_call` / `agent_text` events → `pipeline_complete` with the final Aura Score.

---

## Environment Variables


| Var                 | Where                   | Purpose                            |
| ------------------- | ----------------------- | ---------------------------------- |
| `GOOGLE_API_KEY`    | `google-adk-agent/.env` | Gemini auth for ADK agents         |
| `ANTHROPIC_API_KEY` | `api/.env` *(optional)* | Claude SDK comparison runner       |
| `OPENAI_API_KEY`    | `api/.env` *(optional)* | OpenAI Agents comparison runner    |
| `ALLOWED_ORIGINS`   | shell or `.env`         | CORS allowlist for the FastAPI app |


---

## Demo Script (3 min)

1. **0:00–0:20** — Open with the problem: investors waste hours on startups that don't survive. Introduce VibeInvest as instant due diligence.
2. **0:20–0:35** — Type a startup name into the search bar: *"Bazaar Technologies"*.
3. **0:35–1:20** — Show the four agents activating in sequence; highlight the Skeptic pulling real funding data, the Munshi flagging financial signals, and the Hype scoring brand presence.
4. **1:20–1:50** — CVO reveal: **810 / 1000 — INVEST ✅**. Dimension breakdown appears.
5. **1:50–2:10** — Scroll through the full report: funding history, competitor landscape, risks, strengths.
6. **2:10–2:30** — Show action outputs: investor brief PDF, questions list, deal memo draft.
7. **2:30–3:00** — Close on the vision: from hackathon demo to the investor's daily tool.

---

## Where to Go Next

- New to the project? Read [AGENTS.md](AGENTS.md) for agent specs, then [SETUP.md](SETUP.md) for full setup.
- Picking up a feature? Open its folder in features/ — start with `plan.md`, then `requirements.md`.
- Building an agent? Read [AGENTS.md](AGENTS.md) and features/agent-pipeline/.
- Sprint plan? Read [ROADMAP.md](ROADMAP.md).
- Long-term vision? Read [PHASES.md](PHASES.md).

---

*Built with vibes by Team VibeInvest.*