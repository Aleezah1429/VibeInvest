# Validations — Aura Audit

> Each is a manual acceptance test. Tick `[x]` only after observing the behavior in a real browser.

## First render
- [ ] V1: While the pipeline is still running, the Aura Audit section is NOT in the DOM
- [ ] V2: When `pipeline_complete` fires, the Audit section appears below the Squad grid
- [ ] V3: The page auto-scrolls (smoothly) to bring the gauge into view

## Score animation
- [ ] V4: The score number starts at 0 and animates to the final value over ~1.5 seconds
- [ ] V5: The animation runs exactly once — scrolling away and back does not retrigger it
- [ ] V6: The gauge ring fills proportionally to the final score (e.g., 850/1000 = 85% fill)

## Verdict colors
- [ ] V7: A score in `[800, 1000]` renders the gauge in green with **INVEST!** label
- [ ] V8: A score in `[600, 799]` renders blue with **ITERATE** label
- [ ] V9: A score in `[400, 599]` renders magenta with **PIVOT** label
- [ ] V10: A score in `[0, 399]` renders red with **PASS** label
- [ ] V11: The glow around the ring matches the verdict color

## Flags panel
- [ ] V12: Green Flags column header has a green ✓ badge
- [ ] V13: Red Flags column header has a red ✗ badge
- [ ] V14: For a 850-scoring idea, ≥ 2 green flags are visible (at least 2 dimensions ≥ 7)
- [ ] V15: For a 350-scoring idea, ≥ 3 red flags are visible (top_fixes guarantees 3)
- [ ] V16: Each chip's icon matches its column (no green ✓ in the Red column or vice versa)

## Responsive
- [ ] V17: At 375px wide, Green Flags stacks above Red Flags (single column)
- [ ] V18: At 1280px, both columns sit side-by-side with comfortable spacing
- [ ] V19: The gauge scales down on mobile so it fits without horizontal scroll

## Consistency
- [ ] V20: Run the same idea twice — gauge color/verdict label is consistent (score may jitter ±50, verdict stays in the same band)
- [ ] V21: The number shown inside the gauge matches `final_report.aura_score` exactly

## Console hygiene
- [ ] V22: No console errors or React key warnings during the audit render
- [ ] V23: No layout shift after the gauge animation finishes
