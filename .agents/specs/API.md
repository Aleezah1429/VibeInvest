# API Reference

All endpoints live on the FastAPI backend ([backend/app/main.py](../../backend/app/main.py)). Base URL: `http://127.0.0.1:8000` in dev, the Back4App `*.b4a.run` domain in prod. Content-Type: `application/json` unless noted. Authenticated endpoints need `Authorization: Bearer <token>`. CORS: `ALLOWED_ORIGINS` env (defaults to `*`).

---

## Auth — [routes/auth.py](../../backend/app/routes/auth.py)

| Method | Path | Body | Returns |
|---|---|---|---|
| POST | `/api/auth/signup` | `{name, email, password}` (name ≥ 2, password ≥ 6) | 201 `TokenResponse` · 400 if email taken |
| POST | `/api/auth/signin` | `{email, password}` | 200 `TokenResponse` · 401 wrong creds · 400 Google-only account |
| POST | `/api/auth/google` | `{id_token, name?, email?, google_id?}` | 200 `TokenResponse` · 401 verification failed |
| GET | `/api/auth/me` | — | 200 `UserResponse` |
| PATCH | `/api/auth/me` | `{name}` (≥ 2) | 200 `UserResponse` |
| POST | `/api/auth/me/change-password` | `{current_password, new_password}` (each ≥ 6) | 200 · 400/401 |

`TokenResponse`: `{access_token, token_type:"bearer", user: {id, name, email, created_at}}`.

**Google sign-in:** verifies the ID token at `https://oauth2.googleapis.com/tokeninfo`. Tokens starting with `mock-` or equal to `google-test-token` get a canned profile (offline-demo path — remove before production). Matches existing user by `google_id`, then by email (links Google to a manual account), else creates a new user.

---

## Analyses — [routes/analyses.py](../../backend/app/routes/analyses.py)

All require Bearer auth. Cross-user reads return **404** (not 403).

### `POST /api/analyses` — create + start pipeline
**Content-Type:** `multipart/form-data`

| Field | Type | Notes |
|---|---|---|
| `name` | string ✅ | Startup name |
| `intent` | string | Default `invest` |
| `sector`, `stage`, `funding` | string | Free-form hints |
| `context` | string | Free-form concern |
| `file` | binary | Optional PDF deck — extracted text saved as `raw_evidence(kind="pdf")` |

Creates an `analyses` row (`status="queued"`), saves the PDF if provided, schedules `orchestrator.run_pipeline()` in `BackgroundTasks`, returns **201 `AnalysisDetail`**. Client should poll until `status ∈ {completed, failed}`.

### Other endpoints

| Method | Path | Notes |
|---|---|---|
| GET | `/api/analyses?limit=&status=` | List of `AnalysisSummary`, scoped to user, newest first |
| GET | `/api/analyses/recent?limit=` | Dashboard list: only `completed` rows; includes `breakdowns` (Market/Financials/Brand) extracted from `report_json` |
| GET | `/api/analyses/{id}` | Full `AnalysisDetail` with `report` and per-agent `progress` |
| GET | `/api/analyses/{id}/pdf` | ReportLab PDF. Auth via header **or** `?token=` query param. 400 if still running/failed |
| DELETE | `/api/analyses/{id}` | 204; cascade-deletes `agent_runs` + `raw_evidence` |

### `RecentAnalysisItem` shape
```json
{
  "id": "uuid",
  "name": "Bazaar Technologies",
  "score": 810,
  "verdict": "INVEST",
  "finished_at": "2026-05-20T13:00:00",
  "breakdowns": [
    { "label": "Market", "val": 91 },
    { "label": "Financials", "val": 72 },
    { "label": "Brand", "val": 84 }
  ]
}
```

---

## Health

`GET /health` → `{"status":"ok"}`. Used as the host's healthcheck (Back4App).

---

## Error shape

FastAPI's default:
```json
{ "detail": "Human-readable message" }
```
The frontend's `AuthContext.getErrorMessage()` unwraps `detail` and remaps common statuses to friendly strings.

---

## Access token format

Not a real JWT. `payload_b64 . hmac_sha256(payload_b64, SECRET_KEY).hex()`:

```
payload = { "sub": "<user_id>", "exp": <unix_ts> }
exp     = now + ACCESS_TOKEN_EXPIRE_MINUTES  (default 1440 = 24h)
```

Verifier ([services/auth.py](../../backend/app/services/auth.py)) re-computes the signature with `hmac.compare_digest` and rejects expired tokens. Standard JWT libs cannot decode it.
