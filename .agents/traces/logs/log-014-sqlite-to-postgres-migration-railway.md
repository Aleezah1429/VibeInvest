---
log_id: 014
title: SQLite → PostgreSQL Migration (Railway Deployment Prep)
date: 2026-05-20
status: completed
---

# SQLite → PostgreSQL Migration (Railway Deployment Prep)

## What was done
Migrated the backend's persistence layer from a local SQLite file (`backend/data.db`) to a managed PostgreSQL instance on Railway, so the FastAPI app can be deployed without dragging a single-writer file DB along. Verified the connection, recreated the full schema on Postgres, and ran an end-to-end smoke test (signup → create analysis → completed report → `/api/analyses/recent`) against the new database.

## Reasoning
- SQLite is fine locally but unsuitable for a Railway deployment: it's single-writer, doesn't survive container restarts cleanly, and ties the backend to a specific filesystem. Railway provides a Postgres add-on with `DATABASE_URL` injection, which is the standard production-friendly path.
- Picked **fresh start** over data migration. The existing `data.db` only held throwaway test accounts plus orphan analyses from before the `user_id` column existed; preserving them wasn't worth the script + verification overhead.
- Kept the SQLite code path intact behind an `IS_SQLITE` flag. Local dev still works without env config — the resolver falls back to the sqlite file. This avoids a forced-Postgres-or-bust development workflow.
- Used the binary wheel `psycopg2-binary` rather than `psycopg2`. The binary distribution avoids requiring `libpq-dev` + a C toolchain on the dev machine and on Railway's build image. For production traffic at hackathon scale this is fine; if we ever go heavy, switch to `psycopg2` (compiled against system libpq) or `psycopg` (v3).
- Added `pool_pre_ping=True` and `pool_recycle=280` on the non-sqlite engine. Managed Postgres providers (Railway included) close idle TCP connections after ~5 min; without pre-ping, the first request after an idle period hits a dead socket and 500s. Recycle keeps connections under the provider timeout proactively.
- The user environment variable was named `POSTGRES_URL`, not `DATABASE_URL`. Rather than ask the user to rename it, the config resolver now accepts either, and also normalizes the legacy `postgres://` scheme (which Heroku/Railway sometimes emit and SQLAlchemy 2 rejects) to `postgresql://`.

## Tool Calls
- READ `backend/requirements.txt`
- READ `backend/app/db.py`
- READ `backend/app/config.py`
- READ `backend/run.sh`
- READ `.env` (env var lookup)
- WRITE `backend/requirements.txt` (added `psycopg2-binary`)
- WRITE `backend/app/config.py` (URL resolver: `DATABASE_URL` → `POSTGRES_URL` fallback + scheme normalization)
- WRITE `backend/app/db.py` (gated sqlite-only behavior behind `IS_SQLITE`; added `pool_pre_ping` / `pool_recycle` for non-sqlite)
- WRITE `backend/run.sh` (honor `$PORT`, drop `--reload` when `RAILWAY_ENVIRONMENT` or `ENV=prod`)
- WRITE `backend/Procfile` (Railway start command)
- RUN `venv/bin/pip install 'psycopg2-binary>=2.9'`
- RUN `venv/bin/python -c "engine.connect(); select version()"` → `PostgreSQL 18.4`
- RUN `venv/bin/python -c "init_db(); inspect tables/columns"` → all 5 tables, `analyses.user_id` present natively
- RUN end-to-end TestClient flow against Postgres → signup 201, POST analyses 201, GET `/recent` returns correctly shaped payload with `Market/Financials/Brand` breakdowns.

## Files Changed
| File | Action |
|------|--------|
| `backend/requirements.txt` | modified — added `psycopg2-binary>=2.9` |
| `backend/app/config.py` | modified — `_resolve_database_url()` resolver |
| `backend/app/db.py` | modified — `IS_SQLITE` gate, pool_pre_ping/pool_recycle on Postgres |
| `backend/run.sh` | modified — `$PORT` support, reload disabled on Railway |
| `backend/Procfile` | created — Railway start command |

## Errors & Recovery
- **`POSTGRES_URL` vs `DATABASE_URL`** — user's `.env` named the variable `POSTGRES_URL`. Resolver now accepts both, preferring `DATABASE_URL` if both are set (matches Railway's own convention).
- **No driver installed initially** — `psycopg2-binary` was missing from `requirements.txt`. Installed via pip + added to the requirements so deployment builds will pull it.
- **No errors during the smoke test.** `init_db()` ran clean; `create_all` produced an identical schema to what we had in SQLite, including the `user_id` FK + index.

## Outcome
- Backend now talks to Railway Postgres (`postgresql://…@hopper.proxy.rlwy.net:10365/railway`). Verified with a live connection (`SELECT version()` → PostgreSQL 18.4).
- All 5 tables present on Postgres: `users`, `analyses`, `agent_runs`, `raw_evidence`, `events`. `analyses` has `user_id` natively (no migration step needed on fresh DBs).
- End-to-end auth + analysis flow tested via FastAPI TestClient against the live Postgres: signup → token → POST analysis → mark completed → GET `/api/analyses/recent` returned the expected payload.
- Local sqlite path still works (resolver falls back when neither env var is set), so `npm run web` + local backend dev is unaffected.
- Frontend required **no changes** — it talks to the backend over HTTP, agnostic to the underlying DB.

## Deployment Checklist (Railway)
1. Push the repo (with the new `backend/Procfile` + `backend/requirements.txt`) to the Railway-connected GitHub repo, or `railway up` locally.
2. Confirm the Railway service has `DATABASE_URL` (or `POSTGRES_URL`) pointing at the Postgres add-on. Railway injects this automatically when you link the Postgres service to the backend service.
3. Set any other env vars on Railway: `SECRET_KEY` (override the default in `services/auth.py`), `CLAUDE_API_KEY`, `GOOGLE_API_KEY`, `TAVILY_API_KEY` as needed.
4. On first deploy, the FastAPI `startup` event calls `init_db()` which runs `Base.metadata.create_all()` and provisions the schema on Postgres. No manual migration step.
5. Once the backend is deployed, set `EXPO_PUBLIC_API_BASE_URL` in the Expo app's environment to the Railway public URL (e.g. `https://vibeinvest-api.up.railway.app`) so the frontend stops talking to `127.0.0.1:8000`.

## Next Steps (optional / future)
- If we ever need real DB migrations (rename a column, change a type), switch from `Base.metadata.create_all()` to Alembic. `alembic` is already in `requirements.txt` so this is mostly a config + first-revision job.
- Consider replacing the default `SECRET_KEY` in `backend/app/services/auth.py` with a Railway-managed secret before any non-test signups happen on the deployed instance.
- Rotate the Postgres password in `.env` if this repo's `.env` ever leaks (the URL is in plaintext today).
