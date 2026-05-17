# Roadmap — Sprint Plan

5-day hackathon sprint with daily goals and current status.

---

## Sprint Overview

| Day | Theme | Status |
|-----|-------|--------|
| Day 1 | Setup + Scaffolding + Data Layer | ✅ Complete |
| Day 2 | Core Feature — Input & Stream | 🟡 Partial |
| Day 3 | Core Feature — Report UI | 🟡 Partial |
| Day 4 | Polish, Edge Cases, Error Handling | 🟡 Partial |
| Day 5 | Buffer — Bugfixes, Device Testing | ⬜ Not Started |

---

## Day 1: Setup + Scaffolding ✅

**Goal**: Skeleton app with all screens navigable.

- [x] Initialize Expo project with TypeScript strict mode
- [x] Configure Expo Router with Stack navigator
- [x] Create 4 core screens: Home, Search, Loading, Report
- [x] Set up `constants/theme.ts` with colors and font tokens
- [x] Add brand assets (logo PNG, animated GIF, splash icon)
- [x] Configure `app.json` with icons and splash screen
- [ ] ~~Set up `services/api.ts` for SSE streaming~~ → deferred

---

## Day 2: Core Feature — Input & Stream 🟡

**Goal**: User can enter a startup name and see agents working.

- [x] Search screen with startup name input
- [x] Intent selector (Invest / Acquire / Research / Partner)
- [x] Additional context fields (Sector, Stage, Funding, Concern)
- [x] Loading screen with 4 agent-specific animations
- [x] Progress bar with per-agent color coding
- [x] Agent "sayings" that rotate during analysis
- [ ] `POST /api/run/google-adk` integration
- [ ] SSE stream connection (real-time event parsing)
- [ ] Handle `agent_start`, `agent_text`, `pipeline_complete` events

**What shipped**: The full visual experience — timer-simulated agent progression with unique animated scenes for each agent (terminal scroll, financial ticker, glitch text, orbital synthesis).

**What's missing**: Real API connection. Loading is simulated with a 3.2s timer per agent.

---

## Day 3: Core Feature — Report UI 🟡

**Goal**: Full report screen with all data sections.

- [x] Aura Score with animated count-up (0 → 712)
- [x] INVEST verdict stamp with spring animation
- [x] Dimension scores (Market, Financials, Brand, Strategy) as bar charts
- [x] Key metrics grid (Valuation, GMV, Burn Rate, Runway)
- [x] Agent report cards with expand/collapse
- [x] Deliverables section (Investor Brief, Questions, Deal Memo)
- [x] Handoff screen — agent chat room (bonus, not in original PRD)
- [ ] Parse `pipeline_complete` payload into report data
- [ ] Render all 4 agent reports (currently only 2: Skeptic, Munshi)
- [ ] Dynamic data binding (scores, metrics, findings from API)

**What shipped**: Complete report layout with all UI sections. Deliverables have accordion expand/collapse with download/share CTAs.

**What's missing**: Data is hardcoded. Only 2 of 4 agent reports are rendered. Download/Share buttons are non-functional.

---

## Day 4: Polish & Edge Cases 🟡

**Goal**: Handle failures gracefully and polish the experience.

- [x] Custom animated splash screen (GIF with fade-out)
- [x] Loading scene animations (4 unique per agent)
- [x] Handoff chat with auto-scrolling messages
- [x] Score reveal animation sequence
- [ ] API error handling (network failures, timeouts)
- [ ] Empty state for "no recent reports"
- [ ] `KeyboardAvoidingView` on search screen
- [ ] Graceful offline message
- [ ] Loading fallback states

**What shipped**: Heavy animation polish. The loading → handoff → reveal flow is very cinematic.

**What's missing**: All error handling, empty states, and keyboard avoidance.

---

## Day 5: Buffer — Testing & Final Polish ⬜

**Goal**: No new features. Test and fix only.

- [ ] Run on iOS Simulator
- [ ] Run on Android Emulator
- [ ] Fix UI clipping on small devices
- [ ] Fix any `console.warn` or `console.error`
- [ ] Write tests for core business logic
- [ ] Final demo walkthrough

---

## Post-Hackathon Priorities

Once the hackathon deadline passes, these are the top priorities:

### P0 — Must Have (Week 1 post-hackathon)
1. SSE streaming integration (`services/api.ts`)
2. Connect loading screen to real API events
3. Parse `pipeline_complete` into dynamic report data
4. Wire intent/context fields to API request body

### P1 — Should Have (Week 2)
5. Add missing Hype + CVO agent report cards
6. Error, loading, and empty states across all screens
7. `KeyboardAvoidingView` on search screen
8. Remove hardcoded report data

### P2 — Nice to Have (Week 3+)
9. Download/Share button functionality
10. Local report caching (AsyncStorage)
11. Accessibility pass (labels, contrast, touch targets)
12. Component extraction (DimItem, MetricCard, AgentCard → `components/`)

---

*See [PLAN.md](.agents/specs/PLAN.md) for the original 5-day plan, and [FEATURES.md](FEATURES.md) for the full feature tier list.*
