# Validations — Launchpad

> Each is a manual acceptance test. Tick `[x]` only after observing the behavior in a real browser.

## First impression
- [ ] V1: Open `/` in a fresh browser → headline, sub-copy, character, and both CTAs visible without scrolling on a 1280×800 viewport
- [ ] V2: Same view at 375×667 (iPhone SE) → no horizontal scrollbar, CTAs stack vertically, character is visible and not cropped
- [ ] V3: Background uses the neon palette (greens / blues / magenta on near-black) — not the default Tailwind gray

## Navigation
- [ ] V4: Click **Verify Pitch** → URL becomes `/upload` and the Upload Hub renders
- [ ] V5: Click **Generate Roast** → URL becomes `/upload` (same destination)
- [ ] V6: Browser back button returns to `/` with state intact (no broken flash)

## Copy
- [ ] V7: Headline reads "Welcome to Vibe Invest" exactly (no typos, correct casing)
- [ ] V8: Sub-copy fits on one line at 1280px wide
- [ ] V9: CTA labels read "Verify Pitch" and "Generate Roast" exactly

## A11y / UX guardrails
- [ ] V10: Both CTAs reachable by Tab key, in the order shown visually
- [ ] V11: CTAs have visible focus rings on keyboard focus
- [ ] V12: No console errors or React key warnings during render or navigation
- [ ] V13: Page works with JavaScript disabled enough to read the headline (RSC default, not a hard requirement)
