# Requirements — Launchpad

> Tick `[x]` as each ships. All must pass before merging.

## Page + routing
- [ ] R1: Route `/` renders the launchpad (replaces the existing SDK-comparison home page)
- [ ] R2: The previous SDK-comparison code in `frontend/app/page.tsx` is removed (not commented out)
- [ ] R3: Clicking either CTA pushes to `/upload`

## Visual content
- [ ] R4: Headline "Welcome to Vibe Invest" rendered (exact copy in `lib/copy.ts`)
- [ ] R5: Sub-copy: one-sentence tagline (≤ 80 chars) — copy lives in `lib/copy.ts`
- [ ] R6: Hero character SVG/PNG centered above the CTAs (asset from Lane C)
- [ ] R7: Two CTA buttons: primary **Verify Pitch**, secondary **Generate Roast**
- [ ] R8: Background uses the neon-on-dark palette defined in `tailwind.config` (greens / blues / magenta)

## Components
- [ ] R9: `<HeroCharacter />` accepts no props; renders the brand character
- [ ] R10: `<LaunchpadCTA />` accepts `{ label, href, variant: 'primary' | 'secondary' }` props
- [ ] R11: Copy strings live in `frontend/lib/copy.ts`, not inline in JSX

## Responsive
- [ ] R12: Renders correctly at 375px (mobile), 768px (tablet), 1280px (desktop)
- [ ] R13: CTAs stack vertically on mobile, sit side-by-side from 768px up

## Non-functional
- [ ] R14: No console errors in dev or production build
- [ ] R15: No `any` types in any new file
- [ ] R16: Page loads under 1.5s on a Vercel free deploy (Lighthouse mobile)
