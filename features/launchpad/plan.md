# Plan — Launchpad

## Goal
A one-screen welcome that introduces VibeInvest in five seconds and routes the founder to the upload flow. This is the first impression — it sets the brand tone (neon FinTech, brutal-but-fun) before the agents do.

**Phase:** 0 (hackathon MVP).

## User stories
- As a first-time visitor, I land on a screen that explains what VibeInvest does in one sentence.
- As a founder ready to validate an idea, I click **Verify Pitch** and go to the upload page.
- As a curious visitor, I click **Generate Roast** and also go to the upload page — same destination, different framing (one is serious, one is fun).
- As a mobile user, the screen looks good on a 375px-wide viewport.

## Architecture sketch

```
app/
  page.tsx                        Launchpad (this feature)
  layout.tsx                      Root layout with global fonts + neon theme

components/
  launchpad/
    HeroCharacter.tsx             SVG/PNG character art with subtle motion
    LaunchpadCTA.tsx              Reusable CTA button (primary / secondary variants)

lib/
  copy.ts                         Centralized strings (so Lane C can edit copy without touching JSX)
```

Routing: clicking either CTA pushes to `/upload`.

## Decisions
- **No auth.** Guest-first flow. Authentication waits for Phase 2.
- **Two CTAs, same destination.** "Verify Pitch" (serious) and "Generate Roast" (fun) both go to `/upload`. The duplication is a marketing affordance, not a feature split.
- **Character art is non-negotiable.** The character is the brand. Lane C ships the SVG by end of Day 0.
- **No analytics in MVP.** Add basic Vercel Analytics post-submission.

## Out of scope (Phase 0)
- Sign-in / sign-up
- Language toggle on the launchpad (handled inside the upload screen)
- Animated intro reel
- "How it works" walkthrough modal
- Demo idea quick-pick on the launchpad (it lives on `/upload`)
