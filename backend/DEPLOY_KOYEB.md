# Deploying the VibeInvest Backend — FREE, NO CREDIT CARD (Koyeb + Neon)

Render's Blueprint flow demands a credit card ($1 verification), so we use
**Koyeb** instead: free tier, **no credit card**, never expires, scale-to-zero.
**Neon** stays as the free, persistent Postgres database.

> ⏱️ ~10 minutes. Login is required (can't be automated). All app config is
> already in the repo — the backend reads everything from env vars.

---

## Step 1 — Free Postgres on Neon (if not done already)

1. <https://neon.tech> → sign up (GitHub, no card).
2. **Create project** → copy the **Connection string** (URI). Looks like:
   ```
   postgresql://USER:PASSWORD@ep-xxxx.region.aws.neon.tech/neondb?sslmode=require
   ```
   This is your `DATABASE_URL`. (`config.py` already handles the `postgres://`→
   `postgresql://` coercion and `sslmode`.)

---

## Step 2 — Deploy the backend on Koyeb

1. <https://www.koyeb.com> → sign up with GitHub (**no credit card**).
2. **Create Web Service → GitHub** → pick the **`VibeInvest`** repo, branch `main`.
3. **Builder**: leave as **Buildpack** (auto-detects Python — no Dockerfile needed).
4. **Work directory / Source directory**: set to **`backend`**
   (so Koyeb builds the FastAPI package, not the Expo frontend at the repo root).
5. **Run command**: Koyeb picks up `backend/Procfile` automatically. If it asks,
   set it explicitly to:
   ```
   uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```
6. **Instance**: choose the **Free** instance (`nano`, scale-to-zero).
7. **Environment variables** — add:

   | Key | Value |
   |-----|-------|
   | `DATABASE_URL` | the Neon URI from Step 1 |
   | `SECRET_KEY` | run `python -c "import secrets; print(secrets.token_hex(32))"` and paste the result (keep it stable — fixes ERR-002) |
   | `CLAUDE_API_KEY` | your Anthropic key |
   | `TAVILY_API_KEY` | your Tavily key |
   | `GOOGLE_API_KEY` | your Google key |
   | `ALLOWED_ORIGINS` | `*` (simplest for demo) |

8. **Port**: ensure the service port is `8000` (Koyeb sets `$PORT`; the Procfile
   binds to it). The health check path is `/health`.
9. **Deploy**. First build ~2–4 min.

---

## Step 3 — Verify

Koyeb shows the public URL at the top of the service — pattern:
`https://<app>-<org>-<hash>.koyeb.app`. Test:

```
https://<your-url>.koyeb.app/health   → {"status":"ok"}
https://<your-url>.koyeb.app/docs      → FastAPI Swagger UI
```

> 💡 Free instances scale to zero when idle; the first request after idle takes a
> few seconds to wake.

---

## Step 4 — Point the app at the real URL

The Koyeb URL has a random hash, so it can't be predicted. After deploy, copy the
real URL and replace the placeholder `https://REPLACE-WITH-KOYEB-URL.koyeb.app` in:

- `.env` → `EXPO_PUBLIC_API_BASE_URL=...`
- `eas.json` → all three build profiles

Then:
```bash
npx expo start -c                          # dev — clears cache so new URL inlines
eas build -p android --profile preview     # rebuild APK against the new URL
```

**Easiest: just paste the real Koyeb URL into the chat and Claude will wire all
of this for you.**

---

## Notes

- **Auto-deploy**: Koyeb redeploys on every push to `main`.
- **Tables**: `init_db()` creates them on the fresh Neon DB at first startup — no
  manual migration for the first deploy (schema *changes* later need Alembic, ERR-004).
- **No card anywhere**: both Neon and Koyeb free tiers skip card verification.
- **Alternative host (also no card)**: Hugging Face Spaces (Docker) — works too,
  but needs a Dockerfile; Koyeb is simpler for a plain GitHub repo.
- Keys live only in Koyeb's dashboard + your gitignored `.env` — never in git.
  Rotate any key that's been shared.
