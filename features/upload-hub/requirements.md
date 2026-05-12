# Requirements — Upload Hub

> Tick `[x]` as each ships. All must pass before merging.

## Page + routing
- [ ] R1: Route `/upload` renders the Upload Hub
- [ ] R2: Header shows a back chevron returning to `/`
- [ ] R3: Page title reads "Upload Hub"

## Bento layout
- [ ] R4: `<UploadBento />` renders a 2×2 grid of input tiles on tablet+, 1×4 stack on mobile
- [ ] R5: The four tiles are labeled **Text**, **PDF**, **Audio**, **Vision** in that order

## Active tile — Text
- [ ] R6: `<TextInputCard />` is the only enabled tile in Phase 0
- [ ] R7: Textarea accepts 1–2000 characters; char counter visible
- [ ] R8: Submit button labeled **Run Boardroom**, disabled while textarea has < 20 chars
- [ ] R9: Submit posts to `/api/run/google-adk` with body `{ idea_text, output_language: "en" }`
- [ ] R10: On submit success, navigates to `/run/[run_id]` (run_id from backend response)
- [ ] R11: On submit failure, shows an inline error ("Couldn't reach the boardroom — try again") without losing the typed text

## Stub tiles — PDF / Audio / Vision
- [ ] R12: `<StubInputCard />` is used for PDF, Audio, and Vision tiles
- [ ] R13: Each stub tile shows a "Live in Week 1" pill clearly visible
- [ ] R14: Stub tiles are not clickable (or click is a no-op with no error)
- [ ] R15: Stub tiles use the same visual frame as the Text tile so the bento looks coherent

## Demo idea picker
- [ ] R16: `<DemoIdeaPicker />` shows exactly 3 pre-curated ideas from `lib/demo-ideas.ts`
- [ ] R17: Clicking a demo idea populates the textarea (does NOT auto-submit)
- [ ] R18: Demo idea labels are short (≤ 40 chars) so they fit on mobile

## Analyzing state
- [ ] R19: After submit but before navigation, `<AnalyzingState />` shows the loader + "Analyzing '<first 30 chars of idea>...'" copy
- [ ] R20: The loader is the same circular indicator shown in the design mock

## Boundaries
- [ ] R21: All POST calls go through `lib/upload-client.ts` — no inline `fetch` in components
- [ ] R22: Demo ideas live in `lib/demo-ideas.ts`, not inline

## Responsive
- [ ] R23: Renders correctly at 375px, 768px, 1280px
- [ ] R24: On mobile, textarea is at least 6 lines tall without scrolling the page

## Non-functional
- [ ] R25: No console errors during submit happy path or error path
- [ ] R26: No `any` types in any new file
