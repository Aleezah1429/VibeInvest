# Validations — Squad Report

> Each is a manual acceptance test. Tick `[x]` only after observing the behavior in a real browser.

## Happy path — full pipeline
- [ ] V1: Submit an idea from `/upload` → arrive at `/run/[id]` with all four agent cards visible in idle state
- [ ] V2: Within 5 seconds, the Skeptic card flips to **Working** and text starts streaming
- [ ] V3: Streaming text is readable as it accumulates (no full-page jank, no flicker)
- [ ] V4: When the Skeptic finishes, its pill becomes **Complete** with a checkmark animation
- [ ] V5: A handoff arrow visibly fires from Skeptic → Munshi
- [ ] V6: Steps 2–5 repeat for Munshi → Hype → CVO in that exact order
- [ ] V7: After the CVO completes, the page auto-scrolls to the Aura Audit section

## Section headers
- [ ] V8: "Squad Report: Market & Finances" header is visible above the Skeptic + Munshi row
- [ ] V9: "Squad Report: Brand & Vibe" header is visible above the Hype + CVO row

## Status states
- [ ] V10: Before any event arrives, all four cards show **Idle**
- [ ] V11: Only one card is **Working** at a time
- [ ] V12: A card cannot go from **Complete** back to **Working** (no flicker)

## Mid-run behavior
- [ ] V13: Refresh the page mid-run → the run is lost cleanly (no error toast, just empty state — acceptable per "no persistence" rule)
- [ ] V14: Navigate away mid-run and come back → same thing — empty state, no zombie connection in DevTools Network tab

## Error path
- [ ] V15: Force a `pipeline_error` by killing the backend mid-run → the in-flight card switches to **Error** with the error message
- [ ] V16: The other cards stay in their last known state (don't all flip to Error)

## Responsive
- [ ] V17: At 375px wide, all four cards stack vertically and are readable
- [ ] V18: At 768px and up, cards form a 2×2 grid with the correct ordering
- [ ] V19: Streaming text never causes horizontal scrolling

## Performance
- [ ] V20: Time from `pipeline_start` event to first `agent_text` render is under 300ms (visual confirmation)
- [ ] V21: Streaming text update rate stays smooth — no visible stutter on a mid-range laptop

## Console hygiene
- [ ] V22: No errors or React warnings in console during a full happy-path run
- [ ] V23: After the run completes, DevTools Network tab shows the EventSource is closed (not pending)
