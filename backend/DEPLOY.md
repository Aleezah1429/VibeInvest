# Deploying the VibeInvest Backend to Railway

This is the canonical checklist for getting `backend/` running on Railway as a public HTTPS service backed by Railway-managed PostgreSQL.

The frontend (Expo React Native app) stays untouched aside from one env var pointing it at the deployed URL.

---

## 0. Prerequisites

- A Railway account at <https://railway.app>.
- The repo pushed to GitHub (Railway connects via GitHub).
- A PostgreSQL service already provisioned in your Railway project (you've done this).
- Locally working backend against the Railway Postgres (verified with `select version()` returning `PostgreSQL 18.4`).

You should know your Railway project name and have access to the dashboard.

---

## 1. Repo shape — what Railway needs to find

```
/ (repo root)
└── backend/
    ├── app/                # FastAPI source (package)
    ├── requirements.txt    # Python deps (incl. psycopg2-binary)
    ├── Procfile            # web: uvicorn app.main:app --host 0.0.0.0 --port $PORT
    └── run.sh              # local-only convenience, ignored by Railway
```

Everything Railway needs is inside `backend/`. The Procfile start command is **relative to that directory** (`app.main:app`), which is why we set Root Directory = `backend/` in step 3.

> **Why not the repo root?** The repo also contains the Expo React Native frontend, which has its own `package.json`. If Railway used the repo root it would try to detect Node and build the wrong service. Scoping to `backend/` keeps the Python build clean.

---

## 2. Create the backend service on Railway

1. In your Railway project dashboard, click **+ New** → **GitHub Repo**.
2. Pick the `VibeInvest` repo. Railway will clone it.
3. Railway will create a new service. Click into it.

> If you already have a backend service from earlier experimentation, you can reuse it — just update the settings below.

---

## 3. Configure the service

Open the service → **Settings** tab.

### Source

- **Root Directory**: `backend`
- **Branch**: `main` (or whichever branch you deploy from)
- **Watch Paths** (optional): `backend/**` — prevents frontend-only commits from triggering rebuilds.

### Build

- **Builder**: Nixpacks (default — leave it).
- **Build Command**: leave blank. Nixpacks auto-detects Python from `requirements.txt` and runs `pip install -r requirements.txt`.
- **Custom Install Command**: leave blank.

### Deploy

- **Start Command**: leave blank — Railway will read `Procfile` and use:
  ```
  uvicorn app.main:app --host 0.0.0.0 --port $PORT
  ```
- **Healthcheck Path**: `/health` (FastAPI already exposes this).
- **Restart Policy**: `On Failure` (default).

### Networking

- Click **Generate Domain** to mint a public URL like `https://vibeinvest-api-production.up.railway.app`. Copy this — you'll need it for the frontend.

---

## 4. Link the Postgres service

This is the step that injects `DATABASE_URL` into the backend automatically.

1. In the backend service → **Variables** tab → **+ New Variable** → **Add Reference**.
2. Select your **Postgres** service.
3. Pick **`DATABASE_URL`** from its variables.
4. Save.

After this, the backend's environment has `DATABASE_URL=postgresql://…` pointing at the Railway-managed Postgres. You do **not** need to copy/paste the URL manually.

> The code resolver (`backend/app/config.py:_resolve_database_url`) reads `DATABASE_URL` first, falls back to `POSTGRES_URL`, and normalizes the legacy `postgres://` scheme — so any of Railway's naming variations Just Work.

---

## 5. Set the other environment variables

Still in the backend service → **Variables** tab → **+ New Variable** → **Raw Editor** for bulk paste.

| Variable | Required? | Notes |
|---|---|---|
| `SECRET_KEY` | **yes for prod** | Used to sign JWT-like session tokens. Generate with `python -c "import secrets; print(secrets.token_hex(32))"`. Do **not** keep the hardcoded default. |
| `CLAUDE_API_KEY` (or `ANTHROPIC_API_KEY`) | yes | Used by the agents. |
| `GOOGLE_API_KEY` | yes | Used by Gemini-backed agents and Google sign-in. |
| `TAVILY_API_KEY` | yes | Web search for the Skeptic agent. |
| `OPENAI_API_KEY` | optional | Only if you're using OpenAI providers. |
| `LLM_PROVIDER` | optional | Default `claude`. Can be set to `gemini` etc. |
| `CLAUDE_MODEL` | optional | Default `claude-sonnet-4-5`. |
| `CLAUDE_MODEL_CVO` | optional | Default `claude-opus-4-5`. |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | optional | Default `1440` (24 h). |
| `PIPELINE_TIMEOUT_SEC` | optional | Default `180`. |
| `AGENT_TIMEOUT_SEC` | optional | Default `60`. |

Variables Railway sets automatically (no action needed):
- `PORT` — read by `Procfile`.
- `RAILWAY_ENVIRONMENT` — your code can branch on this if needed.

> **Never commit `.env`** to the repo. Confirm it's in `.gitignore` before pushing. Railway's Variables UI is the source of truth in production.

---

## 6. Deploy

1. Hit **Deploy** (or push a commit to the watched branch — Railway redeploys on push).
2. Watch the **Deployments** tab. The build phase should show `pip install -r requirements.txt` succeeding (including `psycopg2-binary`).
3. The deploy phase should show uvicorn starting:
   ```
   INFO: Uvicorn running on http://0.0.0.0:PORT
   INFO: Application startup complete.
   ```
4. On first boot, FastAPI's startup event calls `init_db()` which runs `Base.metadata.create_all()` against the Railway Postgres — your `users`, `analyses`, `agent_runs`, and `raw_evidence` tables are provisioned automatically. No manual migration.

---

## 7. Verify the deployment

Replace `<your-url>` with the domain from step 3.

```bash
# Health check (should be {"status":"ok"})
curl https://<your-url>/health

# Auth flow
curl -X POST "https://<your-url>/api/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{"name":"Smoke","email":"smoke@test.dev","password":"secret123"}'

# Take the access_token from the response, then:
curl "https://<your-url>/api/analyses/recent" \
  -H "Authorization: Bearer <token>"
# → should return []
```

If `/health` succeeds but `/api/auth/signup` 500s, check the **Logs** tab — most likely either:
- `DATABASE_URL` isn't injected (revisit step 4).
- `SECRET_KEY` is unset and you've made the default invalid somehow (unlikely; the code has a fallback).
- A Python import error from a missing env var.

---

## 8. Point the frontend at the deployed backend

The frontend already reads `EXPO_PUBLIC_API_BASE_URL` (`services/api.ts:14`). Set it before building the web bundle:

```bash
# Local web dev pointing at prod:
EXPO_PUBLIC_API_BASE_URL=https://<your-url> npm run web
```

For a hosted web build (Vercel, Netlify, etc.), set `EXPO_PUBLIC_API_BASE_URL` in that platform's env vars. For native EAS builds, set it in `eas.json`.

> Don't put a trailing slash on the URL — `services/api.ts` builds paths with a leading `/`.

---

## 9. CORS

The backend currently allows all origins (`backend/app/main.py:10-16`):

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=False,
)
```

This is fine while iterating, but before sharing the URL publicly, narrow `allow_origins` to your actual frontend domain(s) — wide-open CORS is one of the easier ways to leak data through a misconfigured app.

---

## 10. Updating later

- **Code change**: `git push` → Railway redeploys automatically.
- **New dependency**: add to `backend/requirements.txt` → push → Railway reinstalls.
- **Schema change**: the current setup uses `Base.metadata.create_all()`, which is **add-only** — it never drops or alters existing columns. When you change a column type or rename one, you'll need to either:
  1. Drop the affected table from Railway's Postgres (acceptable while in dev), or
  2. Add Alembic (already in `requirements.txt`) and write migrations.
- **Rotate Postgres creds**: do it from the Postgres service dashboard. Because the backend references the variable rather than the literal URL, no backend redeploy is needed beyond Railway's automatic restart.

---

## Troubleshooting cheatsheet

| Symptom | Likely cause | Fix |
|---|---|---|
| Build fails at `pip install psycopg2-binary` | Wrong root directory | Set Root Directory = `backend` in Settings. |
| Deploy succeeds but `/health` returns 502 | uvicorn binding wrong port | Check `Procfile` uses `$PORT`, not a hardcoded number. |
| 500 on every request mentioning `connection refused` | `DATABASE_URL` not injected | Re-link the Postgres service variable (step 4). |
| 500 mentioning `database is locked` | Backend somehow still on sqlite | Verify `DATABASE_URL` is set on the service and starts with `postgresql://`. |
| `relation "users" does not exist` | `init_db()` didn't run | Restart the service — startup event runs on every boot. |
| Frontend gets `Failed to fetch` | Wrong `EXPO_PUBLIC_API_BASE_URL` or CORS | Confirm the URL is exact, no trailing slash; CORS is `["*"]` so that's not it. |
| Auth tokens stop validating after a redeploy | `SECRET_KEY` changed between deploys | Set `SECRET_KEY` as a Railway variable so it stays stable across deploys. |

---

## Files this guide references

- `backend/Procfile` — Railway start command (`uvicorn app.main:app --host 0.0.0.0 --port $PORT`).
- `backend/requirements.txt` — Python deps including `psycopg2-binary`.
- `backend/app/config.py` — `_resolve_database_url()` (accepts `DATABASE_URL` or `POSTGRES_URL`).
- `backend/app/db.py` — `IS_SQLITE` gate, `pool_pre_ping`/`pool_recycle` for managed Postgres.
- `backend/app/main.py` — startup event runs `init_db()`.
- `backend/run.sh` — local-dev runner; reads `$PORT` so the same script works for any host.
