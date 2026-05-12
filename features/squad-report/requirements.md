# Requirements — Squad Report

> Tick `[x]` as each ships. All must pass before merging.

## Page + routing
- [x] R1: Route `/run/[id]` renders the Squad Report
- [x] R2: On mount, the page opens an SSE-like fetch stream (POST + ReadableStream) for that run
- [x] R3: On unmount, the stream is aborted (AbortController.abort in cleanup)

## Layout
- [x] R4: Two section headers visible: "Squad Report: Market & Finances" + "Squad Report: Brand & Vibe"
- [x] R5: Four agent cards in a 2×2 grid on tablet+, stacked 1-col on mobile
- [x] R6: Card order matches agent order: Skeptic, Munshi, Hype, CVO

## AgentCard
- [ ] R7: ~~Each card shows the agent's avatar~~, name, persona one-liner *(avatar deferred — Lane C ships avatars in Phase 0.5; display name + persona shipping now)*
- [x] R8: Status pill on each card with one of: **Idle**, **Working**, **Complete**, **Error**
- [x] R9: Streaming text area below the pill — fills as `agent_text` events arrive
- [x] R10: When status flips to **Complete**, the pill recolors to neon-green (lighter-weight than full checkmark animation; design polish in 0.5)
- [x] R11: When status is **Error**, the card shows the error message inline

## SSE handling
- [x] R12: `lib/sse-client.ts` is the only file that constructs the stream (uses `fetch` + `ReadableStream` — `EventSource` doesn't support POST bodies, documented in the file)
- [x] R13: `lib/run-state.ts` exports `applyEvent(state, event): RunState` as a pure function
- [x] R14: Page uses `useReducer(applyEvent, INITIAL_RUN_STATE)` to manage run state
- [x] R15: All events from the contract are handled: `pipeline_start`, `agent_start`, `agent_text`, `tool_call`, `tool_result`, `agent_complete`, `agent_handoff`, `pipeline_complete`, `pipeline_error`
- [x] R16: Unknown event types pass through the `default` case (no-op)

## Handoff animation
- [ ] R17: ~~`<HandoffArrow />` fires between two cards on `agent_handoff`~~ *Deferred — handoff signaled implicitly via pill color transition. `lastHandoffTo` is tracked in run-state for when the animation lands in Phase 0.5.*
- [x] R18: Whatever signal we emit is non-blocking — handoff is just state, doesn't gate `agent_start`

## After pipeline completes
- [x] R19: When `pipeline_complete` arrives, `finalReport` is stored in run state
- [x] R20: The Aura Audit section renders below the Squad grid on the same page
- [x] R21: Page auto-scrolls to the Aura Audit section via `scrollIntoView({ behavior: "smooth" })`

## Types
- [x] R22: `frontend/lib/agent-types.ts` mirrors the Python `contracts.py` 1:1 (`SkepticReport`, `MunshiReport`, `HypeReport`, `FinalReport`)

## Responsive
- [ ] R23: Renders correctly at 375px, 768px, 1280px *(needs manual browser check)*
- [x] R24: Streaming text uses `whitespace-pre-wrap` inside cards — no horizontal overflow

## Non-functional
- [x] R25: No `any` types in run state, events, or component props
- [ ] R26: No console errors during a happy-path run *(needs end-to-end run with API key)*
- [ ] R27: No memory leaks from EventSource — *(needs runtime verification with 3 back-to-back runs)*
