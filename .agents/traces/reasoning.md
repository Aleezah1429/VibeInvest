# Reasoning — Design Decisions & Rationale

> **Trace ID**: `892ab532-e0ea-41be-80ee-7dfb0abfa3b5`
> **Generated**: 2026-05-17T16:45:00+05:00

---

## Decision 1: Hardcoded data over API integration

**What**: All report data (score 712, verdict INVEST, dimensions, metrics, findings, deliverables) is hardcoded inline. No API calls exist.

**Why (inferred)**: The team prioritized **demo storytelling** over functional completeness. In a 5-day hackathon, a polished visual demo that reliably impresses judges beats a half-working API integration that might fail during the presentation. The loading screen simulations and handoff chat create an illusion of real-time processing.

**Trade-off**: The app cannot analyze any startup other than the hardcoded "Bykea" example. All data is identical regardless of what name the user types.

---

## Decision 2: Adding the Handoff screen (not in PRD)

**What**: `handoff.tsx` was added between Loading and Report — a chat room where agents discuss findings with scripted messages.

**Why (inferred)**: The 4-agent concept is VibeInvest's differentiator. A simple loading bar followed by a report doesn't showcase the agent collaboration story. The handoff screen makes agents feel like real personas — they reference each other's findings, flag disagreements, and build tension toward the score reveal. This is the "wow moment" for judges.

**Trade-off**: Added ~370 lines of code and an extra navigation step. But the demo impact justifies it.

---

## Decision 3: Timer simulation over SSE streaming

**What**: Loading uses `requestAnimationFrame` with a 3.2s timer per agent instead of real SSE events.

**Why (inferred)**: Two blockers: (1) React Native has no native `EventSource` — PRD flagged this risk. (2) SSE integration would require the backend to be running and reachable, adding failure points during a live demo. A deterministic timer guarantees a smooth demo every time.

**Trade-off**: The app is offline-only. No real analysis happens.

---

## Decision 4: Built-in Animated API over Reanimated

**What**: Despite installing `react-native-reanimated@4.1.1`, all custom animations use React Native's `Animated`.

**Why (inferred)**: The animations needed are timeline-based sequences — count-ups, progress fills, fade-ins, spring stamps. These are well-served by `Animated.timing` and `Animated.spring`. Reanimated's strengths (gesture-driven, worklet-based, 60fps interactions) aren't needed here. Using `Animated` also avoids Reanimated's Babel plugin complexity.

**Trade-off**: `useNativeDriver: false` is used for width interpolations (progress bars), which runs on the JS thread. This could cause jank on low-end Android devices.

---

## Decision 5: Inline components over extraction

**What**: `DimItem`, `MetricCard`, `AgentCard`, `ChatBubble`, all 4 scene components — defined inside their respective screen files. Nothing in `components/`.

**Why (inferred)**: Speed. With a 5-day deadline, creating proper component files with typed interfaces adds overhead per component. When you know a component will only be used in one screen, inlining is faster. The `components/` directory was left as Expo scaffold defaults.

**Trade-off**: `loading.tsx` is 728 lines, `report.tsx` is 376 lines. Hard to navigate and maintain. Some components (AgentCard, MetricCard) could be reused if extracted.

---

## Decision 6: Dual icon libraries

**What**: `@expo/vector-icons` (Ionicons) for UI chrome + `lucide-react-native` for agent-specific icons.

**Why (inferred)**: Ionicons provides standard UI icons (arrows, chevrons, download, share) that are familiar and lightweight. Lucide provides more expressive icons (Crown, Sparkles, CircleDollarSign) that better represent agent personas. The team wanted richer iconography for the agent identity system.

**Trade-off**: Two icon packages increase bundle size. Lucide requires `react-native-svg` as a peer dependency (already needed for other features).

---

## Decision 7: `router.replace` for Loading → Handoff → Report

**What**: Loading uses `router.replace('/handoff')` and Handoff uses `router.replace('/report')`.

**Why (inferred)**: `replace` removes the previous screen from the stack. You shouldn't be able to "go back" to the loading screen once agents are done — the analysis can't be replayed. This prevents the user from seeing a stale loading state.

**Trade-off**: The back button on Report goes to Search (via `router.push('/search')`), not back through the flow. This is intentional — you can't "un-analyze."

---

## Decision 8: Dark mode only

**What**: `DarkTheme` is forced in `_layout.tsx`. All screens use `#09090F` background. No light mode support.

**Why (inferred)**: Per PRD: "Custom UI themes (Dark mode only)" is explicitly in-scope. Dark mode is also more dramatic for a demo — the indigo accents, lime financial data, and gold CVO elements pop against the near-black background. It also matches the "hacker/analyst" aesthetic of the product.

**Trade-off**: None for v1. Light mode is out of scope.

---

## Decision 9: Pakistan-centric defaults

**What**: Hardcoded examples use Pakistani startups (Bykea, Bazaar, Airlift, Retailo). Currency is PKR. Agent "Munshi" is an Urdu term. Home screen says "Pakistan startup."

**Why (inferred)**: The hackathon likely targets a Pakistani audience (judges, investors). Using local startups and terminology creates immediate relevance and credibility. "Munshi" (accountant/bookkeeper in Urdu) is more memorable than "Financial Analyst."

**Trade-off**: Limits international appeal in v1, but this is intentional for the demo audience.

---

## Decision 10: No `services/` or custom hooks layer

**What**: PRD and skills prescribe `services/api.ts` and custom hooks. Neither was built.

**Why (inferred)**: Without a real API to call, there's nothing for a service layer to wrap. Building the abstraction before the integration would have been premature — code written to a speculative API shape often needs rewriting when the real API is connected. The team chose to defer this until API integration begins.

**Trade-off**: When API integration starts, the entire data flow must be designed from scratch — types, service functions, hooks, state management. No scaffolding exists.
