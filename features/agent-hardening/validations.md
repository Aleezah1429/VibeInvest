# Validations — Agent Hardening

> Each is a manual acceptance test. Tick `[x]` only after observing the named output.

## Prompt registry
- [ ] V1: `python -c "import sys; sys.path.insert(0, 'google-adk-agent'); from prompts import SKEPTIC_INSTRUCTION, MUNSHI_INSTRUCTION, HYPE_INSTRUCTION, CVO_INSTRUCTION; print(len(SKEPTIC_INSTRUCTION))"` runs without error and prints a non-zero length
- [ ] V2: Grep `google-adk-agent/skeptic_agent.py` for `SKEPTIC_INSTRUCTION = "` → returns no match (instruction has moved)
- [ ] V3: Running the pipeline before and after the refactor produces structurally identical reports (same keys, score within ±50 — LLM jitter is fine)

## Utility correctness
- [ ] V4: `async_retry` smoke test (Python REPL): a coroutine that fails twice with `RuntimeError` and succeeds on the 3rd attempt returns successfully under `await async_retry(...)`
- [ ] V5: `estimate_cost_pkr("gemini-2.5-flash", 1_000_000, 500_000)` returns a sensible positive float; `estimate_cost_pkr("unknown-model", ...)` returns 0.0 and logs a warning
- [ ] V6: `extract_token_counts` on a None / partial event returns `(0, 0)` without raising

## Search dedup + ranking
- [ ] V7: A `web_search` query that previously returned 2 duplicate entries (same URL, different query strings) now returns one
- [ ] V8: A `web_search("food delivery Pakistan")` puts at least one `.pk` / Dawn / ProPakistani result in the top 3 when those domains appear in the raw DuckDuckGo results

## Kill_signal end-to-end
- [ ] V9: A weak demo idea (`"App that sells ice to penguins in Karachi"`) produces ≥1 `kill_signal: true` across the three upstream reports (visible in `agent_complete` payloads)
- [ ] V10: Same weak idea: CVO's `final_report.verdict` is `pass` (when ≥2 signals) or at worst `pivot` (when 1 signal) — never `iterate`/`invest`
- [ ] V11: A solid demo idea (`"B2B WhatsApp invoicing for Karachi kiranas"`) produces 0 `kill_signal: true` and CVO's verdict is `iterate` or `invest`
- [ ] V12: Verdict-score consistency holds with the new caps: signals≥2 ⇒ aura<400, signals==1 ⇒ aura<600

## Retry + cost in pipeline_complete
- [ ] V13: `pipeline_complete` payload contains numeric `cost_pkr_estimate`, `tokens_in`, `tokens_out` keys
- [ ] V14: Force a transient Gemini failure (e.g. invalid temporary API key) for one ADK call → the run completes anyway (async_retry absorbs it), no `pipeline_error` emitted
- [ ] V15: Three back-to-back runs leave `app.state.reports` containing exactly 3 entries, all retrievable by their `run_id`

## Export route
- [ ] V16: After a successful run, `curl http://localhost:8000/api/run/<run_id>/export?format=json` returns `application/json` with `Content-Disposition` attachment and a valid FinalReport body
- [ ] V17: Same run, `?format=md` returns `text/markdown` with verdict header + four agent sections in order
- [ ] V18: `curl http://localhost:8000/api/run/deadbeef/export?format=json` returns 404 with `{"detail":"Run not found or evicted"}`
- [ ] V19: After 51 successful runs, the oldest `run_id` returns 404 (ring-buffer evicted)

## Backward compat
- [ ] V20: All Validations V1–V23 from `features/agent-pipeline/validations.md` still pass after this feature ships
- [ ] V21: Frontend boardroom grid renders with no console errors after `agent-types.ts` regenerates (the new fields are optional)
