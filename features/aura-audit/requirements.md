# Requirements — Aura Audit

> Tick `[x]` as each ships. All must pass before merging.

## Rendering trigger
- [ ] R1: Aura Audit section renders inside `/run/[id]` only after `final_report` is populated in run state
- [ ] R2: Before `final_report` is available, the Audit section is not in the DOM (no flash-of-empty-gauge)

## AuraGauge
- [ ] R3: `<AuraGauge />` accepts `{ score: number; verdict: Verdict }` props
- [ ] R4: Score animates from 0 to final value over ~1.5 seconds (CSS / requestAnimationFrame, not setInterval)
- [ ] R5: The score number is centered inside the ring, in large display type
- [ ] R6: Ring color and glow match the verdict per `verdict-theme.ts`
- [ ] R7: Sub-label below the score reads "/ 1000"

## Verdict theme
- [ ] R8: `lib/verdict-theme.ts` exports a `VERDICT_THEME` object covering all four verdicts
- [ ] R9: All references to verdict colors / labels go through `VERDICT_THEME` — no inline color hex in components

## FlagsPanel
- [ ] R10: `<FlagsPanel />` renders two columns: Green Flags (left) and Red Flags (right) on tablet+
- [ ] R11: Each flag is a `<FlagChip />` with an icon (check for green, cross for red) and short text
- [ ] R12: Green Flags column shows a green check badge in its header
- [ ] R13: Red Flags column shows a red cross badge in its header
- [ ] R14: Each chip's text is ≤ 80 characters; longer text truncates with ellipsis

## Flag extraction
- [ ] R15: `lib/flag-extractor.ts` exports `extractFlags(report: FinalReport): { green: string[]; red: string[] }`
- [ ] R16: Dimensions with `score >= 7` produce a green flag; `score <= 4` produces a red flag; 5–6 produce no flag
- [ ] R17: All three items in `top_fixes` always appear as red flags
- [ ] R18: Flag extraction is a pure function — no side effects, deterministic

## Optional — DimensionMeter (Phase 0 stretch)
- [ ] R19: If implemented, four small bars (Market / Money / Brand / Strategy) render below the gauge with each dimension's 1–10 score visualized
- [ ] R20: If skipped, do not leave a placeholder div — just omit

## Responsive
- [ ] R21: At 375px, FlagsPanel stacks Green above Red (single column)
- [ ] R22: AuraGauge size adapts: ~220px diameter on mobile, ~320px on desktop
- [ ] R23: The score number never overflows its ring

## Non-functional
- [ ] R24: No `any` types
- [ ] R25: Score animation does not block scrolling or other interactions
- [ ] R26: No console warnings for missing keys on the flag chip lists
