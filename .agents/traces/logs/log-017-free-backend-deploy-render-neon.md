---
log_id: 017
title: Prepare free backend deployment (Koyeb + Neon), replacing paid Railway
date: 2026-06-10
status: completed
---

# Prepare free backend deployment (Koyeb + Neon)

## What was done
Railway was removed (it was billing cost). First prepared a Render Blueprint, but
Render's Blueprint flow requires credit-card verification ($1 temp auth) — the
user has no card — so pivoted to **Koyeb** (free, no card, never expires,
scale-to-zero) backed by a free, persistent **Neon** Postgres. Deliverable is a
step-by-step `backend/DEPLOY_KOYEB.md`; the Render `render.yaml`/`DEPLOY_RENDER.md`
were removed. Repointed the frontend env to a clearly-marked Koyeb placeholder
(the real URL has a random hash and can't be predicted). **Not committed.**

## Reasoning
The user can't have me create accounts or log into a host, so the deliverable is
"deploy-ready config + exact steps," not an actual live URL. Render free tier
needs no card and auto-deploys from GitHub; Neon was chosen over Render's own
free Postgres because Render's DB expires after 30 days while Neon is persistent.
`SECRET_KEY` uses Render's `generateValue` so it's stable across deploys — this
also closes ERR-002 in production. The backend already reads `DATABASE_URL`,
`SECRET_KEY`, and `ALLOWED_ORIGINS` from env (log-016), so no app code changed —
only deploy config and the frontend URL.

## Tool Calls
- READ `backend/{Procfile,run.sh,DEPLOY.md,requirements.txt}`, `eas.json`, `.env`
- RUN `git remote -v` (confirmed GitHub: Aleezah1429/VibeInvest)
- WRITE `render.yaml` (Render Blueprint, rootDir backend, free plan, env vars)
- WRITE `backend/DEPLOY_RENDER.md` (Neon + Render walkthrough)
- WRITE `eas.json` (3 profiles → Render URL)
- WRITE `.env` (EXPO_PUBLIC_API_BASE_URL → Render URL)

## Files Changed
| File | Action |
|------|--------|
| `backend/DEPLOY_KOYEB.md` | created — free, no-card deploy guide |
| `render.yaml` | created then **removed** (Render needs a card) |
| `backend/DEPLOY_RENDER.md` | created then **removed** |
| `eas.json` | modified — API URL → Koyeb placeholder (3 profiles) |
| `.env` | modified — API URL → Koyeb placeholder (gitignored) |

## Errors & Recovery
- `AskUserQuestion` permission stream closed once; re-asked — user chose Render+Neon.
- **Render dead-end**: the Blueprint deploy screen demanded a credit card. Web-
  searched current no-card options (June 2026) → Koyeb confirmed free, no card,
  never expires. Pivoted; removed the Render artifacts.

## Outcome
Backend is deploy-ready on a fully no-card free stack. User steps: create/copy
Neon `DATABASE_URL` → Koyeb **Create Web Service → GitHub**, work dir `backend`,
run `uvicorn app.main:app` → paste secrets → deploy → verify `/health`. Koyeb's
URL has a random hash, so the frontend holds a placeholder — paste the real URL
in chat and Claude wires `.env` + `eas.json`.

Next steps:
- After deploy, send the real Koyeb URL → wire frontend → `expo start -c` / EAS rebuild.
- Optionally mark the Railway `backend/DEPLOY.md` superseded by `DEPLOY_KOYEB.md`.
