# Requirements — Agent Hardening

> Tick `[x]` as each ships. The order matters: R1–R5 are safe refactors; R6–R10 add new utilities; R11–R17 are the synchronized contract+CVO+frontend change; R18–R20 ship the export route last.

## Prompt registry (Step 1 — pure refactor, zero behavior change)
- [x] R1: `google-adk-agent/prompts/` directory exists with `__init__.py`
- [x] R2: `prompts/skeptic.py`, `prompts/munshi.py`, `prompts/hype.py`, `prompts/cvo.py` each export the corresponding `*_INSTRUCTION` string
- [x] R3: `__init__.py` re-exports all four under canonical names: `SKEPTIC_INSTRUCTION`, `MUNSHI_INSTRUCTION`, `HYPE_INSTRUCTION`, `CVO_INSTRUCTION`
- [x] R4: Each `<name>_agent.py` imports its instruction from `prompts` and no longer defines it inline
- [x] R5: After this step, `python -c "from prompts import SKEPTIC_INSTRUCTION"` works from inside `google-adk-agent/`

## Utilities (Step 2)
- [x] R6: `google-adk-agent/util.py` exports `async_retry(coro_fn, *, attempts=3, base_delay=1.0)` — exponential backoff, only retries on `Exception` (not `BaseException`), no external dep
- [x] R7: `util.py` exports `estimate_cost_pkr(model: str, tokens_in: int, tokens_out: int) -> float` with documented per-million-token rates for `gemini-2.5-flash` and `gemini-2.5-pro`
- [x] R8: `util.py` exports `extract_token_counts(adk_event) -> tuple[int, int]` returning `(tokens_in, tokens_out)` — safely returns `(0, 0)` if ADK event has no usage_metadata

## Tools cleanup (Step 3)
- [x] R9: `tools.web_search` dedups results by canonicalized URL (strip query string + trailing slash + lowercase host) before returning
- [x] R10: `tools.web_search` ranks Pakistan-relevant domains higher — `.pk` TLD, `dawn.com`, `propakistani.pk`, `tribune.com.pk`, `dawn.com`, `geo.tv`, `arynews.tv`, university blogs (`lums.edu.pk`, `nu.edu.pk`, `iba.edu.pk`) — without dropping non-PK results

## Contract additions (Step 4 — load-bearing, synchronize with R15)
- [x] R11: `contracts.SkepticReport` gains `kill_signal: bool = False` and `kill_reason: str | None = None`
- [x] R12: `contracts.MunshiReport` gains the same two optional fields
- [x] R13: `contracts.HypeReport` gains the same two optional fields
- [x] R14: `contracts.FinalReport` is unchanged (CVO consumes signals; doesn't re-emit them)
- [x] R15: `frontend/lib/agent-types.ts` mirrors R11–R13 with `kill_signal?: boolean; kill_reason?: string | null;` on the three upstream report interfaces

## CVO synthesis (Step 5)
- [x] R16: `prompts/cvo.py` instruction explicitly handles the three kill_signal cases (0/1/≥2) with verdict caps documented in [plan.md](plan.md#verdict-cap-rules-for-cvo-kill_signal-logic)
- [x] R17: Each of `prompts/skeptic.py`, `prompts/munshi.py`, `prompts/hype.py` instructs the agent to set `kill_signal: true` only on a defined, hard-fail condition (saturation_score == 10, gross_margin_pct < 0 for ≥6 months, etc.) — not on soft pessimism

## Runner integration (Step 6)
- [x] R18: `google_adk_runner._run_agent_streaming` calls into ADK wrapped by `async_retry(attempts=3)` so transient failures don't surface as `pipeline_error`
- [x] R19: `run_pipeline` accumulates `tokens_in` / `tokens_out` per agent and adds `cost_pkr_estimate`, `tokens_in`, `tokens_out` keys inside the `pipeline_complete` payload (no new event type)
- [x] R20: After `pipeline_complete` emits, the orchestrator stores `final_report` (Pydantic model) into `app.state.reports[run_id]` — ring-buffer capacity 50, oldest evicted

## Export route (Step 7)
- [x] R21: `api/main.py` initializes `app.state.reports = collections.OrderedDict()` on startup
- [x] R22: `GET /api/run/{run_id}/export?format=json` returns the stored `FinalReport` JSON with `Content-Disposition: attachment; filename="vibeinvest-<run_id>.json"`
- [x] R23: `GET /api/run/{run_id}/export?format=md` renders a Markdown report (verdict + aura score + four sections, dynamic-skip if any agent didn't run) and serves it as `text/markdown` with `Content-Disposition`
- [x] R24: Unknown `run_id` → 404 with `{"detail": "Run not found or evicted"}`

## Documentation
- [x] R25: `AGENTS.md` Agent 1/2/3 sections document the new optional `kill_signal` and `kill_reason` fields in their output contracts
- [x] R26: `AGENTS.md` Agent 4 section documents the verdict-cap rules CVO applies given upstream kill_signals
