# todo

Loose live capture during the sprint. Anything that doesn't fit cleanly in a feature spec goes here. Triage daily.

---

## Day 0 (pre-work, tonight)

- [ ] Lane A: get Google AI Studio API key, confirm Gemini 2.5 Flash works through `google-adk` hello-world
- [ ] Lane A: draft system prompts for all 4 agents in a shared doc (Skeptic, Munshi, Hype, CVO)
- [ ] Lane B: skim `api/services/google_adk_runner.py` and `frontend/components/TerminalOutput.tsx` — both get reused heavily
- [ ] Lane C: lock the brand kit (logo concept, 2-color palette, type pair) — 90 min hard cap
- [ ] All: clone repo, install deps, both servers boot locally

## Day 1 priorities (in order)

1. **Unblock everything** → ship `google-adk-agent/agent_system.py` first (Lane A) — see `features/agent-pipeline/`
2. **Launchpad** + **Upload Hub** (Lane B) — see those feature folders
3. **Squad Report** UI scaffold (Lane B) — start with idle 2×2 grid; wire SSE once Lane A is unblocked
4. **Agent avatars + Aura Card design** (Lane C) — hand SVGs to Lane B by midday

## Day 2 priorities

- [ ] Bug fixes from Day 1 integration
- [ ] Aura Audit gauge + flag panels (Lane B)
- [ ] Final Verdict + share buttons + Investor Report PDF (Lane B)
- [ ] Pre-record 90s demo video (Lane C) — **mandatory fallback**
- [ ] Deploy frontend to Vercel, backend to Fly.io / Render
- [ ] Rehearse 3-min demo 5× against stopwatch (all)

## Open questions

- Where does the run state actually live during the demo? `useReducer` in `/run/[id]/page.tsx` or lifted to a context provider? → tentatively: page-level, lift only if needed
- Do we want a "raw SSE log" drawer for debug-curious judges? → maybe — reuse the existing `TerminalOutput.tsx` if so
- Verdict color for "Pivot" — magenta in the design, but might clash with the boardroom background. Lane C to confirm hex.
- Which 3 demo ideas? Confirmed: (1) Chai delivery for LUMS, (2) one clear "Pass" idea, (3) one clear "Invest" idea — Lane C curates by Day 1 EOD.

## Cut list (if we're behind by Day 2 midday)

In order of "drop this first":

1. Handoff arrow animation (just status-pill flip is enough)
2. Aura Card PNG share (only ship the PDF export)
3. Dimension meters (4 small bars under the gauge)
4. Demo idea quick-pick chips on Upload Hub
5. LinkedIn share button (WhatsApp alone is enough for the demo)

## Don't forget

- [ ] CORS allowlist includes the Vercel deploy URL, not just localhost
- [ ] Footer credit "Built with vibes by Team VibeInvest" lands somewhere
- [ ] README quickstart commands actually work on a fresh clone (test it before submission)
- [ ] Submission package: repo URL, deck PDF, demo video, public URL — single Notion / doc link

## After submission (Phase 0.5 — Recovery week)

Spawned features waiting to be spec'd:
- `features/voice-input/`
- `features/pdf-upload/`
- `features/vision-input/`
- `features/urdu-output/`
- `features/persist-reports/`
