# Agent Observations — Codebase Architecture

> **Trace ID**: `892ab532-e0ea-41be-80ee-7dfb0abfa3b5`
> **Generated**: 2026-05-17T16:45:00+05:00

---

## Project Structure

```
VibeInvest/
├── .agents/specs/          PRD.md, PLAN.md
├── .agents/skills/         5 skill templates (add-screen, add-component, etc.)
├── app/                    6 screens (Expo Router file-based routing)
│   ├── _layout.tsx         Root layout — Stack nav + custom splash
│   ├── index.tsx           Home/splash screen (162 lines)
│   ├── search.tsx          Search form (148 lines)
│   ├── loading.tsx         Agent animations (728 lines — LARGEST file)
│   ├── handoff.tsx         Agent chat room (369 lines — NOT in PRD)
│   └── report.tsx          Final report (376 lines)
├── components/             Expo scaffold defaults only (no project components)
├── constants/theme.ts      Colors + platform-adaptive Fonts
├── hooks/                  Expo defaults only (useColorScheme, useThemeColor)
├── google-adk-agent/       Backend agent config (.env only)
├── api/env/                Python venv (stale)
├── frontend/               Abandoned Next.js app (.next + node_modules only)
├── .temp/                  Prototype JSX/HTML files from ideation phase
└── assets/images/          12 image files including brand logo + GIF
```

## Key Architectural Observations

### 1. No service layer exists
The PRD and skill files prescribe a `services/api.ts` pattern for API calls. No `services/` directory was ever created. All data in the app is hardcoded inline within screen files. The app has zero network calls.

### 2. Flat screen architecture (correct)
All 6 screens live directly in `app/` with no nested routes, groups, or tab navigation. This matches the PRD's linear flow (Home → Search → Loading → Report). The Stack navigator in `_layout.tsx` has `headerShown: false` — all headers are custom.

### 3. Monolithic screen files
Screens contain their own inline sub-components and styles. `loading.tsx` (728 lines) includes 4 scene components, a PulsingDot utility, the main screen, scene styles, and main styles — all in one file. `report.tsx` (376 lines) defines DimItem, MetricCard, and AgentCard inline. No component extraction to `components/` occurred.

### 4. Components directory is untouched scaffold
`components/` contains only Expo's auto-generated defaults:
- `external-link.tsx`, `haptic-tab.tsx`, `hello-wave.tsx`, `parallax-scroll-view.tsx`, `themed-text.tsx`, `themed-view.tsx`, `ui/collapsible.tsx`, `ui/icon-symbol.tsx`

None of these are used by any screen in the app.

### 5. Hooks directory is untouched scaffold
`hooks/` contains `use-color-scheme.ts` and `use-theme-color.ts` — both Expo defaults. No custom hooks for SSE, form state, or report data were created.

### 6. Handoff screen is a bonus addition
`handoff.tsx` doesn't appear in the PRD navigation map. It was inserted between Loading and Report as a dramatic narrative device — a chat room where agents discuss findings before the score reveal.

### 7. Two icon systems in use
The app uses both `@expo/vector-icons` (Ionicons) and `lucide-react-native`. Ionicons handles nav elements (back arrows, chevrons, action buttons). Lucide handles agent-specific icons (Search, CircleDollarSign, Sparkles, Crown, Bike, FileText).

### 8. Reanimated installed but barely used
`react-native-reanimated@4.1.1` is a dependency but is only used by scaffold components (`parallax-scroll-view.tsx`, `hello-wave.tsx`). All custom animations use React Native's built-in `Animated` API.

### 9. Frontend directory is a dead artifact
`frontend/` contains `.next/` and `node_modules/` — remnants of an abandoned Next.js web app. No source files remain. The README still references it.

### 10. `.temp/` contains prototype files
`.temp/` has 10 JSX/HTML prototype files (`agent-loading.jsx`, `screens-flow.jsx`, `screens-result.jsx`, `tweaks-panel.jsx`, etc.) plus a CSS file. These were likely used for rapid UI prototyping before the React Native implementation.

---

## Design System Observations

| Token | Value | Usage |
|-------|-------|-------|
| Background | `#09090F` | All screen containers |
| Primary accent | `#6366f1` | Buttons, links, score highlight |
| Primary light | `#818cf8` | Subtle accent text |
| Skeptic color | `#FF6B6B` | Red — risk, warnings |
| Munshi color | `#D4FF3D` | Lime — financial data |
| Hype color | `#A78BFA` | Purple — brand, social |
| CVO color | `#FFC83C` | Gold — final verdict |
| Success | `#22c55e` | Positive metrics, INVEST stamp |
| Warning | `#f59e0b` | Watch indicators |
| Danger | `#ef4444` | Risk flags |
| Card bg | `rgba(255,255,255,0.04-0.06)` | Glassmorphic cards |
| Card border | `rgba(255,255,255,0.08-0.15)` | Subtle glass edges |
| Border width | `0.5px` | Consistent thin borders |
| Border radius | `10-16px` (cards), `50px` (buttons) | Rounded cards, pill buttons |
| Mono font | Platform-adaptive via `Fonts.mono` | Terminal text, badges, timestamps |

---

## Dependency Analysis

### Used in app code
| Package | Where |
|---------|-------|
| `expo-router` | All screens — `useRouter`, `useLocalSearchParams`, `Stack` |
| `react-native` (Animated) | loading.tsx, handoff.tsx, report.tsx, _layout.tsx |
| `@expo/vector-icons` (Ionicons) | search.tsx, report.tsx — nav icons, action buttons |
| `lucide-react-native` | loading.tsx, handoff.tsx, report.tsx — agent icons |
| `expo-splash-screen` | _layout.tsx — `preventAutoHideAsync`, `hideAsync` |
| `expo-status-bar` | _layout.tsx — `StatusBar style="light"` |
| `react-native-safe-area-context` | Implicit via SafeAreaView |

### Installed but unused by app screens
| Package | Notes |
|---------|-------|
| `react-native-reanimated` | Only used in scaffold components |
| `expo-haptics` | Only in scaffold `haptic-tab.tsx` |
| `expo-web-browser` | Only in scaffold `external-link.tsx` |
| `expo-image` | Not imported anywhere |
| `expo-font` | Not imported anywhere |
| `expo-constants` | Not imported anywhere |
| `expo-symbols` | Not imported anywhere |
| `@react-navigation/bottom-tabs` | Not used (no tab navigation) |

---

## Git Branch Topology

```
main (8e3f41e)  ← HEAD, 16 commits, linear history
├── update-docs (8e3f41e)  ← current branch, same as main
├── logo-addition (c59a96b)  ← merged into main
├── mob_app (129abb3)  ← stale, 4 commits diverged from 985c751
├── UI-Phase1 (80e6e16)  ← stale, 1 commit diverged from d032b78
└── kill-switch (55f50f7)  ← stale, 1 commit diverged from d032b78
```

3 stale branches with unmerged work.
