# Plan — Squad Report (live boardroom)

## Goal
The live, streaming view of all four agents working on the founder's idea. The image mock splits this into two screens — **Market & Finances** (Skeptic + Munshi) and **Brand & Vibe** (Hype + CVO) — which we model as a single page that progressively reveals the agent pairs as upstream agents complete.

This is the page that turns "we ran an LLM" into "we ran a boardroom." The streaming UX *is* the demo.

**Phase:** 0 (hackathon MVP).

## User stories
- As a founder, after submitting my idea I see four agent cards appearing in sequence as the boardroom works.
- As a founder, each agent card streams its findings live — I can read along, not just watch a spinner.
- As a founder, I see clear handoffs between agents so I understand the boardroom is *deliberative*, not a single big query.
- As a demo audience member, the screen looks alive — text scrolling, status pills changing, glowing handoffs — without being chaotic.
- As Lane B, the entire view is driven by SSE events. No polling. No magic.

## Architecture sketch

```
app/
  run/
    [id]/
      page.tsx                    Boardroom container — opens SSE stream, holds run state

components/
  squad-report/
    SquadGrid.tsx                 2-column responsive layout, holds the four AgentCards
    AgentCard.tsx                 One agent's avatar, status pill, streaming text region
    HandoffArrow.tsx              Visual handoff effect between two completed AgentCards
    SectionHeader.tsx             "Squad Report: Market & Finances" / "Squad Report: Brand & Vibe"

lib/
  sse-client.ts                   Single SSE consumer — opens stream, exposes typed events
  agent-types.ts                  TS mirror of agent contracts (kept in sync with contracts.py)
  run-state.ts                    Pure reducer: (state, event) → state. Easy to test, easy to debug.
```

## Run state shape

```ts
type AgentName = "skeptic" | "munshi" | "hype" | "cvo";

type AgentStatus = "idle" | "working" | "complete" | "error";

interface AgentState {
  status: AgentStatus;
  streamedText: string;          // accumulated `agent_text` deltas
  report: AgentReport | null;    // populated on agent_complete
  subMessage?: string;           // e.g. "scanning competitors"
}

interface RunState {
  runId: string;
  ideaText: string;
  agents: Record<AgentName, AgentState>;
  finalReport: FinalReport | null;
  pipelineError: string | null;
}
```

## Visual flow

1. Page mounts → opens SSE stream to `/api/run/google-adk/stream/[id]`.
2. `pipeline_start` arrives → all four agent cards render in `idle` state with avatars.
3. `agent_start` for Skeptic → Skeptic card flips to `working`, status pill animates.
4. `agent_text` events stream → Skeptic card shows text accumulating.
5. `agent_complete` for Skeptic → status pill flips to `complete`, structured report stored in state.
6. `agent_handoff: skeptic → munshi` → a glowing arrow fires between Skeptic and Munshi cards.
7. Steps 3–6 repeat for Munshi, Hype, CVO.
8. `pipeline_complete` → the page scrolls down (or routes within the same page) to the Aura Audit view.

The two "Squad Report" screens in the design correspond to:
- **Market & Finances** section header → renders above the Skeptic + Munshi pair.
- **Brand & Vibe** section header → renders above the Hype + CVO pair.

Both sections live on the same scrollable page in Phase 0 — no multi-route transitions needed.

## Decisions
- **Single page, scrollable.** Splitting into two routes adds nav state we don't need. Both Squad Report sections live in `/run/[id]`, the Aura Audit follows below them in the same scroll.
- **Streaming text is opt-in to display.** If `agent_text` arrives faster than we can render smoothly, we batch into 100ms chunks. (Phase 0.5 — fine to render every delta for MVP.)
- **No "Cancel run" button in MVP.** Demos always complete.
- **Reducer over useState soup.** `run-state.ts` exports a pure `applyEvent(state, event)` function. The page wires it into a `useReducer`. Easier to debug than scattered setState calls during a live demo.

## Out of scope (Phase 0)
- Re-running a single agent
- Pausing the stream
- Sharing a mid-run URL with someone else
- Replaying a completed run (no persistence — refresh = lose)
