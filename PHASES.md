# Phases — Hackathon to Product

The evolution of VibeInvest from a 5-day hackathon project to a production investor tool.

---

## Phase 0: Hackathon (Days 1–5) ← **We are here**

**Goal**: Build a demo-ready app that tells a compelling story.

**What ships**:
- 6-screen mobile app (Splash → Home → Search → Loading → Handoff → Report)
- 4 AI agent personas with unique animated loading scenes
- Scripted agent chat handoff with dramatic score reveal
- Full report UI: Aura Score, dimensions, metrics, agent cards, deliverables
- Dark-mode-only design with custom branding

**What doesn't ship**:
- Real API integration (data is hardcoded for demo)
- Error handling and edge cases
- Tests
- Authentication or persistence

**Success metric**: Judges are impressed by the demo flow and agent concept.

---

## Phase 1: Functional Prototype (Weeks 1–2 post-hackathon)

**Goal**: Connect the frontend to the real backend. Real data flows through the app.

**Key deliverables**:
1. `services/api.ts` — SSE streaming utility with `react-native-sse`
2. Loading screen reads real `agent_start`, `agent_text`, `pipeline_complete` events
3. Report screen renders dynamic data from API response
4. All 4 agent reports displayed (Skeptic, Munshi, Hype, CVO)
5. Error states: network failure, API timeout, invalid response
6. Search sends full context (intent, sector, stage, funding, concern)

**Success metric**: Enter a real startup name → see real AI-generated analysis.

---

## Phase 2: Polish & Reliability (Weeks 3–4)

**Goal**: Production-quality mobile experience.

**Key deliverables**:
1. KeyboardAvoidingView on all input screens
2. Skeleton loading states throughout
3. Empty states (no recent reports, no results)
4. Offline detection with graceful messaging
5. Component extraction (AgentCard, MetricCard, DimItem → `components/`)
6. TypeScript strict compliance (remove all `any` types)
7. Accessibility pass (labels, contrast ratios, touch targets)
8. Cross-platform testing (iOS + Android, multiple device sizes)
9. Jest tests for score calculation and SSE stream parsing

**Success metric**: Zero console warnings. Works on 5+ device sizes. 100% typed.

---

## Phase 3: User Accounts & Persistence (Months 1–2)

**Goal**: Users can save, revisit, and share their reports.

**Key deliverables**:
1. Firebase/Supabase authentication (email + Google sign-in)
2. Firestore-backed report history
3. Recent reports list (real data, not hardcoded)
4. Report sharing via native share sheet
5. PDF export of Investor Brief
6. User profile and settings screen

**Success metric**: Users return to the app to check past reports.

---

## Phase 4: Intelligence & Differentiation (Months 2–4)

**Goal**: VibeInvest becomes a daily tool, not a one-off.

**Key deliverables**:
1. Startup watchlist with periodic re-analysis alerts
2. Compare mode (side-by-side two startups)
3. Custom agent weight sliders (adjust scoring emphasis)
4. Pitch deck upload for enhanced analysis
5. Multi-market expansion (India, MENA, SEA data sources)
6. Push notifications for tracked startups

**Success metric**: Weekly active users. Users analyze 3+ startups per week.

---

## Phase 5: Platform (Months 6–12)

**Goal**: VibeInvest becomes infrastructure for investor workflows.

**Key deliverables**:
1. Web dashboard (Next.js) for desktop deep-dives
2. Team workspaces with collaborative annotations
3. REST/GraphQL API for programmatic access
4. White-label mode for VC firms and accelerators
5. Real-time data integrations (Crunchbase, PitchBook, LinkedIn)
6. Investor network graph visualization
7. Deal flow pipeline management

**Success metric**: VC firms adopt VibeInvest as their pre-screening tool.

---

## Vision Statement

> **Day 1**: A hackathon demo that makes judges say "whoa."
> **Month 1**: A real tool that saves investors 4 hours per startup.
> **Month 6**: The default first step before any meeting.
> **Month 12**: Infrastructure that powers how Pakistan's startup ecosystem gets funded.

---

*See [ROADMAP.md](ROADMAP.md) for the current sprint, and [FEATURES.md](FEATURES.md) for the detailed feature list.*
