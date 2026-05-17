# Workplan — Goals & Milestones

> **Trace ID**: `892ab532-e0ea-41be-80ee-7dfb0abfa3b5`
> **Generated**: 2026-05-17T16:45:00+05:00
> **Sources**: `.agents/specs/PRD.md`, `.agents/specs/PLAN.md`

---

## Mission

Build a mobile app where an investor types a startup name and receives instant AI-powered due diligence from 4 autonomous agents, culminating in an Aura Score out of 1000 with an Invest/Watch/Pass/Acquire verdict.

---

## High-Level Goals

| ID | Goal | Source | Milestone |
|----|------|--------|-----------|
| G1 | Scaffold Expo Router app with 4 core screens (Home, Search, Loading, Report) | PLAN Day 1 | Day 1 end |
| G2 | Build reusable UI components (Buttons, Inputs, Cards) | PLAN Day 1 | Day 1 end |
| G3 | Set up SSE streaming utility (`services/api.ts`) | PLAN Day 1 | Day 1 end |
| G4 | Search screen: form state, validation, intent selection | PLAN Day 2 | Day 2 end |
| G5 | Connect `POST /api/run/google-adk` and parse SSE stream | PLAN Day 2 | Day 2 end |
| G6 | Loading screen: real-time agent progress via SSE events | PLAN Day 2 | Day 2 end |
| G7 | Report screen: Aura Score, dimensions, metrics, agent cards | PLAN Day 3 | Day 3 end |
| G8 | Parse `pipeline_complete` event payload into `ReportData` | PLAN Day 3 | Day 3 end |
| G9 | Error handling: API errors, network drops, timeouts | PLAN Day 4 | Day 4 end |
| G10 | Polish: animations, progress bar interpolation, expanding cards | PLAN Day 4 | Day 4 end |
| G11 | Cross-platform testing on iOS Simulator + Android Emulator | PLAN Day 5 | Day 5 end |

---

## PRD-Derived User Stories

1. As an investor, I type a startup name to instantly start due diligence.
2. As a user, I see 4 AI agents working in real-time so I understand what analysis is being performed.
3. As a VC, I see a final Aura Score + Invest/Watch/Pass/Acquire verdict for quick decision-making.
4. As an acquirer, I read the full report (financials, risks, competitors, brand) for strengths/weaknesses.
5. As an investor, I access actionable outputs (questions to ask, investor brief PDF) to prepare for meetings.

---

## Navigation Map (PRD)

```
Home (/) → Search (/search)
Search (/search) → Loading (/loading) [passing startup name]
Loading (/loading) → Report (/report) [upon stream completion]
Report (/report) → Search (/search) [via back button]
```

**Actual implementation** adds an extra screen:
```
Loading (/loading) → Handoff (/handoff) → Report (/report)
```

---

## The Cut List (PLAN.md)

Ordered by what hurts least to lose:

1. **Recent Reports List** — remove from search screen, require fresh analysis
2. **Animated Progress Bar** — replace with spinner + text if buggy
3. **Expandable Agent Cards** — show full text by default
4. **Action Buttons (Save/Share)** — remove if export APIs take too long

---

## Data Model (PRD)

```typescript
StartupQuery: { name: string, intent: string, sector?: string, stage?: string, context?: string }
AgentStatus:  { id: number, name: string, status: 'idle'|'running'|'done', detailText: string }
ReportData:   { score: number, verdict: string, verdictSub: string,
                dimensions: { name: string, score: number }[],
                metrics: { label: string, value: string, change: string, changeType: string }[],
                agentReports: AgentReport[] }
AgentReport:  { id: number, name: string, role: string, badge: string, body: string,
                findings: { text: string, type: 'positive'|'negative'|'warning' }[] }
```

---

## API Contract (PRD)

- **Endpoint**: `POST /api/run/google-adk`
- **Request**: `{ "company_name": string }`
- **Response**: SSE stream
- **Events**: `pipeline_start`, `agent_start`, `tool_call`, `agent_text`, `pipeline_complete`
