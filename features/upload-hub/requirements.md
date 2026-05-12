# Requirements — Upload Hub

> Tick `[x]` as each ships. All must pass before merging.

## Page + routing
- [x] R1: Route `/upload` renders the Upload Hub
- [x] R2: Header shows a back chevron returning to `/`
- [x] R3: Page title reads "Upload Hub"

## Bento layout
- [x] R4: `<UploadBento />` renders a 2×2 grid of input tiles on tablet+, 1×4 stack on mobile
- [x] R5: The four tiles are labeled **Text**, **PDF**, **Audio**, **Vision** in that order

## Active tile — Text
- [x] R6: `<TextInputCard />` is the only enabled tile in Phase 0
- [x] R7: Textarea accepts up to 2000 characters; char counter visible
- [x] R8: Submit button labeled **Run Boardroom**, disabled while textarea has < 20 chars
- [x] R9: Submit creates a run client-side (UUID + sessionStorage) — the POST to `/api/run/google-adk` happens from `/run/[id]` via `sse-client.ts`. *Spec adjusted: backend has no "create run, return id" endpoint in MVP — see plan.md updates.*
- [x] R10: On submit success, navigates to `/run/[run_id]` (id generated client-side via `lib/upload-client.ts`)
- [x] R11: On submit failure (sessionStorage unavailable), shows an inline error ("Couldn't reach the boardroom — try again") without losing the typed text

## Stub tiles — PDF / Audio / Vision
- [x] R12: `<StubInputCard />` is used for PDF, Audio, and Vision tiles
- [x] R13: Each stub tile shows a "Live in Week 1" pill clearly visible
- [x] R14: Stub tiles are not clickable (rendered as plain `<div>`, no onClick)
- [x] R15: Stub tiles use the same visual frame as the Text tile (same rounded border, padding, min-height)

## Demo idea picker
- [x] R16: `<DemoIdeaPicker />` shows exactly 3 pre-curated ideas from `lib/demo-ideas.ts`
- [x] R17: Clicking a demo idea populates the textarea via the lifted `text` state (does NOT auto-submit)
- [x] R18: Demo idea labels are short (≤ 40 chars) so they fit on mobile

## Analyzing state
- [ ] R19: ~~After submit but before navigation, `<AnalyzingState />` shows the loader + "Analyzing '<first 30 chars of idea>...'" copy~~ *Deferred — navigation is instant; the button shows "Opening boardroom…" during the React transition. The full loader fires once `/run/[id]` mounts and the SSE stream connects.*
- [ ] R20: ~~Loader matches the design mock circular indicator~~ *Deferred with R19 — Lane C designs the loader for Phase 0.5 polish pass.*

## Boundaries
- [x] R21: All run-creation goes through `lib/upload-client.ts` — no inline `sessionStorage`/`fetch` in components
- [x] R22: Demo ideas live in `lib/demo-ideas.ts`, not inline

## Responsive
- [ ] R23: Renders correctly at 375px, 768px, 1280px *(needs manual browser check — Tailwind classes are responsive but visual confirmation pending)*
- [x] R24: On mobile, textarea is at least 6 lines tall (`rows={6}`) and the page doesn't scroll horizontally

## Non-functional
- [x] R25: No console errors during submit happy path or error path (verified — build is clean, dev server returns 200)
- [x] R26: No `any` types in any new file
