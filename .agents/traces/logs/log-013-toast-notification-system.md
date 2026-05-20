---
log_id: 013
title: Custom Glassmorphic Toast Notification System and Global Integration
date: 2026-05-20
status: completed
---

# Custom Glassmorphic Toast Notification System and Global Integration

## What was done
Designed and implemented an ultra-premium, high-fidelity Toast Notification System inside the VibeInvest mobile application to handle FastAPI backend internal server errors (such as the reported SQLAlchemy 500 error) and network disruptions:
1. **Toast Context & Hook** — Created `/context/ToastContext.tsx` containing the `ToastProvider` and the custom hook `useToast()`.
2. **Glassmorphic Animation Box** — Built a beautiful animated card using `BlurView` from `expo-blur` and the native React Native `Animated` driver, featuring notch safety calculations via `react-native-safe-area-context` and a minimum 44pt touch interaction target.
3. **Application-Wide Wrapping** — Wrapped the main route stack layout in `app/_layout.tsx` inside the `ToastProvider` for global floating overlays.
4. **Networking Integrations** — Replaced generic native alerts with custom toasts inside `app/search.tsx`, `app/index.tsx`, `app/loading.tsx`, and `app/auth.tsx`.
5. **Intelligent Polling Fail-Safes** — Programmed consecutive failure detectors inside `app/loading.tsx` to handle unstable connection states smoothly during real-time backend updates.
6. **Linter Cleanup & Polish** — Resolved pre-existing JSX unescaped quote syntax errors in `app/profile.tsx` and `app/index.tsx` to ensure a 100% successful compiler and linter execution.

## Reasoning
- **Strict Dependency Constraints** — `AGENTS.md` strictly prohibits installing external packages. Building a modular context system utilizing lightweight native React Native APIs and existing tools (`expo-blur`) ensures compliance and keeps the build slim.
- **Notch and Screen Support** — In modern mobile devices, simple top-absolute position alerts overlay phone status bars or Dynamic Islands. Importing `useSafeAreaInsets` calculates exact safe boundaries, making the toast look perfectly integrated.
- **Intelligent Error Handling UX** — Silently catching backend errors or showing spammy browser dialogs creates bad UX. By keeping a `consecutiveFailures` reference state in `loading.tsx`, the loader polls silently on transient issues, displays a warning toast after 3 failures, and redirects with an error toast after 8 consecutive failures.
- **Clean Linter Verification** — Pre-existing unescaped entities (like raw apostrophes in `<Text>`) broke code quality metrics. Escaping them using standard TSX curly brackets ensures full project quality standard compliance.

## Tool Calls
- VIEW `/Users/a.jogiat/Desktop/code/VibeInvest/package.json`
- WRITE `/Users/a.jogiat/Desktop/code/VibeInvest/context/ToastContext.tsx`
- WRITE `/Users/a.jogiat/Desktop/code/VibeInvest/app/_layout.tsx`
- VIEW `/Users/a.jogiat/Desktop/code/VibeInvest/app/search.tsx`
- WRITE `/Users/a.jogiat/Desktop/code/VibeInvest/app/search.tsx`
- VIEW `/Users/a.jogiat/Desktop/code/VibeInvest/app/index.tsx`
- WRITE `/Users/a.jogiat/Desktop/code/VibeInvest/app/index.tsx`
- VIEW `/Users/a.jogiat/Desktop/code/VibeInvest/app/loading.tsx`
- WRITE `/Users/a.jogiat/Desktop/code/VibeInvest/app/loading.tsx`
- VIEW `/Users/a.jogiat/Desktop/code/VibeInvest/app/auth.tsx`
- WRITE `/Users/a.jogiat/Desktop/code/VibeInvest/app/auth.tsx`
- VIEW `/Users/a.jogiat/Desktop/code/VibeInvest/app/profile.tsx`
- WRITE `/Users/a.jogiat/Desktop/code/VibeInvest/app/profile.tsx`
- RUN `npx tsc --noEmit`
- RUN `npm run lint`

## Files Changed
| File | Action |
|------|--------|
| `context/ToastContext.tsx` | created |
| `app/_layout.tsx` | modified |
| `app/search.tsx` | modified |
| `app/index.tsx` | modified |
| `app/loading.tsx` | modified |
| `app/auth.tsx` | modified |
| `app/profile.tsx` | modified |

## Errors & Recovery
- **React Native `Alert` Unused Warnings** — Removing the original `Alert` components left unused react-native imports in `search.tsx` and `index.tsx`. Cleaned up the import lists to satisfy typescript checks.
- **Unescaped Quotes Errors** — `npm run lint` failed due to raw apostrophes inside text components in `/app/profile.tsx` and `/app/index.tsx`. Enclosed strings in JSX double quotes `{"..."}` to successfully compile.

## Outcome
- **100% Type Safe and Warning-Free Build.** `npx tsc --noEmit` and `npm run lint` pass successfully with zero compiler errors.
- **Global High-Fidelity Feedback.** Users receive gorgeous visual alerts during credential updates, PDF picker selections, backend network disruptions, and OAuth sign-in operations.
- **Graceful Error Recovery.** 500 DB Internal Server Errors from backend APIs are captured, handled, and resolved without hanging the mobile application indefinitely.
