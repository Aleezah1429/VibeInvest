# Error Recovery — TODOs, Bugs, Inconsistencies

> **Trace ID**: `892ab532-e0ea-41be-80ee-7dfb0abfa3b5`
> **Generated**: 2026-05-17T16:45:00+05:00

---

## 🔴 Critical — Blocks Functionality

### ERR-001: No API integration exists
- **Location**: Entire app
- **Expected**: `services/api.ts` with `POST /api/run/google-adk` call and SSE stream parsing
- **Actual**: No `services/` directory. No `fetch` calls. No SSE library installed. All data hardcoded.
- **PRD ref**: API Contract section — SSE stream with `pipeline_start`, `agent_start`, `tool_call`, `agent_text`, `pipeline_complete` events
- **Impact**: App cannot perform real analysis. Same hardcoded data shown regardless of input.

### ERR-002: No SSE library installed
- **Location**: `package.json`
- **Expected**: `react-native-sse` or manual fetch stream parser (PLAN.md flagged this risk)
- **Actual**: Neither installed. React Native has no native `EventSource`.
- **Impact**: Cannot receive server-sent events even if API code were written.

### ERR-003: Report data is entirely static
- **Location**: `app/report.tsx`
- **Expected**: Dynamic `ReportData` parsed from `pipeline_complete` event
- **Actual**: Score (712), verdict (INVEST), dimensions, metrics, findings, deliverables — all hardcoded inline
- **Impact**: Every startup shows identical results.

---

## 🟡 Incomplete Features

### ERR-004: Only 2 of 4 agent reports rendered
- **Location**: `app/report.tsx` lines 157–181
- **Expected**: 4 agent cards (Skeptic, Munshi, Hype, CVO) per PRD `agentReports: AgentReport[]`
- **Actual**: Only Skeptic and Munshi cards exist. Hype and CVO are missing.
- **Fix**: Add 2 more `<AgentCard>` instances with Hype and CVO data.

### ERR-005: Intent and context fields not transmitted
- **Location**: `app/search.tsx` lines 12–14
- **Expected**: `StartupQuery { name, intent, sector, stage, context }` passed to loading/API
- **Actual**: Only `name` is passed via `router.push({ params: { name } })`. Intent is in state but unused. Sector/Stage/Funding/Concern TextInputs have no `onChangeText` state binding.
- **Fix**: Capture all fields in state, pass as params or to API service.

### ERR-006: Download/Share buttons are non-functional
- **Location**: `app/report.tsx` lines 221–229
- **Expected**: PDF download or native share action
- **Actual**: `TouchableOpacity` with no `onPress` logic. Buttons render but do nothing.
- **Fix**: Implement using `expo-sharing` / `expo-print` or mark as v1.5.

### ERR-007: Recent reports list is hardcoded
- **Location**: `app/search.tsx` lines 80–102
- **Expected**: Dynamic list from local storage or API
- **Actual**: Static Bykea + Bazaar entries with hardcoded scores. Tapping them navigates to `/report` with the name param but same hardcoded report data appears.
- **Fix**: Either remove (per PLAN cut list) or back with AsyncStorage.

### ERR-008: No error states anywhere
- **Location**: All screens
- **Expected**: Error UI for network failures, API timeouts, invalid responses
- **Actual**: No `try/catch`, no error state variables, no error UI components.
- **Fix**: Add error state management per the `add-api-call.md` skill pattern.

### ERR-009: No empty states
- **Location**: Search screen (recent reports), Report screen (no data)
- **Expected**: "No reports yet" or "Something went wrong" views
- **Actual**: Hardcoded data means these states never occur, but they must be handled when real API is connected.

### ERR-010: No loading states (beyond the animated screen)
- **Location**: All screens
- **Expected**: Skeleton loaders or spinners during data fetch
- **Actual**: Data is synchronous/hardcoded, so no loading states were needed — but they will be once API is connected.

---

## 🟠 Code Quality Issues

### ERR-011: `any` types on inline component props
- **Location**: `app/report.tsx`
  - Line 247: `const DimItem = ({ icon, name, score, color }: any)`
  - Line 258: `const MetricCard = ({ label, value, change, changeColor }: any)`
  - Line 266: `const AgentCard = ({ icon, iconBg, ... }: any)`
- **AGENTS.md rule**: "No `any` types unless communicating with untyped legacy APIs"
- **Fix**: Define `DimItemProps`, `MetricCardProps`, `AgentCardProps` interfaces.

### ERR-012: Missing `accessibilityLabel` on icon-only buttons
- **Location**: All screens — back buttons, action buttons, icon-only TouchableOpacitys
- **AGENTS.md rule**: "Use `accessibilityLabel` for icon-only buttons"
- **Fix**: Add descriptive labels to all icon-only interactive elements.

### ERR-013: No `KeyboardAvoidingView` on search screen
- **Location**: `app/search.tsx`
- **AGENTS.md rule**: "Use `KeyboardAvoidingView` where text inputs are present"
- **Actual**: 4+ TextInputs with no keyboard avoidance. Inputs may be hidden behind keyboard on smaller devices.
- **Fix**: Wrap content in `<KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>`.

### ERR-014: Typo in asset filename
- **Location**: `assets/images/vibeinevst-logo.gif`
- **Expected**: `vibeinvest-logo.gif`
- **Actual**: `vibeinevst` (transposed letters)
- **Referenced in**: `app/_layout.tsx` line 67: `require('../assets/images/vibeinevst-logo.gif')`
- **Fix**: Rename file and update the require path.

---

## 🔵 PRD vs Implementation Mismatches

### ERR-015: Extra screen not in PRD navigation map
- **PRD**: `Loading → Report`
- **Actual**: `Loading → Handoff → Report`
- **Assessment**: Intentional enhancement. The handoff screen adds demo value. PRD should be updated to reflect this.

### ERR-016: `StartupQuery` type not implemented
- **PRD**: `{ name: string, intent: string, sector?: string, stage?: string, context?: string }`
- **Actual**: No TypeScript types defined. Only `name` string flows between screens.

### ERR-017: `AgentStatus` type not implemented
- **PRD**: `{ id: number, name: string, status: 'idle'|'running'|'done', detailText: string }`
- **Actual**: Agent state is managed by `agentIdx` number + timer. No status tracking type.

### ERR-018: `ReportData` type not implemented
- **PRD**: Full structured type with score, verdict, dimensions, metrics, agentReports
- **Actual**: No type. All data is inline literals in JSX.

### ERR-019: SSE events not parsed
- **PRD**: 5 event types (`pipeline_start`, `agent_start`, `tool_call`, `agent_text`, `pipeline_complete`)
- **Actual**: No SSE connection. No event handling. No parser.

---

## ⚠️ Security Issues

### ERR-020: API keys committed to git
- **Location**: `.env` (project root)
- **Contents**: Real `GOOGLE_API_KEY` and `OPENAI_API_KEY` in plaintext
- **`.gitignore`**: Only ignores `.env*.local`, not `.env` itself
- **Fix**: Add `.env` to `.gitignore`, rotate both API keys immediately, remove from git history with `git filter-branch` or BFG.

---

## 🗑️ Dead Code / Stale Artifacts

### ERR-021: `frontend/` directory is abandoned
- **Contents**: Only `.next/` and `node_modules/` — no source files
- **README still references**: "Next.js 15 + Tailwind 4" frontend
- **Fix**: Delete `frontend/` directory. Update README.

### ERR-022: Unused scaffold components
- **Files**: `components/hello-wave.tsx`, `components/parallax-scroll-view.tsx`, `components/haptic-tab.tsx`, `components/themed-text.tsx`, `components/themed-view.tsx`, `components/external-link.tsx`, `components/ui/collapsible.tsx`, `components/ui/icon-symbol.tsx`
- **Usage**: None of these are imported by any app screen.
- **Fix**: Remove or repurpose during component extraction phase.

### ERR-023: Stale README references
- **References files that don't exist** (until the previous trace session created them):
  - `SETUP.md` ← now created
  - `WORKFLOW.md` ← now created
  - `ROADMAP.md` ← now created
  - `FEATURES.md` ← now created
  - `PHASES.md` ← now created
- **References directories that don't exist**: `specs/`, `features/launchpad/`, `features/upload-hub/`, etc.
- **Fix**: Update README to reflect actual project structure.

### ERR-024: `.temp/` prototype files
- **Contents**: 10 JSX/HTML/CSS prototype files from ideation phase
- **Assessment**: Not used by the app. Could be archived or deleted.
