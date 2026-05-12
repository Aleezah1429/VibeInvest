# Validations — Upload Hub

> Each is a manual acceptance test. Tick `[x]` only after observing the behavior in a real browser.

## Layout
- [ ] V1: Open `/upload` → bento grid shows 4 tiles labeled Text / PDF / Audio / Vision
- [ ] V2: At 375px wide, tiles stack vertically; at 1280px, they form a 2×2 grid
- [ ] V3: Text tile is visually distinct (enabled-looking); the other three look enabled-with-badge, not greyed out

## Stub tile signaling
- [ ] V4: PDF, Audio, Vision tiles each display a "Live in Week 1" pill
- [ ] V5: Clicking PDF / Audio / Vision tile does nothing (no alert, no console error, no opening a file picker)

## Text input — happy path
- [ ] V6: Type "Chai delivery for LUMS campus" in the textarea → char counter updates
- [ ] V7: With < 20 chars in the textarea, **Run Boardroom** button is disabled
- [ ] V8: With ≥ 20 chars, **Run Boardroom** is enabled
- [ ] V9: Click **Run Boardroom** → loader appears with "Analyzing 'Chai delivery for LUMS campus'..." message
- [ ] V10: Within 5 seconds, browser navigates to `/run/<some-id>` — the Squad Report view

## Text input — error path
- [ ] V11: Stop the backend (Ctrl-C uvicorn) → click **Run Boardroom** → inline error appears: "Couldn't reach the boardroom — try again"
- [ ] V12: The typed text is still in the textarea after the error (not wiped)
- [ ] V13: Restart backend, click again → it works (no stale error state)

## Demo idea picker
- [ ] V14: Three demo idea chips visible below the bento grid
- [ ] V15: Click any chip → textarea fills with the idea text → button enables
- [ ] V16: Demo chips do NOT auto-submit on click (user still has to press the button)

## A11y / UX guardrails
- [ ] V17: Tab order: back chevron → textarea → demo chips → Run Boardroom
- [ ] V18: Textarea has a visible focus ring when focused
- [ ] V19: No console errors during any of the above flows
