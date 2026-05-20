---
log_id: 015
title: Link Railway-deployed backend to Expo frontend for APK builds
date: 2026-05-21
status: completed
---

# Link Railway-deployed backend to Expo frontend for APK builds

## What was done
Pointed the Expo app at the deployed backend (`https://vibeinvest-backend-production.up.railway.app`) by setting `EXPO_PUBLIC_API_BASE_URL` in `.env` for local dev and in every `eas.json` build profile so that EAS-built APKs use the production URL instead of falling back to localhost.

## Reasoning
`services/api.ts` already resolves `API_BASE_URL` from `process.env.EXPO_PUBLIC_API_BASE_URL`, falling back to `localhost`/`10.0.2.2`, so no code change was needed — only configuration. The value had to be set in two places: `.env` covers `npx expo start` (dev), but `.env` is gitignored and therefore never uploaded to the EAS Build server, so the same var was added to `eas.json` build profiles to keep APK builds correct. The URL is a public endpoint (no secret), so committing it in `eas.json` is safe.

## Tool Calls
- READ `services/api.ts`
- READ `.env`
- READ `eas.json`
- READ `app.json`
- WRITE `.env`
- WRITE `eas.json`
- RUN `curl` health probes against the Railway backend (`/docs`, `/api/auth/signin`, `/api/analyses/recent`)
- RUN `grep` for CORS config in `backend/app/main.py`

## Files Changed
| File | Action |
|------|--------|
| `.env` | modified — added `EXPO_PUBLIC_API_BASE_URL` |
| `eas.json` | modified — added `env.EXPO_PUBLIC_API_BASE_URL` to `development`, `preview`, `production` profiles |

## Errors & Recovery
- First `.env` Edit failed (file not read via the Read tool first) → re-read with Read tool, then edited.
- `curl` to `/api/analyses/recent?limit=1` failed due to zsh globbing the `?` → re-ran with the URL quoted.

## Outcome
Backend verified live: `/docs` → 200, `/api/auth/signin` → 401 with valid JSON (DB + auth working), CORS is `allow_origins=["*"]` so web also works.

Frontend now targets the Railway backend.
- Dev: run `npx expo start -c` (first run with `-c` so the new env var is re-inlined).
- APK: run `eas build -p android --profile preview`.

Next steps / notes:
- Confirm the LLM keys (`GOOGLE_API_KEY`, `OPENAI_API_KEY`, `CLAUDE_API_KEY`, `TAVILY_API_KEY`) are set as Railway environment variables, otherwise the agent pipeline will fail server-side.
- Commit `eas.json`; keep `.env` uncommitted (gitignored).
