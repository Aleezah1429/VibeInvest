# Deploying the VibeInvest Backend — FREE, NO CARD, PERMANENT (Back4App + Neon)

After Railway (cost), Render/Koyeb (credit card), and Hugging Face (auto-flagged
generic API backends as "abusive"), the working permanent + no-card option is
**Back4App Containers**: it deploys your Docker container straight from GitHub,
needs no card, and is built for general backends (no abuse flag). **Neon** stays
as the free, persistent Postgres.

**Free tier**: 256 MB RAM, 0.25 vCPU, **600 active hours/month**, custom Docker
from GitHub. It scales to zero when idle (first request after idle is a slow cold
start), so the URL is permanent even though it isn't strictly always-on.

Build artifact reused as-is: `backend/Dockerfile` (binds `${PORT:-7860}`).

---

## Step 1 — Neon Postgres (already done)

You already have `DATABASE_URL` in `.env`. If you ever need it again: Neon project
→ **Connection string** (URI).

---

## Step 2 — Deploy the container on Back4App

1. <https://www.back4app.com> → sign up (GitHub, **no card**).
2. Go to **Containers** → **Deploy a new app** (<https://containers.back4app.com/new-container>).
3. **Connect GitHub** and authorize the **`VibeInvest`** repo. Pick branch `main`.
4. Configure the container:
   - **Root directory**: `backend`  ← important (monorepo; the Dockerfile + `app/` live here)
   - **Dockerfile path**: `Dockerfile` (relative to the root above)
   - **Port**: `7860` (matches the Dockerfile's exposed port)
   - **Auto deploy on push**: ON (optional)
5. **Environment Variables** — add:

   | Key | Value |
   |-----|-------|
   | `DATABASE_URL` | your Neon URI |
   | `SECRET_KEY` | a stable 64-char hex (already in your local `.env`) |
   | `CLAUDE_API_KEY` | your Anthropic key |
   | `TAVILY_API_KEY` | your Tavily key |
   | `GOOGLE_API_KEY` | your Google key |
   | `ALLOWED_ORIGINS` | `*` |

6. **Deploy**. First build ~3–6 min (Docker image build + push).

---

## Step 3 — Verify

Back4App gives a public URL like `https://<app-name>-<hash>.b4a.run`. Test:

```
https://<your-url>.b4a.run/health   → {"status":"ok"}
https://<your-url>.b4a.run/docs       → Swagger UI
```

If `/health` works but an analysis fails, re-check the env vars (a missing LLM key
fails the pipeline server-side even though `/health` is fine).

> If the build fails on **out-of-memory** (256 MB is tight with the Google + PDF
> libs), tell Claude — we can slim `requirements.txt` (the Gemini SDK is unused;
> dropping it frees memory) and redeploy.

---

## Step 4 — Wire the app + build the APK

Paste the real `.b4a.run` URL into the chat and Claude will set it in `.env` and
`eas.json`. Or do it manually in both files (`EXPO_PUBLIC_API_BASE_URL`), then:

```bash
# dev sanity check against the live backend
npx expo start -c

# build the installable APK pointed at the live backend
eas build -p android --profile preview
```

EAS gives a download link for the `.apk` once the build finishes — that's the
installable, shareable app, talking to your permanent Back4App backend.

---

## Notes

- **No card** anywhere in this stack (Back4App + Neon).
- **Cold start**: after idle, the first request wakes the container (a few
  seconds). Fine for real use; just not instant on the very first hit.
- Keys live only in Back4App's dashboard + your gitignored `.env` — never in git.
  Rotate any key that's been shared in screenshots/chats.
- 600 active hours/month is plenty for a demo/low-traffic app; heavy 24/7 traffic
  would eventually need a paid tier.
