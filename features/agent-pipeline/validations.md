# Validations — Agent Pipeline

> Each is a manual acceptance test. Tick `[x]` only after observing it via `curl` or the live UI.

## Smoke test — happy path
- [ ] V1: `curl http://localhost:8000/api/health` → `{"status":"ok"}`
- [ ] V2: `curl -N -X POST http://localhost:8000/api/run/google-adk -H "Content-Type: application/json" -d '{"idea_text":"Chai delivery for LUMS campus"}'` streams events
- [ ] V3: The very first SSE event is `pipeline_start` with the idea text echoed
- [ ] V4: Exactly four `agent_start` events fire, in order: skeptic, munshi, hype, cvo
- [ ] V5: Exactly three `agent_handoff` events fire between the four agents
- [ ] V6: Each `agent_complete` event carries a structured `report` object matching the contract
- [ ] V7: The final event is `pipeline_complete` with a `final_report` containing `aura_score`, `verdict`, `dimensions`, `top_fixes`

## Reproducibility / sanity
- [ ] V8: Run the same idea twice — `aura_score` is within ±50 points across runs (LLM jitter is fine, wild divergence is not)
- [ ] V9: A clearly weak idea ("Chinese food delivery in Karachi but the food is delivered by donkey") scores < 500
- [ ] V10: A reasonable idea ("AI-powered Urdu literacy app for primary schools") scores ≥ 600
- [ ] V11: The CVO names at least one contradiction between agents in `next_steps` when one exists

## JSON contract
- [ ] V12: `final_report.verdict` is one of exactly `invest` / `iterate` / `pivot` / `pass`
- [ ] V13: `final_report.top_fixes.length === 3`
- [ ] V14: Every fix in `top_fixes` starts with a verb (manual check on 3 runs)
- [ ] V15: Each dimension in `dimensions` has `score` (1–10) and `note` (≤ 1 sentence)
- [ ] V16: Verdict-score consistency holds: score in `[0,399]` → `pass`, `[400,599]` → `pivot`, `[600,799]` → `iterate`, `[800,1000]` → `invest`

## Robustness
- [ ] V17: Temporarily corrupt one agent's prompt to force a non-JSON response → the orchestrator retries once, then emits `pipeline_error`
- [ ] V18: Disconnect from the internet mid-run → the runner emits `pipeline_error` cleanly, no crashed worker process
- [ ] V19: Run three pipelines back-to-back → no memory leak, server still responsive

## Performance
- [ ] V20: Each of the three curated demo ideas completes in under 45 seconds end-to-end
- [ ] V21: Time-to-first-event (`pipeline_start` → first `agent_text`) is under 5 seconds

## Module hygiene
- [ ] V22: Grep `api/` for inline prompt strings → none found (all prompts live in `google-adk-agent/agents/`)
- [ ] V23: `python -c "from google_adk_agent.agent_system import researcher_agent, skeptic_agent"` succeeds (legacy and new names both work)
