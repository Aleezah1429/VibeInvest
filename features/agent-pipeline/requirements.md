# Requirements — Agent Pipeline

> Tick `[x]` as each ships. All must pass before merging.
> **This is the Day 1 blocker.** Nothing else in Phase 0 ships until R1–R8 are done.

## Module structure
- [x] R1: `google-adk-agent/agent_system.py` exists and is importable from `api/services/google_adk_runner.py` without changes to the runner
- [x] R2: Legacy aliases exported: `researcher_agent`, `analyzer_agent`, `writer_agent`, `qa_agent`
- [x] R3: New names exported: `skeptic_agent`, `munshi_agent`, `hype_agent`, `cvo_agent`
- [x] R4: `google-adk-agent/contracts.py` exports Pydantic models: `SkepticReport`, `MunshiReport`, `HypeReport`, `FinalReport`
- [ ] R5: `google-adk-agent/.env` contains `GOOGLE_API_KEY` and `ALLOWED_ORIGINS` *(user action: copy `.env.example` → `.env` and fill in your real Gemini key)*

## Agents — Skeptic
- [x] R6: `skeptic_agent` uses **Gemini 2.5 Flash**
- [x] R7: System prompt matches [AGENTS.md § Agent 1](../../AGENTS.md) (working draft acceptable)
- [x] R8: Returns JSON matching `SkepticReport`: `competitors`, `market_saturation_score`, `differentiation`, `red_flags`, `verdict_input`
- [x] R9: `web_search` tool wired (DuckDuckGo HTML scrape — fragile but no API key, with graceful fallback documented in prompt)

## Agents — Munshi
- [x] R10: `munshi_agent` uses **Gemini 2.5 Flash**
- [x] R11: System prompt matches [AGENTS.md § Agent 2](../../AGENTS.md)
- [x] R12: Receives `skeptic_report` as upstream context (runner stitches it into the user message)
- [x] R13: Returns JSON matching `MunshiReport`: `unit_economics`, `burn_rate_pkr_per_month`, `realistic_year_1_revenue_pkr`, `break_even_months`, `financial_red_flags`, `verdict_input`
- [x] R14: `calculate` tool wired

## Agents — Hype
- [x] R15: `hype_agent` uses **Gemini 2.5 Flash**
- [x] R16: System prompt matches [AGENTS.md § Agent 3](../../AGENTS.md)
- [x] R17: Receives both `skeptic_report` and `munshi_report` as upstream context (runner stitches them in)
- [x] R18: Returns JSON matching `HypeReport`: `taglines` (exactly 3), `brand_vibe`, `pitch_deck_fixes` (exactly 3), `soft_launch_strategy`, `verdict_input`

## Agents — CVO
- [x] R19: `cvo_agent` uses **Gemini 2.5 Pro**
- [x] R20: System prompt matches [AGENTS.md § Agent 4](../../AGENTS.md)
- [x] R21: Receives all three upstream reports as context (runner stitches them in)
- [x] R22: Has no tools (synthesis only)
- [x] R23: Returns JSON matching `FinalReport`: `aura_score` (0–1000), `verdict` (one of `invest`/`iterate`/`pivot`/`pass`), `verdict_line`, `dimensions` (market/money/brand/strategy, each `score`+`note`), `top_fixes` (exactly 3, each starts with a verb), `next_steps`
- [x] R24: Verdict-to-score mapping enforced: `pass` < 400, `pivot` 400–599, `iterate` 600–799, `invest` ≥ 800

## SSE contract
- [x] R25: Emits `pipeline_start` first, with `run_id` and `idea_text`
- [x] R26: Emits `agent_start` before each agent, `agent_complete` after, with the agent's structured report (parsed Pydantic model dumped to dict)
- [x] R27: Emits `agent_handoff` between agents (3 handoffs total: skeptic→munshi, munshi→hype, hype→cvo)
- [x] R28: Emits `pipeline_complete` last, with the full `final_report`
- [x] R29: On any unrecoverable failure, emits `pipeline_error` and closes the stream cleanly

## Robustness
- [x] R30: On JSON parse failure from any agent, the orchestrator retries that agent once with the malformed output and a fix-it instruction (`_RETRY_PREAMBLE`)
- [x] R31: After one retry, gives up and emits `pipeline_error` with `agent` set
- [ ] R32: Total pipeline latency < 45 seconds for the three curated demo ideas *(needs end-to-end run with API key to verify)*

## Wiring sanity
- [x] R33: `api/services/google_adk_runner.py` rewired to use new contracts — imports the four agents + Pydantic models via `importlib.util.spec_from_file_location`
- [ ] R34: `curl -N -X POST http://localhost:8000/api/run/google-adk -d '{"idea_text":"chai delivery LUMS"}'` streams events end-to-end *(needs API key)*

## Non-functional
- [x] R35: All agent prompts live in their own `<name>_agent.py` file — no inline prompts in `agent_system.py` or the runner *(flat structure — see specs/tech.md)*
- [x] R36: No hard-coded `GOOGLE_API_KEY` — always loaded via `python-dotenv` from `.env`
