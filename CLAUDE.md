# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repo reality vs. README

The README, ROADMAP, and FEATURES files describe a planned architecture (FastAPI + sse-starlette backend, Next.js 15 frontend in `frontend/`, Google ADK agents in `google-adk-agent/`, multi-SDK runners under `api/`). **None of that exists in this repo yet.** What is actually checked in:

- An **Expo React Native** app (iOS/Android/web) using Expo Router, located at the project root.
- `google-adk-agent/` is empty.
- There is no `api/`, no `frontend/`, no `features/`, no `specs/`. Agent output, the Aura Score, and recent reports are **hardcoded placeholder data** in `app/report.tsx`, `app/loading.tsx`, `app/handoff.tsx`, and `app/search.tsx`.

Treat the spec docs as design intent, not current state. When a task references something from README/AGENTS.md that doesn't exist, confirm with the user before scaffolding it — they may have meant the placeholder version.

## Commands

```bash
npm start            # expo start (dev server, choose platform interactively)
npm run ios          # expo start --ios
npm run android      # expo start --android
npm run web          # expo start --web
npm run lint         # expo lint (ESLint with eslint-config-expo)
npm run reset-project # scripts/reset-project.js — DESTRUCTIVE, moves app/ into app-example/
```

No test runner is wired up (no `jest`, no `test` script) despite AGENTS.md mentioning Jest + RNTL. If a task requires tests, surface this gap before adding a framework — `AGENTS.md` lists "Install new dependencies" as a NEVER-without-approval action.

There is no typecheck script. Run `npx tsc --noEmit` if you need one.

## Architecture

**Routing.** Expo Router uses file-based routing from `app/`. The stack defined in `app/_layout.tsx` is:
`index → search → loading → handoff → report`
All screens are headerless (`headerShown: false`) on a fixed dark background `#09090F`. Navigation uses `useRouter().push()` with `expo-router`'s `pathname` + `params` shape. `params.name` (the startup name) is the value threaded through the flow.

**Splash flow.** `app/_layout.tsx` blocks the native splash via `SplashScreen.preventAutoHideAsync()`, then plays a custom GIF (`assets/images/vibeinevst-logo.gif`) for 3.5s before fading 600ms. Total cold-start blocks UI for ~4s — keep this in mind when debugging "app is stuck" complaints.

**Mock pipeline.** The four-agent narrative (Skeptic / Munshi / Hype / CVO) is rendered, not run. `loading.tsx` runs a `setTimeout` choreography that pretends agents are working, then routes to `handoff.tsx` (also timed), then `report.tsx` which renders static content keyed off the startup name. There is no SSE, no API client, no real LLM call anywhere in the tree.

**Theming.** Dark-only. Colors are inline literals throughout (`#09090F` background, `#6366f1`/`#818cf8` indigo accents, `rgba(255,255,255,0.X)` for tiered text). `constants/theme.ts` and `components/themed-*.tsx` exist from the Expo template but most screens don't use them — they style with inline `StyleSheet.create`. Match the surrounding screen's pattern rather than introducing a theming layer.

**TypeScript.** `strict: true`. Path alias `@/*` → project root (e.g. `@/components/themed-text`). Per AGENTS.md: no `any`, no `ts-ignore`.

## House rules (from AGENTS.md)

These require **explicit user approval** before doing — don't just do them and ask forgiveness:

- Installing new dependencies.
- Editing `app.json`, iOS `Info.plist`, or `AndroidManifest.xml`.
- Changing the Expo Router structure (the screens registered in `app/_layout.tsx`).
- Deleting files.
- Backend/schema changes.

Other conventions: PascalCase components, camelCase hooks/utils, `SafeAreaView` for screen roots, 44pt minimum touch targets, conventional-commit messages (`feat:`, `fix:`, `chore:`, `refactor:`), no direct commits to `main`.

## `.agents/` directory

`.agents/skills/*.md` are playbooks (add-screen, add-component, add-api-call, write-test, debug-platform-issue, create-task-log). `.agents/specs/` holds PRD/PLAN. `.agents/traces/` is where the user expects task logs and execution traces to be written. Check the matching skill file before doing one of those task types — it encodes the user's preferred procedure.
