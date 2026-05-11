# FEATURES

Three tiers: **MVP** (must ship for hackathon), **v1.5** (next 30 days), and **Future** (post-launch).
Each feature has acceptance criteria so "done" is unambiguous.

---

## 2-day MVP (what actually ships at the hackathon)

With 3 people and 2 days, the demo-ready scope is intentionally narrow:

- **F2** — Four-agent orchestration (Skeptic → Munshi → Hype → CVO via `google-adk`)
- **F3** — Live boardroom UI showing the agents stream
- **F4** — Aura Score (0–1000) with verdict
- **F6** — Shareable Aura Card PNG (via `jspdf`, already a dep)
- **Text input only.** No voice, image, or PDF.
- **English output.** Urdu is a Day 2 stretch goal, not a commitment.
- **Single result page.** No multi-screen report dashboard.

Everything in **Tier 1** below that is *not* in the bullet list above moves to **Phase 0.5 — Recovery week** (see [PHASES.md](PHASES.md)). The pitch still talks about voice/Urdu/etc. — we just say "live in Week 1" instead of "live today."

---

## Tier 1 — MVP (full intended scope, ships across Phase 0 + 0.5)

### F1. Multimodal idea input
- **What:** Founder submits an idea as typed text, a voice note (Urdu / English / Roman Urdu), a photo of a handwritten plan, or a pitch deck PDF.
- **Acceptance:**
  - All four input modes hit the agent pipeline.
  - Voice transcription works on at least 5 sample Urdu clips.
  - Handwritten OCR works on at least 3 sample photos.
- **Depends on:** Gemini 2.5 multimodal endpoints.

### F2. Four-agent orchestration
- **What:** Skeptic → Munshi → Hype → CVO run in sequence via `google-adk`. Each consumes the previous agent's output.
- **Acceptance:**
  - Each agent emits valid JSON matching its contract in [AGENTS.md](AGENTS.md).
  - Total pipeline latency under 45 seconds for a typical idea.
  - CVO's final score reflects the upstream agents' findings (smoke test: a bad idea scores under 500).
- **Depends on:** `google-adk-agent/agent_system.py` (Day 1 task).

### F3. Live boardroom UI
- **What:** While agents run, the user sees a 2×2 grid of agent avatars with live status updates and animated handoffs.
- **Acceptance:**
  - SSE stream renders agent state in under 200ms of the server-side event.
  - Each agent's status transitions: idle → working (with sub-message like "scanning competitors") → done.
  - Handoff animation fires between agent completions.

### F4. Aura Score (0–1000) with verdict
- **What:** Final score with one of four verdicts: Invest / Iterate / Pivot / Pass. Dimensional breakdown across Market / Money / Brand / Strategy.
- **Acceptance:**
  - Score is reproducible (same input → same score within ±30 points).
  - Each dimension has a 1–10 sub-score with a one-sentence justification.
  - Verdict is consistent with the score: <400 = Pass, 400–599 = Pivot, 600–799 = Iterate, 800+ = Invest.

### F5. Detailed report view
- **What:** Collapsible card per agent with their full analysis, plus a pinned "Top 3 fixes" section at the top.
- **Acceptance:**
  - Each card shows the agent's structured findings and a free-text summary.
  - Top 3 fixes are actionable (each starts with a verb, names a metric or target).
  - Raw SSE log is available as a drawer for debug-curious users.

### F6. Shareable Aura Card
- **What:** One-tap export of the verdict to a 1080×1080 PNG suitable for Instagram/LinkedIn.
- **Acceptance:**
  - PNG generated client-side via `jspdf` (already a dep).
  - Card includes Aura Score, verdict label, top fix headline, and the VibeInvest watermark.
  - Four verdict-specific card designs (different color treatment per verdict).

### F7. Urdu and Roman Urdu support
- **What:** Both input and output work in English, Urdu, and Roman Urdu. Language is auto-detected.
- **Acceptance:**
  - The same idea in three languages produces output in the matching language.
  - Urdu output renders with a proper Nastaliq-family font.
  - RTL layout works on the Urdu report view.

---

## Tier 2 — v1.5 (30 days post-hackathon)

### F8. Pitch deck generator
- **What:** The Hype agent emits a slide outline; the system renders a 10-slide PDF.
- **Acceptance:** Generated deck is recognizably the founder's idea (not generic boilerplate), follows a standard pitch structure (problem → solution → market → traction → ask), and exports as PDF.

### F9. Investor Mode (B2B flow)
- **What:** Investor uploads a founder's pitch deck. Agents return risk flags (green/yellow/red), translation of tech jargon to plain Urdu/English, and a list of questions to ask.
- **Acceptance:** Risk meter is calibrated against a small panel of real angels' assessments of the same decks.

### F10. Re-roast tracker
- **What:** Authenticated user dashboard; each idea has a history of scored runs so founders can see their delta after applying fixes.
- **Acceptance:** Firestore-backed history; score delta is shown prominently on each re-run.

### F11. Voice output
- **What:** Agents "speak" their verdicts using a TTS layer (Gemini audio or a third-party).
- **Acceptance:** Works in English and Urdu; uses each agent's distinct voice persona.

### F12. Real competitor data integration
- **What:** The Skeptic moves from web-search-based heuristics to a curated Pakistan startup dataset (Crunchbase mirror + Invest2Innovate directory).
- **Acceptance:** Competitor matches cite a real source URL; false-positive rate under 20% on a 30-idea test set.

---

## Tier 3 — Future (3–12 months)

### F13. Founder community + leaderboard
Public Aura Score wall, optional sharing, monthly leaderboard for highest-iterating founders. Designed as a viral growth loop.

### F14. Pakistan Startup Fund integration
Direct submission pipe from a passing VibeInvest report into the PSF application portal. Requires partnership with MoITT.

### F15. VC matching
Aura Score above 800 unlocks a curated list of Pakistani angels and seed funds whose mandate matches the founder's sector/stage.

### F16. White-label for incubators
NIC Karachi, iAccelerate Lahore, NIC Peshawar — each gets a branded instance. Revenue: SaaS license per cohort.

### F17. Additional specialist agents
Legal, Tech feasibility, HR/hiring plan, Operations. Each is an opt-in deep-dive after the core four agents finish.

### F18. Regional expansion
Bangladesh and MEA markets. Requires new market-data integrations and additional languages (Bengali, Arabic).

### F19. Live mentor handoff
For top-scoring ideas, hand off to a human mentor through a marketplace. Revenue split with mentors.

---

## Cut from MVP (and why)

| Idea | Why cut |
| --- | --- |
| User auth and accounts | A guest-first flow gets viral lift faster; auth is v1.5 alongside the dashboard. |
| Mobile-native (Flutter) build | The existing Next.js stack ships as a PWA in days, not weeks. Native can come later if metrics justify it. |
| Real-time agent chat | Agents are sequential, not chatty. Adding a chat layer is feature creep for the 3-minute demo. |
| More than four agents | Demo clarity beats coverage. Specialist agents are tier 3. |
| Stripe / payments | No paid tier in MVP. Freemium kicks in post-launch (Tier 2/3). |
