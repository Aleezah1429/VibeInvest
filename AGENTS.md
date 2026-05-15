# AGENTS.md

## Project Context
**App Summary**: VibeInvest is an instant investor-grade due diligence app powered by 4 AI agents (The Skeptic, The Munshi, The Hype, The CVO). Users enter a startup name to receive a comprehensive analysis and a final Aura Score out of 1000.
**Platform**: iOS and Android.
**Stack**: React Native + Expo (Expo Router).
**Backend**: FastAPI backend + sse-starlette for SSE live agent streaming (pre-existing API).
**Deadline**: 5 days (Hard Deadline).

## Coding Standards
- **Folder Structure**: 
  - `app/` (Expo Router file-based routing)
  - `components/` (Reusable UI components)
  - `hooks/` (Custom React hooks)
  - `services/` (API calls, SSE streaming)
  - `constants/` (Colors, styling tokens, configuration)
- **Component Naming**: PascalCase for components (e.g., `AgentCard`), camelCase for hooks and utilities.
- **State Management**: React `useState`/`useReducer` for local state. Context API if global state is strictly needed. Avoid heavy external libraries (like Redux) due to the 5-day timeline constraint.
- **TypeScript Strictness**: Strict mode enabled. No `any` types unless communicating with untyped legacy APIs. Avoid `ts-ignore`.
- **Styling Approach**: React Native `StyleSheet`.

## Mobile-Specific Rules
- **Layout Constraints**: Use `SafeAreaView` to handle notches. Use `KeyboardAvoidingView` where text inputs are present.
- **Performance**: Avoid unnecessary re-renders. Use `FlatList` or `SectionList` for rendering lists. Memoize heavy components (`React.memo`) only if profiling shows a need.
- **Accessibility**: Minimum touch target size of 44x44pt for all buttons and interactive elements. Use `accessibilityLabel` for icon-only buttons.
- **Platform Differences**: Test on iOS simulator and Android emulator. Use `Platform.OS` only when absolutely necessary (e.g., specific padding for Android status bars).

## Testing Requirements
- **Must Have Tests**: Core business logic (Aura score calculation, data parsing from SSE streams).
- **No Tests Required**: Minor UI stylistic changes, basic navigation (due to 5-day time constraint).
- **Test Framework**: Jest + React Native Testing Library.
- **Structure**: Tests collocated with the file (e.g., `utils.test.ts` next to `utils.ts`).

## Git Discipline
- **Commit Message Style**: Conventional commits (`feat:`, `fix:`, `chore:`, `refactor:`).
- **Branching**: One feature per branch. Do not commit directly to `main`.

## NEVER Do Without Explicit Approval
- Install new dependencies (bloats the app, adds risk).
- Change app config (`app.json` / `Info.plist` / `AndroidManifest.xml`).
- Modify the navigation structure (Expo Router setup).
- Delete files (unless fixing an obvious scaffolding mistake).
- Make schema/backend changes.

## Definition of Done
- Runs cleanly on both iOS and Android.
- No console warnings or errors.
- Handles all states: Loading, Error, Empty, and Success.
- Tested on at least one real device size (or realistic simulator).
