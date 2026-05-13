# Plan — Agent Hardening

## Goal
Port a small set of battle-tested patterns from [github.com/bassalat/idea-kill-switch](https://github.com/bassalat/idea-kill-switch) into VibeInvest's already-working four-agent boardroom, adapted to our Google ADK + FastAPI + SSE stack. No architectural change — pure additive hardening.

**Phase:** 0 (hackathon MVP — landed on the `kill-switch` branch).

## Why
The Skeptic → Munshi → Hype → CVO pipeline works end-to-end ([features/agent-pipeline/](../agent-pipeline/) R1–R36), but four gaps surfaced when we benchmarked it against the idea-kill-switch reference repo:

1. **Prompts are inline** in each `<name>_agent.py` next to ADK wiring. Hard to diff, hard to A/B test, hard to swap for Urdu/Roman-Urdu variants later. The reference repo's `config/prompts.py` showed the cost of *not* doing this.
2. **No network-level retry.** [google_adk_runner.py:221-254](../../api/services/google_adk_runner.py#L221-L254) retries once on *JSON parse* failure but a transient Gemini 5xx kills the demo with `pipeline_error`.
3. **No cost surface.** Judges asking "what does one run cost?" gets a shrug.
4. **No structured kill-signal from upstream agents to CVO.** CVO has to re-derive "this idea is dead" from free-text `verdict_input` — leading to verdict-score inconsistency in jittery LLM output.
5. **No machine-readable export.** Frontend has `jspdf` for the Aura Card PNG, but there's no Markdown / JSON of the full boardroom session to save or share.

## User stories
- As **Lane A (agents)**, I can edit a Skeptic prompt by opening `google-adk-agent/prompts/skeptic.py` — without touching ADK wiring.
- As **Lane B (full-stack)**, when Gemini blips a 503 mid-run I see the run finish anyway (one silent retry, no `pipeline_error`).
- As a **demo presenter**, my `pipeline_complete` event carries `cost_pkr_estimate` so I can call it out on stage.
- As **the CVO**, I receive `kill_signal: true` / `kill_reason: "..."` from upstream agents and apply deterministic verdict caps (≥2 ⇒ pass, 1 ⇒ pivot ceiling, 0 ⇒ normal scoring).
- As a **judge**, I can `GET /api/run/{run_id}/export?format=md` and download the full session as a single Markdown file.

## Architecture sketch

```
google-adk-agent/
  prompts/                       NEW — centralized prompt registry
    __init__.py                  re-exports the four instruction strings
    skeptic.py                   SKEPTIC_INSTRUCTION = "..."
    munshi.py                    MUNSHI_INSTRUCTION = "..."
    hype.py                      HYPE_INSTRUCTION = "..."
    cvo.py                       CVO_INSTRUCTION = "..." (updated to consume kill_signal)
  util.py                        NEW — async_retry + Gemini cost helpers
  skeptic_agent.py               MODIFIED — imports instruction from prompts/
  munshi_agent.py                MODIFIED — same
  hype_agent.py                  MODIFIED — same
  cvo_agent.py                   MODIFIED — same, plus reads kill_signal
  contracts.py                   MODIFIED — kill_signal/kill_reason on three upstream reports
  tools.py                       MODIFIED — web_search now dedups + Pakistan-ranks

api/
  main.py                        MODIFIED — initialize app.state.reports ring-buffer
  routers/run.py                 MODIFIED — new GET /api/run/{run_id}/export
  services/google_adk_runner.py  MODIFIED — wrap ADK call with async_retry, track tokens, store FinalReport

frontend/
  lib/agent-types.ts             MODIFIED — mirror the optional kill_signal fields

AGENTS.md                        MODIFIED — document kill_signal in each agent's I/O contract
```

## Verdict-cap rules for CVO (kill_signal logic)
- Count `kill_signal: true` across Skeptic/Munshi/Hype reports (max 3, min 0).
- `signals ≥ 2` ⇒ CVO must produce `verdict = "pass"` and `aura_score < 400`.
- `signals == 1` ⇒ CVO must produce `aura_score < 600` (verdict capped at `pivot` or `pass`).
- `signals == 0` ⇒ CVO scores normally per the AGENTS.md bands.

Pipeline still runs all four agents — no early termination. This honors AGENTS.md and features/agent-pipeline/plan.md design.

## Decisions
- **No tenacity dependency.** A 10-line `async_retry` is enough. ROADMAP.md budget is tight; fewer transitive deps.
- **No DB for `/export`.** `app.state.reports: dict[run_id → FinalReport]` ring-buffer capacity 50, lifetime = process lifetime. Matches FEATURES.md "refresh-and-lose is acceptable" for MVP.
- **`kill_signal` is optional with default False.** Backwards compatible — old agent outputs without the field still parse cleanly via Pydantic defaults.
- **Cost is estimated, not authoritative.** Gemini Flash and Pro per-million-token rates are constants in `util.py`. Marked clearly as estimate. Surfaced inside `pipeline_complete` payload (no new SSE event type — preserves the existing event vocabulary).
- **R35 of agent-pipeline evolves.** Old rule: "prompts live in `<name>_agent.py`". New rule: "prompts live in `prompts/<name>.py` and are imported by `<name>_agent.py`" — same intent (no inline in `agent_system.py` or runner), better hygiene. Documented in this plan; not a contract change.

## Out of scope
- Streaming Pydantic validation (still parse the full final_text).
- Persistent storage of runs (Firestore is a Phase 1 concern per FEATURES.md).
- Cost charged in USD or with billing precision.
- Localization of the registered prompts (Phase 0.5 ships Urdu variants).
- Retry strategy beyond ADK invocation (FastAPI middleware-level retries are out of scope).

## Reference
- Source patterns: [github.com/bassalat/idea-kill-switch](https://github.com/bassalat/idea-kill-switch) — particularly `utils/claude_client.py` (retry), `config/prompts.py` (registry), `utils/serper_client.py` (dedup), `utils/exporters.py` (dynamic-section export).
- Plan file: `C:\Users\mahum.fatima\.claude\plans\please-read-the-readme-md-misty-clarke.md` (the original port plan).
