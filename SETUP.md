# Setup — VibeInvest

Everything you need to install, configure, and run VibeInvest locally. Single source of truth for API keys, environment variables, and run commands.

If a command in this file doesn't work, the file is wrong — open an issue or fix it. Do not let an out-of-date setup doc waste anyone's morning.

---

## TL;DR (already-set-up case)

You've cloned the repo, installed deps once, filled in `.env`. To run:

```bash
# Terminal 1 — backend (from repo root)
./api/venv/bin/uvicorn api.main:app --reload --port 8000

# Terminal 2 — frontend (from repo root)
npm run dev --prefix frontend
```

Open http://localhost:3000.

---

## API keys you need

| Key | Required? | Where to get it | Where it goes |
| --- | --- | --- | --- |
| `GOOGLE_API_KEY` | **Yes** (primary) | [aistudio.google.com/apikey](https://aistudio.google.com/apikey) — free, sign in with any Google account | `google-adk-agent/.env` |
| `ANTHROPIC_API_KEY` | No | [console.anthropic.com](https://console.anthropic.com/) → API Keys | `claude-agent/.env` *(only if you set up the comparison runner)* |
| `OPENAI_API_KEY` | No | [platform.openai.com/api-keys](https://platform.openai.com/api-keys) | `openai-agent/.env` *(only if you set up the comparison runner)* |

**You only need `GOOGLE_API_KEY` for the VibeInvest demo.** The Anthropic and OpenAI ones are for the optional "see the same pipeline on different SDKs" bonus demo; without them, those routes return 503 but the app still works.

### Getting the Google Gemini key (the only one you actually need)

1. Open https://aistudio.google.com/apikey
2. Sign in with any Google account
3. Click **Create API key** → pick a project (or "Create API key in new project")
4. Copy the key — looks like `AIza...`
5. Paste it into `google-adk-agent/.env` (see next section)

The free tier covers way more than a hackathon demo. No credit card needed.

---

## First-time setup

### 0. Clone + open the repo

```bash
git clone <your-repo-url>
cd VibeInvest
```

### 1. Backend — Python venv + deps

```bash
# From repo root
python3 -m venv api/venv
./api/venv/bin/pip install -r api/requirements.txt
```

This installs FastAPI, `google-adk`, Pydantic, `python-dotenv`, `requests`, `beautifulsoup4`, `sse-starlette`, and friends. Takes ~1–2 min.

### 2. Backend — environment

```bash
cp google-adk-agent/.env.example google-adk-agent/.env
```

Then open `google-adk-agent/.env` in your editor and replace `your_gemini_api_key_here` with the real Gemini key from above.

The file should look like:

```ini
GOOGLE_API_KEY=AIza...your_real_key_here...
ALLOWED_ORIGINS=http://localhost:3000
```

`ALLOWED_ORIGINS` is the CORS allowlist. Add your Vercel deploy URL here later when you deploy:

```ini
ALLOWED_ORIGINS=http://localhost:3000,https://vibeinvest.vercel.app
```

### 3. Frontend — npm install

```bash
npm install --prefix frontend
```

Takes ~30s. No env file needed for local dev — the frontend talks to the backend via the dev proxy (default: `http://localhost:8000`).

---

## Running

### Daily flow — two terminals

**Terminal 1 — backend** (from repo root):

```bash
./api/venv/bin/uvicorn api.main:app --reload --port 8000
```

Healthy output:

```
INFO:     Application startup complete.
INFO:     Uvicorn running on http://127.0.0.1:8000
```

Verify it's up:

```bash
curl http://localhost:8000/api/health
# → {"status":"ok"}
```

**Terminal 2 — frontend** (from repo root):

```bash
npm run dev --prefix frontend
```

Healthy output:

```
✓ Ready in 2.2s
- Local:        http://localhost:3000
```

Open http://localhost:3000 — you should land on the Launchpad.

### Smoke test the agent pipeline (after Day 1 R25–R34)

```bash
curl -N -X POST http://localhost:8000/api/run/google-adk \
  -H "Content-Type: application/json" \
  -d '{"idea_text":"Chai delivery startup for LUMS campus"}'
```

You should see SSE events stream by: `pipeline_start` → `agent_start (skeptic)` → `agent_text` events → `agent_complete` → `agent_handoff` → … → `pipeline_complete` with the full `final_report`.

Total wall-clock: ~30–45 seconds.

---

## Environment variable reference

### `google-adk-agent/.env` (backend)

| Var | Required? | Default | Notes |
| --- | --- | --- | --- |
| `GOOGLE_API_KEY` | **Yes** | none | Gemini auth for ADK agents (Skeptic, Munshi, Hype, CVO) |
| `ALLOWED_ORIGINS` | **Yes** | `http://localhost:3000` | Comma-separated CORS allowlist. Add deploy URLs here. |

### `frontend/.env.local` (optional)

Not needed for local dev. Create only when pointing at a non-default backend:

| Var | Required? | Default | Notes |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | No | `""` (relative URL `/api/...`) | Set to `http://localhost:8000` if your frontend can't proxy to the backend. In production (Vercel), leave blank if backend is serverless on same domain; otherwise set to the FastAPI host. |

### Optional comparison runners

If you want to demo the same pipeline on Claude + OpenAI (extra technical depth for judges):

| Var | Required? | Where it goes |
| --- | --- | --- |
| `ANTHROPIC_API_KEY` | only if running `/api/run/claude` | `claude-agent/.env` |
| `OPENAI_API_KEY` | only if running `/api/run/openai` | `openai-agent/.env` |

You also have to create `claude-agent/agent_system.py` and `openai-agent/agent_system.py` — these are not in scope for the VibeInvest MVP (only the `google-adk-agent/` is). Without them, the routers return 503 gracefully and the rest of the app still works.

---

## What gets gitignored

`.gitignore` at the repo root excludes:
- All `.env` files (anywhere in the tree)
- `venv/` and `.venv/`
- `__pycache__/` and `*.pyc`
- `node_modules/`
- `.next/` build artifacts
- `.DS_Store` and editor config

`.env.example` files are explicitly *allowed* (with `!**/.env.example`). Never commit a real `.env`.

---

## Troubleshooting

### "No module named 'google.adk'"

Activate (or use) the venv:

```bash
./api/venv/bin/python -c "import google.adk; print('ok')"
```

If that errors, redo step 1 of First-time setup.

### "GOOGLE_API_KEY not set" / 401 from Gemini

Open `google-adk-agent/.env`. Confirm:
- The file exists (`ls google-adk-agent/.env`)
- `GOOGLE_API_KEY=` line has your actual key, no quotes, no trailing spaces
- The key is from https://aistudio.google.com/apikey (not Google Cloud Console — those are different)

### CORS error in browser console

Add the origin (including protocol + port) to `ALLOWED_ORIGINS` in `google-adk-agent/.env` and restart the backend.

### Frontend says "Couldn't reach the boardroom"

Check the backend is running on port 8000:

```bash
curl http://localhost:8000/api/health
```

If it's running on a different port, set `NEXT_PUBLIC_API_URL` in `frontend/.env.local`.

### `next: command not found`

You're in the wrong directory or `node_modules` is missing. From repo root:

```bash
npm install --prefix frontend
npm run dev --prefix frontend
```

### Tailwind classes not applying

Tailwind 4 uses `@theme` in `frontend/app/globals.css` (no `tailwind.config.ts` file). If you added a new color and it's not being picked up, restart the dev server — Tailwind 4 caches aggressively on first start.

---

## Deploying (post-hackathon)

Not in scope for the 2-day MVP, but for reference:

| Layer | Recommended host | Env vars to set |
| --- | --- | --- |
| Frontend | Vercel | `NEXT_PUBLIC_API_URL=<backend-url>` |
| Backend | Fly.io or Render | `GOOGLE_API_KEY`, `ALLOWED_ORIGINS` (include the Vercel URL) |

Don't deploy on submission day after the deadline window closes — see ROADMAP.md.
