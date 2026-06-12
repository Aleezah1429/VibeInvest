---
log_id: 017
title: Free no-card backend deployment (Back4App Containers + Neon), replacing paid Railway
date: 2026-06-12
status: partial
---

# Free no-card backend deployment (Back4App Containers + Neon)

## What was done
Replaced the paid Railway backend with a **free, no-credit-card** stack. The DB is
**Neon Postgres** (free, persistent — already created, `DATABASE_URL` set and
verified). The backend host is **Back4App Containers** (deploys the repo's
`backend/Dockerfile` from GitHub, no card, built for general backends). Verified
the whole backend locally against Neon before deploying. Removed the stale Railway
and abandoned-host artifacts and pointed all docs at the new stack. Created the
sanitized `.env.example`. The Back4App deploy itself is the user's final step
(GitHub-connected, needs their account).

## The host hunt (why Back4App)
Paid/blocked options were ruled out one by one — this is the real state of free
hosting in 2026:
- **Railway** — worked but billed (the reason for the move).
- **Render** — Blueprint deploy demands credit-card verification.
- **Koyeb** — new accounts are forced onto a $30 Pro plan + card.
- **Hugging Face Spaces** — deployed fine (Docker, port 7860) but HF **auto-flagged
  it "abusive"** (`stage: PAUSED`) — their moderation flags generic API backends
  that call external services; not a fit.
- **Back4App Containers** — free, **no card**, Docker-from-GitHub, no abuse flag,
  600 active hours/month (scale-to-zero when idle). ✅ chosen.
- **Cloudflare quick tunnel** — kept as an instant no-signup fallback for demos.

## Local verification (de-risks the deploy)
Created a venv, installed `backend/requirements.txt`, booted
`uvicorn app.main:app` against the real Neon `DATABASE_URL`:
- `GET /health` → `200 {"status":"ok"}` (startup + `init_db` against Neon OK)
- `POST /api/auth/signup` → `201` with a bearer token (Neon **writes** work)
So the code + DB are confirmed healthy; only the Back4App dashboard config remains.

## Tool Calls
- WEBSEARCH no-card hosts (2026) → Koyeb, HF, then Back4App confirmed card-free
- WRITE `backend/Dockerfile` (uvicorn on `${PORT:-7860}`), `.env.example`
- WRITE `backend/DEPLOY_BACK4APP.md`; removed `render.yaml`, `DEPLOY_RENDER.md`, `DEPLOY_KOYEB.md`, `DEPLOY_HF.md`, and the old Railway `backend/DEPLOY.md`
- RUN `python -m venv`, `pip install -r requirements.txt`, `uvicorn` (bg), `curl /health`, `curl signup` → 201
- RUN `hf upload` (HF attempt) — Space later auto-flagged, abandoned
- EDIT `eas.json` + `.env` → Back4App placeholder + generated `SECRET_KEY`
- EDIT `README.md`, `outcomes.md`, `error-recovery.md` — Railway → Back4App/Neon

## Files Changed
| File | Action |
|------|--------|
| `backend/Dockerfile` | created — container image (works on Back4App/HF/any Docker host) |
| `backend/DEPLOY_BACK4APP.md` | created — free, no-card deploy runbook |
| `.env.example` | created — sanitized template |
| `backend/DEPLOY.md` (Railway) | **removed** (stale) |
| `render.yaml`, `DEPLOY_RENDER.md`, `DEPLOY_KOYEB.md`, `DEPLOY_HF.md` | created then **removed** (card/abuse dead-ends) |
| `eas.json`, `.env` | modified — Back4App URL placeholder; `.env` gets generated `SECRET_KEY` |
| `README.md`, `outcomes.md`, `error-recovery.md` | modified — Railway refs → Back4App + Neon |

## Errors & Recovery
- Render & Koyeb both hit a credit-card wall → web-searched no-card options.
- HF Space auto-flagged "abusive" (read via public API: `stage: PAUSED`,
  `errorMessage: Flagged as abusive`) → abandoned HF for a general-backend host.
- Base system Python lacked `fastapi` → created a venv to run/verify locally.

## Outcome
Stack is **Neon (DB, live) + Back4App (backend host, free/no-card)**; backend
verified working locally against Neon. **Remaining (user's step):** push
`backend/Dockerfile` to GitHub `main`, deploy on Back4App (root `backend`, port
`7860`, env vars set), grab the `*.b4a.run` URL → wire `.env`/`eas.json` → 
`eas build -p android --profile preview` for the installable APK.

Cleanup for the user: delete the unused Render, Koyeb, and Hugging Face accounts/Space.
