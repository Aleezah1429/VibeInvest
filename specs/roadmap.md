# Roadmap

Phase-by-phase progress checklist. Tick `[x]` only when the feature is shipped, demoed, and the team agrees it's done. Narrative for each phase lives in [PHASES.md](../PHASES.md); hour-by-hour for Phase 0 lives in [ROADMAP.md](../ROADMAP.md).

---

## Phase 0 — Hackathon (2 days, 3 people)

**Goal:** ship a credible 3-minute demo that wins on technical depth and cultural fit.

**Scope:** text-input only, English output, single result flow, four agents producing an Aura Score.

| Feature | Spec | Owner | Status |
| --- | --- | --- | --- |
| Agent pipeline (Skeptic → Munshi → Hype → CVO via google-adk) | [features/agent-pipeline/](../features/agent-pipeline/) | Lane A | [x] *(code shipped; end-to-end run needs `.env` GOOGLE_API_KEY)* |
| Launchpad (welcome + CTA) | [features/launchpad/](../features/launchpad/) | Lane B / C | [x] |
| Upload Hub (text input, multimodal UI stubbed) | [features/upload-hub/](../features/upload-hub/) | Lane B | [x] |
| Squad Report (live boardroom: 4 agents streaming) | [features/squad-report/](../features/squad-report/) | Lane B | [x] |
| Aura Audit (score gauge + green/red flags) | [features/aura-audit/](../features/aura-audit/) | Lane B / C | [x] |
| Final Verdict & Share (verdict + PDF export + LinkedIn/WhatsApp) | [features/final-verdict/](../features/final-verdict/) | Lane B / C | [x] |

**Definition of done:**
- [ ] Live public URL works from a phone hotspot
- [ ] Three pre-curated demo ideas produce satisfying verdicts (Invest / Iterate / Pivot)
- [ ] 90-second backup demo video recorded
- [ ] Submission package: repo link, deck, video, public URL — all in one place

**Exit:** submitted by deadline.

---

## Phase 0.5 — Recovery week (Week 1 after submission)

**Goal:** rebuild the features cut from the 2-day MVP while energy is still high.

| Feature | Notes | Status |
| --- | --- | --- |
| Voice input (Urdu / English / Roman Urdu) | Extend upload-hub spec | [ ] |
| Handwritten plan OCR | Extend upload-hub spec | [ ] |
| Pitch deck PDF upload | Extend upload-hub spec | [ ] |
| Urdu output across all agents | New: `features/urdu-output/` | [ ] |
| Persist reports to Firestore | New: `features/persist-reports/` | [ ] |

**Definition of done:** every Tier 1 feature in [FEATURES.md](../FEATURES.md) is real, not just promised in the pitch.

---

## Phase 1 — Polish (Weeks 2–6)

**Goal:** turn the demo into something the first 100 founders will actually use.

| Workstream | Spec to write | Status |
| --- | --- | --- |
| User accounts + auth | `features/auth/` | [ ] |
| Admin dashboard for failed runs | `features/admin-dashboard/` | [ ] |
| Prompt-tuning against 50 real founder ideas | (process, no spec) | [ ] |
| LinkedIn + university WhatsApp soft launch | (marketing, no spec) | [ ] |
| Cost profiling — typical run under $0.15 in Gemini | (perf, no spec) | [ ] |

**Definition of done:** 100 ideas analyzed by real users, average session rating ≥ 4/5, monthly infra under $200.

---

## Phase 2 — Beta (Months 2–3)

**Goal:** prove the loop — founders come back, iterate, and bring friends.

| Workstream | Spec to write | Status |
| --- | --- | --- |
| Re-roast tracker (score delta over time) | `features/reroast-tracker/` | [ ] |
| Pitch deck generator (Hype slide outline → PDF) | `features/deck-generator/` | [ ] |
| University pilot (≥2 of LUMS / NUST / IBA / FAST) | (partnership) | [ ] |
| Real competitor data (curated dataset, not web search) | `features/competitor-data/` | [ ] |
| Public Aura Score wall (opt-in) | `features/aura-wall/` | [ ] |

**Definition of done:** 1,000 ideas analyzed, 25% re-roast rate, 1 university partnership signed.

---

## Phase 3 — Monetize (Months 4–6)

**Goal:** convert the funnel to revenue without breaking the free virality loop.

| Workstream | Spec to write | Status |
| --- | --- | --- |
| Investor Mode (B2B paid) | `features/investor-mode/` | [ ] |
| B2C paid tier (full report + 3 re-roasts) | `features/paid-tier/` | [ ] |
| Pakistan Startup Fund deep-link integration | `features/psf-integration/` | [ ] |
| Specialist agents — Legal, Tech feasibility | `features/specialist-agents/` | [ ] |

**Definition of done:** 50 paying customers, MRR ≥ PKR 200k, PSF partnership in writing.

---

## Phase 4 — Scale (Months 7–12)

**Goal:** become infrastructure, not a product.

| Workstream | Spec to write | Status |
| --- | --- | --- |
| White-label for incubators (NIC, iAccelerate) | `features/white-label/` | [ ] |
| VC matching (Aura > 800 unlocks angel list) | `features/vc-matching/` | [ ] |
| Regional expansion (Bangladesh, MEA) | `features/regional-expansion/` | [ ] |
| Live mentor handoff (marketplace) | `features/mentor-handoff/` | [ ] |

**Definition of done:** 10,000 ideas analyzed, 3 incubator partnerships, MRR ≥ PKR 2M, 1 regional pilot live.

---

## Decision gates

Each phase ends with an explicit go / no-go on the next.

| Gate | Question | If no, then |
| --- | --- | --- |
| 0 → 0.5 | Did we ship a working demo? | Cut scope further; rebuild fundamentals |
| 0.5 → 1 | Are all Tier 1 features actually working? | Stay in recovery |
| 1 → 2 | ≥4/5 rating from real founders + ≥10% return rate? | The loop isn't real — fix it before public push |
| 2 → 3 | Is there a workstream 25%+ of users would pay for today? | Don't ship payments yet; find one |
| 3 → 4 | Unit economics positive on at least one revenue stream? | Hold expansion; optimize the working stream first |
