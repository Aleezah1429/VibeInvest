# Requirements — Squad Report

> Tick `[x]` as each ships. All must pass before merging.

## Page + routing
- [ ] R1: Route `/run/[id]` renders the Squad Report
- [ ] R2: On mount, the page opens an SSE connection to the backend stream for that run_id
- [ ] R3: On unmount, the SSE connection is closed (no orphaned event sources)

## Layout
- [ ] R4: Two section headers visible: "Squad Report: Market & Finances" (above Skeptic + Munshi) and "Squad Report: Brand & Vibe" (above Hype + CVO)
- [ ] R5: Four agent cards in a 2×2 grid on tablet+, stacked 1-col on mobile
- [ ] R6: Card order matches agent order: Skeptic (top-left), Munshi (top-right), Hype (bottom-left), CVO (bottom-right)

## AgentCard
- [ ] R7: Each card shows the agent's avatar, name, persona one-liner
- [ ] R8: Status pill on each card with one of: **Idle**, **Working**, **Complete**, **Error**
- [ ] R9: Streaming text area below the pill — fills as `agent_text` events arrive
- [ ] R10: When status flips to **Complete**, a brief checkmark + glow animation fires
- [ ] R11: When status is **Error**, the card shows the error message inline

## SSE handling
- [ ] R12: `lib/sse-client.ts` is the only file that constructs an `EventSource`
- [ ] R13: `lib/run-state.ts` exports `applyEvent(state, event): RunState` as a pure function
- [ ] R14: Page uses `useReducer(applyEvent, initialState)` to manage run state
- [ ] R15: All events from the contract are handled: `pipeline_start`, `agent_start`, `agent_text`, `tool_call`, `tool_result`, `agent_complete`, `agent_handoff`, `pipeline_complete`, `pipeline_error`
- [ ] R16: Unknown event types are logged to console and ignored (forward-compatible)

## Handoff animation
- [ ] R17: `<HandoffArrow />` fires between two cards on `agent_handoff`
- [ ] R18: Animation is non-blocking — never delays the next `agent_start`

## After pipeline completes
- [ ] R19: When `pipeline_complete` arrives, `finalReport` is stored in run state
- [ ] R20: The Aura Audit section (see `features/aura-audit/`) renders below the Squad grid on the same page
- [ ] R21: Page auto-scrolls to the Aura Audit section smoothly

## Types
- [ ] R22: `frontend/lib/agent-types.ts` mirrors the Python `contracts.py` 1:1 (`SkepticReport`, `MunshiReport`, `HypeReport`, `FinalReport`)

## Responsive
- [ ] R23: Renders correctly at 375px (cards stack), 768px (2×2 grid), 1280px (2×2 with comfortable spacing)
- [ ] R24: Streaming text wraps cleanly inside cards — no horizontal overflow

## Non-functional
- [ ] R25: No `any` types in run state, events, or component props
- [ ] R26: No console errors during a happy-path run
- [ ] R27: No memory leaks from EventSource — verified by running 3 pipelines in a row
