# Plan — Aura Audit

## Goal
The interactive feedback view that turns the CVO's `final_report` into a glanceable, shareable verdict. The hero element is a circular **Aura Score** gauge (0–1000) with a glow ring whose color reflects the verdict tier. Below the gauge: two columns of **Green Flags** (validated strengths) and **Red Flags** (concerns), pulled from the CVO's dimensional notes and the upstream agent reports.

**Phase:** 0 (hackathon MVP).

## User stories
- As a founder, after the boardroom finishes I see a single big number that tells me where I stand.
- As a founder, the verdict color (green for Invest, blue for Iterate, magenta for Pivot, red for Pass) is unambiguous.
- As a founder, I see exactly which dimensions earned me green flags and which earned red flags — so I know what to fix.
- As a demo audience member, the gauge animation from 0 → final score is satisfying in under 2 seconds.
- As Lane B, I render this view from `final_report` alone — no extra backend call.

## Architecture sketch

```
components/
  aura-audit/
    AuraGauge.tsx                 The circular score gauge (SVG, animated)
    FlagsPanel.tsx                Side-by-side green / red flags
    FlagChip.tsx                  One flag row (icon + short text)
    DimensionMeter.tsx            (optional) per-dimension 1-10 bar — feeds into share card

lib/
  flag-extractor.ts               Pure function: (FinalReport) → { greenFlags, redFlags }
  verdict-theme.ts                Verdict → { color, glow, label, emoji } mapping
```

## Flag extraction logic

The CVO produces dimensional scores and notes. We classify them as green or red based on score thresholds — a pure function so it's testable:

```ts
function extractFlags(report: FinalReport): { green: string[]; red: string[] } {
  const green: string[] = [];
  const red: string[] = [];
  for (const [name, dim] of Object.entries(report.dimensions)) {
    const label = `${capitalize(name)}: ${dim.note}`;
    if (dim.score >= 7) green.push(label);
    else if (dim.score <= 4) red.push(label);
    // 5–6 is neutral; doesn't get a flag
  }
  // Top 3 fixes are always red flags (they're things to fix)
  for (const fix of report.top_fixes) red.push(fix);
  return { green, red };
}
```

We also pull `red_flags` from the Skeptic and `financial_red_flags` from the Munshi if available — they're already in the run state from the squad-report view.

## Verdict theme

```ts
const VERDICT_THEME = {
  invest:  { color: 'green',   glow: '0 0 40px rgba(34,197,94,0.6)',   label: 'INVEST!' },
  iterate: { color: 'blue',    glow: '0 0 40px rgba(59,130,246,0.6)',  label: 'ITERATE' },
  pivot:   { color: 'magenta', glow: '0 0 40px rgba(217,70,239,0.6)',  label: 'PIVOT' },
  pass:    { color: 'red',     glow: '0 0 40px rgba(239,68,68,0.6)',   label: 'PASS' },
};
```

## Decisions
- **One pure function for flags.** Frontend logic only — no second model call.
- **Animate the score on first render only.** If the user scrolls back up, the gauge stays at the final score (no re-animation, no jank).
- **Dimension meters are optional in Phase 0.** The 4 dimension scores can render as small bars under the gauge if there's time. The view works without them.
- **Green Flags and Red Flags are side-by-side on desktop, stacked on mobile.** The visual contrast is the message.

## Out of scope (Phase 0)
- Drill-down click on a flag to see the upstream agent quote (Phase 1)
- "Why this score?" expandable section (Phase 1)
- Compare-to-previous-run delta (Phase 2 — re-roast tracker)
- Sharing this specific view (sharing happens on the Final Verdict view)
