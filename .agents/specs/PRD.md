# Product Requirements Document (PRD)

## Problem Statement & Target User
**Problem**: Investors, acquirers, and VCs spend hours reading pitch decks, researching markets, and doing initial pre-screening for startups. 
**Target User**: Angel investors, acquirers, VCs (Primary). Founders, journalists, accelerators (Secondary).

## User Stories
1. As an investor, I want to type a startup name into the app so that I can instantly start the due diligence process.
2. As a user, I want to see the progress of the 4 AI agents in real-time so that I understand what analysis is being performed.
3. As a VC, I want to see a final Aura Score and an Invest/Watch/Pass/Acquire verdict so that I can quickly decide if the startup is worth my time.
4. As an acquirer, I want to read the full report (financials, risks, competitors, brand) to understand the startup's strengths and weaknesses.
5. As an investor, I want to view actionable outputs like "Questions to ask" or an Investor Brief PDF so that I am prepared for a meeting.

## Screen-by-Screen Breakdown
1. **Splash/Home Screen (`/`)**: App branding, quick stats, and entry points.
2. **Search Screen (`/search`)**: Input field for startup name, intent selection (Invest, Acquire, etc.), optional context (Sector, Stage, Funding). Recent reports list.
3. **Loading Screen (`/loading`)**: Live progress view of 4 agents running sequentially. SSE stream listener.
4. **Report Screen (`/report`)**: Final Aura score, dimension scores, key metrics, and expandable detailed agent reports. Action strip for saving/sharing.

## Navigation Map
`Home (/)` → `Search (/search)`
`Search (/search)` → `Loading (/loading)` (passing startup name as param)
`Loading (/loading)` → `Report (/report)` (upon stream completion)
`Report (/report)` → `Search (/search)` (via back button)

## Data Model (Client-Side)
- `StartupQuery`: `{ name: string, intent: string, sector?: string, stage?: string, context?: string }`
- `AgentStatus`: `{ id: number, name: string, status: 'idle' | 'running' | 'done', detailText: string }`
- `ReportData`: 
  - `score: number`
  - `verdict: string`
  - `verdictSub: string`
  - `dimensions: { name: string, score: number }[]`
  - `metrics: { label: string, value: string, change: string, changeType: 'positive'|'negative'|'neutral' }[]`
  - `agentReports: AgentReport[]`
- `AgentReport`: `{ id: number, name: string, role: string, badge: string, body: string, findings: { text: string, type: 'positive'|'negative'|'warning' }[] }`

## API Contract
- `POST /api/run/google-adk`
  - Request: `{ "company_name": string }`
  - Response: Server-Sent Events (SSE) stream.
  - Events: `pipeline_start`, `agent_start`, `tool_call`, `agent_text`, `pipeline_complete`.

## Non-Functional Requirements
- **Offline Behavior**: Show a graceful error message if the user loses connection during analysis. Cache recent reports locally (if scope permits).
- **Performance**: SSE stream parsing must be non-blocking. Animations on the loading screen must run smoothly.

## Explicit Out-of-Scope List (v1)
- User Authentication (Firebase/Supabase auth).
- Persistent cloud history (Firestore).
- PDF Generation/Export on mobile (complex to set up properly in 5 days, push to v1.5 or simulate with simple share).
- Custom UI themes (Dark mode only).
