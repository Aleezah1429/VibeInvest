# ROADMAP — 2-Day Sprint Plan

Submission target: AI Seekho 2026 Phase 2.
Team: **3 people**, **2 days**. That is **6 person-days total**.

This is brutal. The original 10-day / 4-person plan had 40 person-days — we have 15% of that budget. Everything below is the bare minimum demo. See the "What we cut" section at the bottom for the features pushed to post-hackathon.

---

## Lanes (one per person, no swapping)

| Lane | Owner role | Owns |
| --- | --- | --- |
| **A. Agents** | AI lead | `google-adk-agent/agent_system.py`, prompt tuning, JSON output schemas |
| **B. Full-stack** | FS lead | FastAPI SSE endpoint, Next.js submit form, boardroom view, Aura Card export |
| **C. Design + Demo** | Design lead | Brand kit, agent avatars, Aura Card layout, demo curation, pitch deck, video |

If someone is blocked, they help Lane B — that's where the most integration risk lives.

---

## Day 0 — Pre-work (do this tonight, ~2 hours each)

| Lane | Task | Time |
| --- | --- | --- |
| All | Clone repo, install deps, both servers boot. | 30 min |
| A | Get a Google AI Studio API key. Confirm Gemini 2.5 Flash answers a hello-world prompt through `google-adk`. | 60 min |
| A | Read [AGENTS.md](AGENTS.md). Prepare a draft of the four system prompts in a shared doc. | 30 min |
| B | Read `api/services/google_adk_runner.py` and `frontend/components/TerminalOutput.tsx`. You will reuse both heavily. | 30 min |
| C | Lock the brand kit: logo concept, 2-color palette, type pair. No more than 90 minutes — done is better than perfect. | 90 min |

**Exit:** every laptop runs the scaffold. Brand kit signed off. API key confirmed working.

---

## Day 1 — Build (target: end-to-end happy path runs locally)

### Lane A — Agents (8 hours)

| Block | Task | Hours |
| --- | --- | --- |
| Morning | Create `google-adk-agent/agent_system.py`. Define `skeptic_agent`, `munshi_agent`, `hype_agent`, `cvo_agent` with the prompts and tools from [AGENTS.md](AGENTS.md). Match the variable names the existing runner imports (`researcher_agent`, etc. — just alias them). | 3h |
| Midday | Wire each agent to return strict JSON. Test each one in isolation with one example idea. | 2h |
| Afternoon | Test the full chain (Skeptic → Munshi → Hype → CVO) end-to-end via `curl` against `/api/run/google-adk`. Tune until the Aura Score feels reasonable on three test ideas. | 3h |

**Exit:** `curl -N -X POST .../api/run/google-adk -d '{"company_name":"chai delivery LUMS"}'` streams four agents and ends with a valid `final_report` JSON.

### Lane B — Full-stack (8 hours)

| Block | Task | Hours |
| --- | --- | --- |
| Morning | Rip the SDK comparison out of [`frontend/app/page.tsx`](frontend/app/page.tsx). Build a single-page flow: hero → textarea + submit button. | 2h |
| Midday | Build the boardroom view: four agent cards in a 2×2 grid, each subscribes to SSE events filtered by agent name. Reuse `TerminalOutput.tsx` as a "raw logs" drawer. | 3h |
| Afternoon | Result section appears below the grid when `pipeline_complete` fires. Show Aura Score (big number), verdict pill, four dimension bars, top 3 fixes list. | 3h |

**Exit:** type an idea, click submit, watch the four agents activate, see the Aura Score appear at the bottom.

### Lane C — Design + Demo (8 hours)

| Block | Task | Hours |
| --- | --- | --- |
| Morning | Finalize agent avatars (4 SVGs). Hand off to Lane B as soon as ready — they need them by midday. | 3h |
| Midday | Aura Card design: 1080×1080 PNG template. Four verdict variants (Invest / Iterate / Pivot / Pass). Hand off PNG mocks to Lane B for `jspdf` implementation. | 3h |
| Afternoon | Curate three demo ideas. For each, run them through Lane A's pipeline (once it's up) and confirm the CVO output is "interesting" (one clear Invest, one clear Pivot, one Iterate with a satisfying fix list). | 2h |

**Exit:** all visual assets in repo. Three demo ideas with locked-in expected outputs.

### End-of-Day-1 integration (last hour, all three together)

Sit at one laptop. Run the demo from cold start. Whatever breaks, fix tomorrow morning.

---

## Day 2 — Polish + Pitch

### Morning (4 hours) — fix what broke

| Lane | Task |
| --- | --- |
| A | Prompt-tune to fix any "agent output looked weird" issue from Day 1 integration. Add a one-shot retry for malformed JSON. |
| B | Bug fixes from integration. Add Aura Card PNG export via `jspdf`. Wire the share button. |
| C | Polish pass on every screen — copy, spacing, colors. Reduce friction on the submit flow. |

### Midday (2 hours) — deploy + Urdu stretch

| Lane | Task |
| --- | --- |
| A | **Stretch:** Add `output_language` param. Pass `"ur"` if the user toggles "Urdu output" in the UI. Test once — if it works, ship; if not, drop without regret. |
| B | Deploy: Vercel for frontend, Fly.io or Render for FastAPI. Confirm the public URL works on phone tethering (proxy for venue WiFi). |
| C | Record 90-second screen-capture demo video as the **mandatory fallback**. Do not skip — venue WiFi will fail. |

### Afternoon (3 hours) — pitch

| All | Task |
| --- | --- |
| All | Rehearse the 3-minute demo five times against a stopwatch. Each rehearsal, cut one thing that doesn't earn its seconds. |
| C | Slides: title → problem → live demo → architecture diagram → roadmap. Five slides total. |
| A | One-page "how the agents work" handout for judges who go deep. |

### Final hour — submit

Submission package: live URL, video, deck, repo link. **Do not ship code on submission day after the deadline window closes.**

---

## Daily standup (5 minutes, twice a day — start of day + after lunch)

Three questions only:

1. What did you ship in the last block?
2. What are you shipping in the next block?
3. Are you blocked?

Five minutes. Stand up. If a discussion needs longer, take it offline.

---

## What we cut for the 2-day version

| Feature | Cut because | Lives in |
| --- | --- | --- |
| Voice input (Urdu/English) | Multimodal pipeline is a half-day on its own and the demo can show a typed Urdu idea. | Post-hackathon Week 1 |
| Handwritten plan OCR | Even higher risk than voice. Cool, but not worth half the budget. | Post-hackathon Week 1 |
| Pitch deck PDF upload | Same reason. | Post-hackathon Week 1 |
| Detailed multi-page report | One result screen with inline cards is enough for a 3-minute demo. | Post-hackathon Week 1 |
| Live web search by Skeptic | Adds latency and a failure mode. Skeptic reasons from prompt; we pick demo ideas the model handles well. | v1.5 |
| Re-roast tracker | Needs auth + persistent storage. None of that exists yet. | Post-hackathon Month 1 |
| Investor Mode | Different user flow entirely. | Post-hackathon Month 1 |

See [FEATURES.md](FEATURES.md) for the full tiering. [PHASES.md](PHASES.md) covers what happens after submission.

---

## Risks and mitigations (2-day edition)

| Risk | Mitigation |
| --- | --- |
| `google-adk-agent/agent_system.py` doesn't exist | First task on Day 1, Lane A. Blocking. |
| Gemini latency makes the demo painful | Day 2 mandatory pre-recorded video as fallback |
| One agent's output blows up the JSON schema | Day 2 morning: one-shot retry on parse fail, then degrade gracefully |
| Lane B drowns in integration | Lane A and Lane C help in their afternoon blocks once their own deliverables are done |
| Hackathon WiFi fails | Day 2 video + Day 2 deploy to public URL |
| Someone gets sick | The video from Day 2 midday means the demo can still be presented |
