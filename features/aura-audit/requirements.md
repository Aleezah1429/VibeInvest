# Requirements — Aura Audit

> Tick `[x]` as each ships. All must pass before merging.

## Rendering trigger
- [x] R1: Aura Audit section renders inside `/run/[id]` only after `final_report` is populated in run state (conditional `{state.finalReport && ...}`)
- [x] R2: Before `final_report` is available, the Audit section is not in the DOM

## AuraGauge
- [x] R3: `<AuraGauge />` accepts `{ score: number; verdict: Verdict }` props
- [x] R4: Score animates from 0 to final value over 1.5s using `requestAnimationFrame` with easeOutCubic
- [x] R5: The score number is centered inside the ring, in 6xl display type
- [x] R6: Ring color and glow match the verdict per `verdict-theme.ts`
- [x] R7: Sub-label below the score reads "/ 1000"

## Verdict theme
- [x] R8: `lib/verdict-theme.ts` exports a `VERDICT_THEME` object covering all four verdicts
- [x] R9: All references to verdict colors / labels go through `VERDICT_THEME` — no inline hex in components

## FlagsPanel
- [x] R10: `<FlagsPanel />` renders two columns: Green Flags + Red Flags on tablet+
- [x] R11: Each flag is a `<li>` item with appropriate badge in the column header (FlagChip pattern was merged into Column for simplicity — `<Column />` renders the badge once per column rather than per chip)
- [x] R12: Green Flags column shows a green ✓ badge in its header
- [x] R13: Red Flags column shows a red ✗ badge in its header
- [x] R14: Each item uses `line-clamp-3` to gracefully handle longer text

## Flag extraction
- [x] R15: `lib/flag-extractor.ts` exports `extractFlags(report: FinalReport): { green: string[]; red: string[] }`
- [x] R16: Dimensions with `score >= 7` produce a green flag; `score <= 4` produces a red flag; 5–6 produce no flag
- [x] R17: All three items in `top_fixes` always appear as red flags
- [x] R18: Flag extraction is a pure function — no side effects, deterministic

## Optional — DimensionMeter (Phase 0 stretch)
- [ ] R19: ~~four small bars below the gauge~~ *(skipped per spec — dimension info already surfaces via the green/red flags)*
- [x] R20: Skipped cleanly — no placeholder div left behind

## Responsive
- [x] R21: At 375px, FlagsPanel stacks Green above Red (`grid-cols-1 md:grid-cols-2`)
- [ ] R22: ~~AuraGauge size adapts: ~220px mobile, ~320px desktop~~ *(currently fixed 280px — visually acceptable on both, but full responsive scaling deferred to 0.5 polish)*
- [x] R23: The score number stays inside the ring (text-6xl + tabular-nums)

## Non-functional
- [x] R24: No `any` types
- [x] R25: Score animation uses RAF, doesn't block scrolling
- [x] R26: No console warnings — `<li key={i}>` keys are stable within a render
