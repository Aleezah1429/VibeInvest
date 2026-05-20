---
log_id: 012
title: Per-User Analyses Binding, Session Persistence, PDF Download, and Trending Fixes
date: 2026-05-20
status: completed
---

# Per-User Analyses Binding, Session Persistence, PDF Download, and Trending Fixes

## What was done
Bundled fixes for four related issues uncovered while wiring up the auth flow:
1. **Session persistence on web** — refreshing the browser no longer logs the user out.
2. **PDF download on report screen** — replaced the silent "open in new tab" handler with a pre-flight check, real file download on web, and surfaced backend errors.
3. **Per-user data scoping** — added `user_id` to `analyses`, an `Authorization: Bearer` dependency on every analyses route, and ownership checks on GET/PDF/DELETE.
4. **Trending picks calling the API** — removed the silent fallback in `goRunDetailed` that was making trending startup clicks render the placeholder report.

## Reasoning
- `AuthContext` was keeping `isAuthenticated`/`user` in plain `useState` with no persistence, so a page refresh always reset state and the gates in `index.tsx`/`search.tsx` immediately redirected to `/auth`. Used `localStorage` (web only) read via a synchronous `useState` initializer so the very first render already has the correct session.
- The PDF download handler was handing the URL straight to `expo-web-browser`, which opened the JSON 404 in a new tab when anything went wrong. Added a pre-flight `fetch` so we can show the real backend reason, and on web triggered a real file save via a hidden `<a download>` element instead of the inline-PDF view.
- Backend `analyses` table had no FK to `users`, so all analyses were effectively global. Added a nullable `user_id` column (additive `ALTER TABLE` migration at startup so existing rows survive as orphans), a `get_current_user` dependency that decodes the existing HMAC-signed token, and ownership enforcement on every analyses endpoint.
- Frontend wasn't sending the access token on any request — `services/api.ts` only set `Content-Type`. Added an `authHeaders()` helper that reads the persisted token from `localStorage` and attaches `Authorization: Bearer …`. On 401 a registered handler in `AuthContext` clears the session, which lets the existing gates kick the user back to `/auth`.
- `goRunDetailed` was catching API failures and routing to `/loading` *without* an `id`, which made `/report` show `PLACEHOLDER_REPORT` and the "No agent reports yet." copy — so trending picks looked static. Replaced the silent fallback with `Alert.alert` showing the parsed backend `detail`.

## Tool Calls
- READ `context/AuthContext.tsx`
- READ `services/api.ts`
- READ `app/report.tsx`
- READ `app/index.tsx`
- READ `app/search.tsx`
- READ `app/auth.tsx`
- READ `backend/app/models.py`
- READ `backend/app/db.py`
- READ `backend/app/routes/analyses.py`
- READ `backend/app/routes/auth.py`
- READ `backend/app/services/auth.py`
- READ `backend/app/auth.py`
- READ `backend/app/orchestrator.py`
- WRITE `context/AuthContext.tsx`
- WRITE `services/api.ts`
- WRITE `app/report.tsx`
- WRITE `app/index.tsx`
- WRITE `backend/app/models.py`
- WRITE `backend/app/db.py`
- WRITE `backend/app/routes/analyses.py`
- WRITE `backend/app/services/deps.py` (new)
- RUN `curl http://127.0.0.1:8000/openapi.json` (verify route schema)
- RUN `curl -X POST http://127.0.0.1:8000/api/analyses …` (reproduce 500 from stale worker)
- RUN `venv/bin/python -m fastapi.testclient` (end-to-end auth + ownership verification)
- RUN `venv/bin/python -c "inspect(engine).get_columns('analyses')"` (verify migration)

## Files Changed
| File | Action |
|------|--------|
| `context/AuthContext.tsx` | modified |
| `services/api.ts` | modified |
| `app/report.tsx` | modified |
| `app/index.tsx` | modified |
| `backend/app/models.py` | modified |
| `backend/app/db.py` | modified |
| `backend/app/routes/analyses.py` | modified |
| `backend/app/services/deps.py` | created |

## Errors & Recovery
- **`TypeError: configs.toReversed is not a function`** on `npm run web` — Node 18 missing `Array.prototype.toReversed`. Resolved by upgrading to Node 20 LTS.
- **`TypeError: fetch failed` from Expo CLI** — `EXPO_OFFLINE` declared in `.env` wasn't exported to the child process. Resolved by running `EXPO_OFFLINE=1 npx expo start --web` (or shell `export`).
- **`{"detail":[{"type":"model_attributes_type",…}]}` on `/api/analyses` POST** — running uvicorn worker was serving stale code that declared a Pydantic JSON body instead of the new `Form(...)` parameters. Resolved by restarting the backend.
- **`HTTP 500` from live POST while in-process TestClient returned 201** — same stale-worker symptom. Calling out a backend restart is required after these changes (`lsof -ti :8000 | xargs kill -9 && ./backend/run.sh`).
- **Existing orphan analyses** — pre-migration rows have `user_id = NULL`. By design they don't show in any user's list. The user opted to leave them rather than delete or backfill.

## Outcome
- **Session persists on web refresh.** `localStorage` key `vibe.auth.session` stores `{ user, token }`; cleared on `signOut` or any 401.
- **PDF download works on web and native.** Web triggers a real save dialog; native opens via `expo-web-browser`. Failures show a friendly `Alert` with the backend's `detail` instead of a 404 JSON page.
- **All `/api/analyses` routes require auth.** Verified via TestClient:
  - Unauth POST → 401
  - Auth POST → 201, scoped to caller
  - Cross-user GET detail → 404
  - List filtered to caller (count = 0 for non-owner)
- **Trending clicks now hit the real API** via the same `goRunDetailed` path as the search input. Any failure is surfaced via `Alert` so the user sees the real reason instead of a placeholder report.
- **Native cold-start caveat.** No `AsyncStorage`/`SecureStore` is installed, so on iOS/Android a fresh launch still loses the session. Adding `@react-native-async-storage/async-storage` is the right next step when desired.
