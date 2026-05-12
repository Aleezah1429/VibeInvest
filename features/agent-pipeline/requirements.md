# Requirements — Agent Pipeline

> Tick `[x]` as each ships. All must pass before merging.
> **This is the Day 1 blocker.** Nothing else in Phase 0 ships until R1–R8 are done.

## Module structure
- [ ] R1: `google-adk-agent/agent_system.py` exists and is importable from `api/services/google_adk_runner.py` without changes to the runner
- [ ] R2: Legacy aliases exported: `researcher_agent`, `analyzer_agent`, `writer_agent`, `qa_agent`
- [ ] R3: New names exported: `skeptic_agent`, `munshi_agent`, `hype_agent`, `cvo_agent`
- [ ] R4: `google-adk-agent/contracts.py` exports Pydantic models: `SkepticReport`, `MunshiReport`, `HypeReport`, `FinalReport`
- [ ] R5: `google-adk-agent/.env` contains `GOOGLE_API_KEY` and `ALLOWED_ORIGINS`

## Agents — Skeptic
- [ ] R6: `skeptic_agent` uses **Gemini 2.5 Flash**
- [ ] R7: System prompt matches [AGENTS.md § Agent 1](../../AGENTS.md) (working draft acceptable)
- [ ] R8: Returns JSON matching `SkepticReport`: `competitors`, `market_saturation_score`, `differentiation`, `red_flags`, `verdict_input`
- [ ] R9: `web_search` tool wired (or explicitly skipped per plan.md decision — document in code comment)

## Agents — Munshi
- [ ] R10: `munshi_agent` uses **Gemini 2.5 Flash**
- [ ] R11: System prompt matches [AGENTS.md § Agent 2](../../AGENTS.md)
- [ ] R12: Receives `skeptic_report` as upstream context
- [ ] R13: Returns JSON matching `MunshiReport`: `unit_economics`, `burn_rate_pkr_per_month`, `realistic_year_1_revenue_pkr`, `break_even_months`, `financial_red_flags`, `verdict_input`
- [ ] R14: `calculate` tool wired

## Agents — Hype
- [ ] R15: `hype_agent` uses **Gemini 2.5 Flash**
- [ ] R16: System prompt matches [AGENTS.md § Agent 3](../../AGENTS.md)
- [ ] R17: Receives both `skeptic_report` and `munshi_report` as upstream context
- [ ] R18: Returns JSON matching `HypeReport`: `taglines` (exactly 3), `brand_vibe`, `pitch_deck_fixes` (exactly 3), `soft_launch_strategy`, `verdict_input`

## Agents — CVO
- [ ] R19: `cvo_agent` uses **Gemini 2.5 Pro**
- [ ] R20: System prompt matches [AGENTS.md § Agent 4](../../AGENTS.md)
- [ ] R21: Receives all three upstream reports as context
- [ ] R22: Has no tools (synthesis only)
- [ ] R23: Returns JSON matching `FinalReport`: `aura_score` (0–1000), `verdict` (one of `invest`/`iterate`/`pivot`/`pass`), `verdict_line`, `dimensions` (market/money/brand/strategy, each `score`+`note`), `top_fixes` (exactly 3, each starts with a verb), `next_steps`
- [ ] R24: Verdict-to-score mapping enforced: `pass` < 400, `pivot` 400–599, `iterate` 600–799, `invest` ≥ 800

## SSE contract
- [ ] R25: Emits `pipeline_start` first, with `run_id` and `idea_text`
- [ ] R26: Emits `agent_start` before each agent, `agent_complete` after, with the agent's structured report
- [ ] R27: Emits `agent_handoff` between agents
- [ ] R28: Emits `pipeline_complete` last, with the full `final_report`
- [ ] R29: On any unrecoverable failure, emits `pipeline_error` and closes the stream cleanly

## Robustness
- [ ] R30: On JSON parse failure from any agent, the orchestrator retries that agent once with the malformed output and a fix-it instruction
- [ ] R31: After one retry, gives up and emits `pipeline_error` with `agent` set
- [ ] R32: Total pipeline latency < 45 seconds for the three curated demo ideas (Phase 0 target)

## Wiring sanity
- [ ] R33: `api/services/google_adk_runner.py` imports work without modification
- [ ] R34: `curl -N -X POST http://localhost:8000/api/run/google-adk -d '{"idea_text":"chai delivery LUMS"}'` streams events end-to-end

## Non-functional
- [ ] R35: All agent prompts live in their own `agents/<name>.py` file — no inline prompts in `agent_system.py` or the runner
- [ ] R36: No hard-coded `GOOGLE_API_KEY` — always from `.env`
