---
log_id: 011
title: Connecting Frontend Auth to Backend Database
date: 2026-05-19
status: completed
---

# Connecting Frontend Auth to Backend Database

## What was done
Resolved the issue where manual and Google registered users were not saving inside the backend database. Connected the React Native frontend `AuthContext` to make actual API calls to the FastAPI server's auth endpoints instead of mocking credentials locally. Added a session guard to `/auth` to instantly redirect already logged-in users back to the landing page `/` (index).

## Reasoning
The frontend was completely mocking signup, signin, and Google login actions inside `AuthContext.tsx`'s local state, which meant no HTTP request was ever sent to the backend. Connected these functions by declaring API helper methods in `services/api.ts` and wiring them to `AuthContext.tsx` with a custom error message parser to extract specific error messages returned by FastAPI's `HTTPException` detail field. To prevent logged-in users from accessing the login panel, added a navigation check that dispatches a layout redirect on mount and returns `null` to avoid flashing.

## Tool Calls
- READ `context/AuthContext.tsx`
- READ `services/api.ts`
- READ `services/types.ts`
- READ `.agents/skills/create-task-log.md`
- WRITE `services/api.ts`
- WRITE `context/AuthContext.tsx`
- WRITE `app/auth.tsx`
- RUN `npx tsc --noEmit`
- RUN `npm run lint`

## Files Changed
| File | Action |
|------|--------|
| `services/api.ts` | modified |
| `context/AuthContext.tsx` | modified |
| `app/auth.tsx` | modified |

## Errors & Recovery
- **No Direct App Errors**: All compilation and styling checks succeeded immediately with **exit code 0** on both TypeScript validation and ESLint quality checks.

## Outcome
- Users registering or signing in via the React Native application are now successfully committed and persisted inside SQLite `data.db`.
- Errors returned by the backend database (like attempting to sign up a duplicate email address or entering an incorrect password) are caught and displayed beautifully on the mobile user interface.
- Logged-in users attempting to access `/auth` are gracefully redirected back to `/` instantly.
- Offline and developer testing remain fully supported.
