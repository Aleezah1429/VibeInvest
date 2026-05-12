# Requirements — Launchpad

> Tick `[x]` as each ships. All must pass before merging.

## Page + routing
- [x] R1: Route `/` renders the launchpad (replaces the existing SDK-comparison home page)
- [x] R2: The previous SDK-comparison code in `frontend/app/page.tsx` is removed (not commented out) — and dead components `SdkCard.tsx`, `lib/sdk-data.ts`, route `/sdk/[slug]/` deleted
- [x] R3: Clicking either CTA pushes to `/upload` *(route doesn't exist yet — will 404 until upload-hub ships)*

## Visual content
- [x] R4: Headline "Welcome to Vibe Invest" rendered (exact copy in `lib/copy.ts`)
- [x] R5: Sub-copy: one-sentence tagline (≤ 80 chars) — copy lives in `lib/copy.ts`
- [x] R6: Hero character SVG centered above the CTAs *(placeholder geometric SVG — Lane C swaps for real character art in Phase 0.5)*
- [x] R7: Two CTA buttons: primary **Verify Pitch**, secondary **Generate Roast**
- [x] R8: Background uses the neon-on-dark palette defined via Tailwind 4 `@theme` in `globals.css` (greens / blues / magenta)

## Components
- [x] R9: `<HeroCharacter />` accepts no props; renders the brand character
- [x] R10: `<LaunchpadCTA />` accepts `{ label, href, variant: 'primary' | 'secondary' }` props
- [x] R11: Copy strings live in `frontend/lib/copy.ts`, not inline in JSX

## Responsive
- [ ] R12: Renders correctly at 375px (mobile), 768px (tablet), 1280px (desktop) *(needs manual browser check at all 3 widths)*
- [x] R13: CTAs stack vertically on mobile, sit side-by-side from 768px up (Tailwind `flex-col md:flex-row`)

## Non-functional
- [x] R14: No console errors in dev or production build (verified — `npm run build` ✓, dev server boots and returns 200)
- [x] R15: No `any` types in any new file
- [ ] R16: Page loads under 1.5s on a Vercel free deploy (Lighthouse mobile) *(needs deploy first)*
