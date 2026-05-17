# Features — Tier List

All features organized by release tier: MVP (hackathon), v1.5 (post-hackathon), and Future (3–12 months).

---

## MVP (Hackathon Demo)

Core flow: **Name → Agents → Score → Report**

| Feature | Screen | Status |
|---------|--------|--------|
| Startup name input | Search | ✅ Done |
| Intent selection (Invest/Acquire/Research/Partner) | Search | ✅ Done |
| Additional context fields (Sector, Stage, Funding) | Search | ✅ Done |
| 4-agent loading animations (unique per agent) | Loading | ✅ Done |
| Agent progress bar (color-coded) | Loading | ✅ Done |
| Agent handoff chat room (scripted) | Handoff | ✅ Done |
| Aura Score reveal (animated 0→712) | Report | ✅ Done |
| INVEST verdict stamp (spring animation) | Report | ✅ Done |
| Dimension scores (4 bar charts) | Report | ✅ Done |
| Key metrics grid (2×2) | Report | ✅ Done |
| Agent report cards (expand/collapse) | Report | 🟡 2 of 4 agents |
| Deliverables accordion | Report | ✅ Done |
| Custom GIF splash screen | Global | ✅ Done |
| Dark theme (`#09090F`) | Global | ✅ Done |
| SSE streaming integration | Loading | ❌ Missing |
| Dynamic report data from API | Report | ❌ Missing |
| Error / empty states | Global | ❌ Missing |

---

## v1.5 (Post-Hackathon · 2 weeks)

| Feature | Priority | Effort |
|---------|----------|--------|
| SSE streaming service (`services/api.ts`) | P0 | High |
| Real API connection (replace timer simulation) | P0 | High |
| Data parsing (`pipeline_complete` → `ReportData`) | P0 | Medium |
| Send intent + context fields to backend | P1 | Low |
| Render all 4 agent reports (add Hype + CVO) | P1 | Low |
| Error states (network, timeout, invalid response) | P1 | Medium |
| Loading skeleton states | P1 | Low |
| Empty state for recent reports | P1 | Low |
| KeyboardAvoidingView on search screen | P2 | Low |
| TypeScript cleanup (remove `any` props) | P2 | Low |
| Extract components (DimItem, MetricCard, AgentCard) | P2 | Medium |
| Accessibility labels on icon buttons | P2 | Low |

---

## Future (3–12 months)

### Tier 1 — High Impact
- User authentication (Firebase/Supabase)
- Report history (Firestore-backed)
- PDF export (Investor Brief download)
- Native sharing (iOS/Android share sheet)
- Offline mode (AsyncStorage caching)
- Push notifications (tracked startup alerts)

### Tier 2 — Differentiation
- Compare mode (side-by-side startups)
- Watchlist with periodic re-analysis
- Custom agent weight sliders
- Multi-market support (India, MENA, SEA)
- Pitch deck upload for agent analysis
- Investor network graph visualization

### Tier 3 — Platform
- Web dashboard (Next.js companion)
- Team workspaces with annotations
- REST/GraphQL API access
- White-label mode for VC firms
- Real-time data feeds (Crunchbase, PitchBook)

---

## Explicitly Out of Scope (v1)

Per PRD.md:
- ❌ User authentication
- ❌ Persistent cloud history
- ❌ PDF generation/export on mobile
- ❌ Custom UI themes (dark mode only)

---

*See [ROADMAP.md](ROADMAP.md) for the sprint schedule, and [PHASES.md](PHASES.md) for the long-term vision.*
