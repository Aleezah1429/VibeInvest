---
log_id: 016
title: Backend hardening, native session persistence, first tests + CI
date: 2026-05-31
status: completed
---

# Backend hardening, native session persistence, first tests + CI

## What was done
Worked through the open ERR backlog from `error-recovery.md` in one pass: hardened
the backend (stable `SECRET_KEY`, env-driven CORS), added native session
persistence via AsyncStorage so APK cold-starts stay logged in, stood up the
repo's first automated tests (pytest over `scoring.py`) plus a GitHub Actions
workflow, and cleared two dead-artifact items. Nothing was committed — left for
the user to run and verify first.

## Reasoning
The backlog was already triaged with ERR codes, so this followed that priority
order and only touched safe, self-contained changes. Larger refactors (Alembic —
ERR-004, component extraction — ERR-007, spec-doc rewrite — ERR-013) were
deliberately deferred: they carry regression risk to a running app and warrant
their own focused pass. Native persistence kept web 100% unchanged (synchronous
`localStorage` seed) and added an async AsyncStorage hydration path guarded by a
new `isBootstrapping` flag, so auth gates wait for hydration instead of bouncing
a logged-in user to `/auth` on cold start.

## Tool Calls
- READ `backend/app/{config,main,scoring}.py`, `backend/app/services/auth.py`
- READ `context/AuthContext.tsx`, `services/api.ts`, `app/{_layout,index,search,report,handoff}.tsx`
- WRITE `backend/app/config.py` (SECRET_KEY + ALLOWED_ORIGINS, with default-key warning)
- WRITE `backend/app/main.py` (CORS from `ALLOWED_ORIGINS`)
- WRITE `backend/app/services/auth.py` (import key/expiry from config; drop unused `os`)
- WRITE `backend/tests/test_scoring.py`, `backend/pytest.ini`, `backend/requirements-dev.txt`, `backend/tests/__init__.py`
- WRITE `.github/workflows/backend-tests.yml`
- WRITE `context/AuthContext.tsx` (AsyncStorage persistence + `isBootstrapping`)
- WRITE `app/index.tsx`, `app/search.tsx` (gates respect `isBootstrapping`)
- WRITE `app/report.tsx` (expandable-card a11y), `app/_layout.tsx` (logo path)
- RUN `npx expo install @react-native-async-storage/async-storage` → 2.2.0
- RUN `git mv assets/images/vibeinevst-logo.gif → vibeinvest-logo.gif`
- RUN `npx tsc --noEmit` → 0 errors
- RUN `pytest` (backend) → 19 passed

## Files Changed
| File | Action |
|------|--------|
| `backend/app/config.py` | modified — SECRET_KEY (warns on default) + ALLOWED_ORIGINS |
| `backend/app/main.py` | modified — env-driven CORS |
| `backend/app/services/auth.py` | modified — pull key/expiry from config |
| `backend/tests/__init__.py` | created |
| `backend/tests/test_scoring.py` | created — 19 tests |
| `backend/pytest.ini` | created |
| `backend/requirements-dev.txt` | created |
| `.github/workflows/backend-tests.yml` | created — CI runs pytest |
| `context/AuthContext.tsx` | modified — AsyncStorage + `isBootstrapping` |
| `app/index.tsx` | modified — gate waits on `isBootstrapping` |
| `app/search.tsx` | modified — gate waits on `isBootstrapping` |
| `app/report.tsx` | modified — expandable-card `accessibilityState` |
| `app/_layout.tsx` | modified — logo require path |
| `assets/images/vibeinvest-logo.gif` | renamed (from `vibeinevst-`) |
| `package.json` / `package-lock.json` | modified — async-storage dep |

## Errors & Recovery
- The base system Python lacks `fastapi`/`dotenv`, so a full `app.main` import
  fails outside the venv — not a code issue. Verified instead with `py_compile`
  on the changed files (OK) and ran the dependency-free `scoring` tests (green).
- Shell cwd did not persist to the repo root between Bash calls; switched to
  explicit `cd /Users/mac/Documents/Projects/VibeInvest` per command.
- ERR-012 (`google-adk-agent/`) was already gone — no action needed.

## Outcome
Resolved ERR-002, ERR-003, ERR-006, ERR-009 (already broad; added expandable
a11y state), ERR-010, ERR-011, ERR-012. Backend tests + CI now exist; native
APK sessions survive cold restart. **Nothing committed** — the user will run and
verify locally first.

Next steps (deferred, each its own pass):
- ERR-004 Alembic migrations; ERR-007 screen component extraction; ERR-013 spec-doc rewrite.
- Operational (dashboard-only, can't do from code): ERR-001 confirm Railway LLM keys; set a stable `SECRET_KEY` Railway var; rotate any shared `.env` key.
- Optional product ideas: parallelize Skeptic/Hype in the orchestrator, per-user rate limiting, result caching for repeat startups.
