# PHASES — Hackathon to Year One

A phased plan for the life of the product. The 10-day hackathon is just Phase 0.

| Phase | Window | North-star metric | Outcome |
| --- | --- | --- | --- |
| 0. Hackathon | **2 days, 3 people** | Working demo, 4 agents, Aura Score | AI Seekho Phase 2 submission |
| 0.5. Recovery week | Week 1 post-submission | Multimodal back in; reports persisted | Catch up on what 2 days couldn't fit |
| 1. Polish | Weeks 2–6 | 100 ideas analyzed | Public soft launch |
| 2. Beta | Months 2–3 | 1,000 ideas analyzed, 25% return rate | Founder community + university pilots |
| 3. Monetize | Months 4–6 | First paid customers (B2B + B2C) | Investor Mode + paid tier live |
| 4. Scale | Months 7–12 | 10k ideas, 3 incubator partnerships | White-label revenue + regional expansion |

---

## Phase 0 — Hackathon (2 days, 3 people)

**Goal:** ship a credible 3-minute demo that wins on technical depth and cultural fit — within an aggressive 6-person-day budget.

**Scope:** stripped-down MVP. Text input only, English output, single-page result view, four agents producing an Aura Score. See [ROADMAP.md](ROADMAP.md) for the hour-by-hour plan and [FEATURES.md](FEATURES.md) for the explicit "cut from 2-day MVP" list.

**Definition of done:**
- Live URL accessible from the venue.
- Three pre-curated demo ideas that produce satisfying verdicts.
- 90-second backup demo video (mandatory — venue WiFi *will* fail).
- A submission package: source repo, deck, video, public URL.

**Exit criteria:** submitted by the deadline.

---

## Phase 0.5 — Recovery week (Week 1 after submission)

**Goal:** rebuild the features that got cut from the 2-day MVP, while the team has energy and momentum.

**Workstreams:**
- Voice input (Urdu / English / Roman Urdu) via Gemini audio.
- Handwritten plan OCR via Gemini vision.
- Pitch deck PDF upload.
- Urdu output across all agents (proper RTL, Nastaliq font).
- Persist reports to Firestore (currently in-memory only).

**Definition of done:** every Tier 1 feature in [FEATURES.md](FEATURES.md) is real, not just promised in the pitch.

---

## Phase 1 — Polish (Weeks 2–6)

**Goal:** turn the demo into something the first 100 founders will actually use.

**Workstreams:**

- **Reliability.** Move from `/tmp` JSON to Firestore; add user accounts; persist reports; basic admin dashboard for monitoring failed runs.
- **Quality.** Run the agent pipeline on 50 real founder ideas (sourced through universities). For each, capture: did the score feel fair? did the fixes feel actionable? Tune prompts iteratively.
- **Distribution.** Soft launch on LinkedIn (Pakistan startup community) and 2–3 university WhatsApp groups (LUMS, NUST, IBA). Track Aura Card shares as a leading indicator.
- **Cost control.** Profile per-run cost. If a typical run is over $0.15 in Gemini API spend, optimize prompts or downgrade Skeptic and Munshi to Flash Lite.

**Definition of done:** 100 ideas analyzed by real users, average session quality rating above 4/5, monthly infra cost under $200.

---

## Phase 2 — Beta (Months 2–3)

**Goal:** prove the loop — founders come back, iterate, and bring friends.

**Workstreams:**

- **Re-roast tracker (F10).** Authenticated dashboard, score history, delta visualization.
- **Pitch deck generator (F8).** Lands as a "premium" feature signal even before payments are wired.
- **University pilots.** Formal partnership with at least 2 of LUMS / NUST / IBA / FAST. Embedded as a screening tool in their entrepreneurship programs.
- **Real competitor data (F12).** Move Skeptic off pure web search onto a curated dataset.
- **Community.** Public Aura Score wall (opt-in). Monthly "highest iterator" highlight.

**Definition of done:** 1,000 ideas analyzed; 25% of users have re-roasted at least once; one university partnership signed; competitor false-positive rate under 20%.

---

## Phase 3 — Monetize (Months 4–6)

**Goal:** convert the funnel to revenue without breaking the free virality loop.

**Workstreams:**

- **Investor Mode (F9) launches paid.** Pricing: PKR 5,000–10,000/month per angel for unlimited deck analyses; PKR 25k/month per VC firm.
- **B2C paid tier.** Free: Aura Score + top 3 fixes. Paid (PKR 500 one-time): full report + pitch deck export + 3 re-roasts. Free Aura Card sharing stays free forever — it is the marketing channel.
- **Pakistan Startup Fund integration (F14).** Pursue formal API integration; until then, deep-link to the application portal pre-filled with the report.
- **Specialist agents (F17).** Legal and Tech feasibility ship first as upsells.

**Definition of done:** first 50 paying customers (any mix of B2B and B2C); MRR above PKR 200k; PSF partnership in writing.

---

## Phase 4 — Scale (Months 7–12)

**Goal:** become infrastructure, not a product.

**Workstreams:**

- **White-label for incubators (F16).** NIC Karachi, iAccelerate Lahore, NIC Peshawar. Each gets a branded subdomain and a cohort dashboard. Revenue model: annual license per cohort + per-seat.
- **VC matching (F15).** Above-800 founders see a curated list of Pakistani angels whose mandate matches. Revenue share on intros that close.
- **Regional expansion (F18).** Pilot in Bangladesh (Dhaka entrepreneurship ecosystem) and one MEA market. Localize for Bengali and Arabic.
- **Mentor handoff (F19).** Top-tier ideas can pay extra for a live human mentor session. Marketplace model.

**Definition of done:** 10,000 cumulative ideas analyzed, 3 incubator partnerships live, MRR above PKR 2M, at least one regional pilot in market.

---

## Decision gates between phases

Each phase ends with an explicit go / no-go on the next one. Don't autopilot.

| Gate | Question | If no: |
| --- | --- | --- |
| 0 → 1 | Did we ship a working demo and get good signal from judges/peers? | Cut scope, rebuild fundamentals before public launch. |
| 1 → 2 | Are real founders actually getting value (≥4/5 session ratings, ≥10% return rate)? | Stay in Phase 1; the loop isn't real yet. |
| 2 → 3 | Is there a workstream that 25%+ of users would pay for *today*? | Don't ship payments yet; find one. |
| 3 → 4 | Are unit economics positive on at least one revenue stream? | Hold on expansion; optimize the working stream first. |

---

## What we will *not* do (and why)

- **Build a Flutter native app in Phase 0.** PWA installability is enough until usage data justifies native.
- **Open-source the agents in Phase 1.** Defer until the prompts are stable — too much churn early on.
- **Take VC money in Phase 0–2.** Premature; we have no metrics. Bootstrap on hackathon prize money + grants.
- **Build our own LLM.** Gemini does what we need; verticalize on the workflow, not the model.
- **Expand beyond Pakistan before Month 7.** The cultural specificity *is* the moat.
