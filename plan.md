# Plan: Port reusable patterns from idea-kill-switch into VibeInvest

## Context

VibeInvest's four-agent boardroom pipeline (Skeptic → Munshi → Hype → CVO) is already implemented end-to-end on Google ADK with Pydantic contracts, SSE streaming, and a Next.js frontend. See [google-adk-agent/](d:/VibeInvest/google-adk-agent/) and [api/services/google_adk_runner.py](d:/VibeInvest/api/services/google_adk_runner.py).

The reference repo [github.com/bassalat/idea-kill-switch](https://github.com/bassalat/idea-kill-switch) is a *conceptually similar* validation pipeline (4 sequential stages: pain research → market analysis → content generation → survey analysis) built on Streamlit + Claude + Serper. It is structurally different (Streamlit session state, synchronous calls, no Pydantic, function-oriented stages) but contains a handful of **patterns** that would harden VibeInvest without expanding scope.

This plan ports those patterns *adapted* — not copied — while honoring:
- WORKFLOW.md:97 "agent contracts only change when all three lanes agree"
- FEATURES.md MVP scope (F2-F4, F6) — no voice, OCR, persistence
- ROADMAP.md 2-day budget — additive utilities only, no architectural rework

## What's already covered (do NOT re-port)

| idea-kill-switch pattern | Already present in VibeInvest |
| --- | --- |
| 4-stage sequential pipeline | [google_adk_runner.py:306-396](d:/VibeInvest/api/services/google_adk_runner.py#L306-L396) |
| Pydantic-style structured outputs | [contracts.py](d:/VibeInvest/google-adk-agent/contracts.py) (better than their plain dicts) |
| Web search tool wiring | [tools.py:21-62](d:/VibeInvest/google-adk-agent/tools.py#L21-L62) |
| One-shot JSON retry | [google_adk_runner.py:221-254](d:/VibeInvest/api/services/google_adk_runner.py#L221-L254) |
| Progress callbacks | SSE event stream (better than their `progress_callback`) |
| Multi-format export | Frontend `jspdf` already produces Aura Card PNG |

## Patterns worth porting (adapted)

### 1. Centralized prompt registry (low risk, high reuse)
**Their pattern:** `config/prompts.py` — single module with all stage prompts as named strings.
**Our gap:** Prompts are inline in each agent file (`SKEPTIC_INSTRUCTION` in skeptic_agent.py, etc.). Hard to diff, hard to A/B test, mixed concern with agent wiring.
**Port as:** New directory `google-adk-agent/prompts/` with one file per agent (`skeptic.py`, `munshi.py`, `hype.py`, `cvo.py`) plus `__init__.py` exporting them. Each agent file imports its instruction from the registry. No contract change. No behavior change.

### 2. Retry-with-backoff utility (low risk, additive)
**Their pattern:** `@retry` decorator on Claude calls in [utils/claude_client.py](https://github.com/bassalat/idea-kill-switch/blob/main/utils/claude_client.py) (tenacity-based).
**Our gap:** `_run_and_parse` retries once with a fix-it message but doesn't retry on *network* failure (timeouts, 5xx).
**Port as:** A lightweight `async_retry(fn, attempts=3, backoff=2.0)` helper in a new `google-adk-agent/util.py`. No external dep — tenacity is overkill. Wrap the ADK runner call inside `_run_agent_streaming` so transient Gemini failures don't kill the demo.

### 3. Cost / token tracking (low risk, demo-impactful)
**Their pattern:** `st.session_state.api_costs += cost` after each Claude call.
**Our gap:** No cost surface anywhere. Judges asking "what does a run cost?" gets a shrug.
**Port as:** Per-run accumulator in `google_adk_runner.run_pipeline`. Emit a new SSE event `pipeline_cost` (or fold cost into `pipeline_complete`) with input/output token counts and an estimated PKR cost. Token counts are already on the ADK response object.

### 4. Source quality scoring + dedup for `web_search` (low risk)
**Their pattern:** [utils/serper_client.py](https://github.com/bassalat/idea-kill-switch) `_deduplicate_results()` + `_score_by_domain()` (Reddit/Quora ranked higher for pain signals).
**Our gap:** [tools.py:21-62](d:/VibeInvest/google-adk-agent/tools.py#L21-L62) returns the first 5 DuckDuckGo hits with no dedup, no scoring. Skeptic competitor lists sometimes repeat.
**Port as:** In `tools.py`, dedup by canonicalized URL, prefer Pakistan-relevant domains (.pk, dawn.com, propakistani, tribune, lums/iba/comsats blogs) for the Skeptic. Pure utility — no contract change.

### 5. Threshold-aware "kill signals" (CONFIRMED in scope)
**Their pattern:** Every stage returns `{"kill_decision": bool, "reasoning": str}` driven by configurable thresholds. Pipeline can short-circuit.
**Our gap:** No structured way for an upstream agent to telegraph "this idea is dead" to CVO. CVO has to re-derive it from free-text `verdict_input`.
**Port as:** Add two **optional** fields to `SkepticReport`, `MunshiReport`, `HypeReport`:
```python
kill_signal: bool = False           # this agent thinks the idea is non-viable
kill_reason: str | None = None      # one sentence, used by CVO
```
CVO prompt updated to count kill_signals deterministically:
- ≥2 signals ⇒ verdict capped at `pass` (aura_score < 400)
- 1 signal ⇒ verdict capped at `pivot` (aura_score < 600)
- 0 signals ⇒ CVO scores normally per AGENTS.md verdict bands
**Pipeline still runs all four agents** — no early termination — matching AGENTS.md design intent. Frontend `agent-types.ts` mirrors the new fields.

### 6. Multi-format report export (CONFIRMED in scope)
**Their pattern:** `utils/exporters.py` produces PDF / CSV / JSON dynamically, skipping missing sections.
**Our gap:** Frontend does Aura Card PNG via `jspdf`, but there's no downloadable JSON / Markdown of the full report (useful for judges and for "save my roast" deeplinks).
**Port as:** Add `GET /api/run/{run_id}/export?format=json|md` to FastAPI. Markdown template renders all four reports + CVO synthesis with dynamic-section skip if any agent failed. In-memory `app.state.reports: dict[str, FinalReport]` keyed by run_id, capped at last N (e.g. 50) — no DB, no persistence beyond process lifetime, matches FEATURES.md "refresh-and-lose is acceptable."

## Explicitly NOT porting

- **Streamlit session state** — wrong model for FastAPI + SSE.
- **Tenacity dependency** — five-line custom helper is enough.
- **Firecrawl deep scraping** — expensive, out of MVP scope.
- **ReportLab PDF** — `jspdf` already in frontend stack.
- **Their threshold values** — Pakistan-specific economics differ from US SaaS pain scoring.
- **Their kill-decision *as early termination*** — conflicts with AGENTS.md "all four run, CVO decides."

## Spec-driven housing for this work

Per WORKFLOW.md, this lands as a single new feature folder:

```
features/agent-hardening/
  plan.md            Design: why each port, what stays unchanged, contract-change rationale
  requirements.md    R1..R~20 checklist — one R per port + one per file touched + contract delta
  validations.md     V1..V~12 observable tests (SSE events present, prompts importable,
                     kill_signal flows end-to-end, /export returns 200, retry absorbs blip)
```

R-numbers continue from a fresh R1 (per WORKFLOW.md convention — each feature owns its own R-namespace).

## Files to be added or modified

**New:**
- `features/agent-hardening/plan.md`
- `features/agent-hardening/requirements.md`
- `features/agent-hardening/validations.md`
- `google-adk-agent/prompts/__init__.py`
- `google-adk-agent/prompts/skeptic.py`
- `google-adk-agent/prompts/munshi.py`
- `google-adk-agent/prompts/hype.py`
- `google-adk-agent/prompts/cvo.py`
- `google-adk-agent/util.py` (retry + cost helpers)

**Modified:**
- `google-adk-agent/skeptic_agent.py` — import instruction from registry
- `google-adk-agent/munshi_agent.py` — same
- `google-adk-agent/hype_agent.py` — same
- `google-adk-agent/cvo_agent.py` — registry import + synthesis prompt updated to consume `kill_signal` (verdict-cap rules in §5)
- `google-adk-agent/contracts.py` — optional `kill_signal: bool = False` and `kill_reason: str | None = None` on `SkepticReport`, `MunshiReport`, `HypeReport`
- `google-adk-agent/tools.py` — URL-canonicalized dedup + Pakistan-favored domain ranking inside `web_search`
- `api/services/google_adk_runner.py` — wrap ADK invocation with `async_retry`; accumulate `tokens_in`/`tokens_out`; emit cost (PKR estimate using Gemini Flash + Pro rate constants) inside `pipeline_complete`; store `FinalReport` in `app.state.reports` for export route
- `api/routers/run.py` — new `GET /api/run/{run_id}/export?format=json|md`
- `api/main.py` — initialize `app.state.reports` ring-buffer (capacity 50)
- `frontend/lib/agent-types.ts` — mirror new optional fields on the three reports
- `AGENTS.md` — document the new `kill_signal` / `kill_reason` fields in each agent's I/O contract section so the contract-of-record stays the source of truth

## Execution order

Within `features/agent-hardening/requirements.md`, ship in this order so each step is independently verifiable:

1. **Prompt registry** (pure refactor — no behavior change; run pipeline before/after, expect identical reports)
2. **`util.py` (async_retry + token-accounting helpers)** — landed but unused yet, unit-callable
3. **Tools cleanup** (web_search dedup + ranking) — touchable independently
4. **Contract additions** (`kill_signal`, `kill_reason`) + frontend mirror — synchronized commit
5. **CVO prompt update** to consume `kill_signal` with the verdict-cap rules
6. **Runner integration** — retry wrap + cost accumulation + `app.state.reports` storage
7. **Export route** — last, depends on (6)

Steps 1–3 are mergeable any time; steps 4–7 are a tight coupling and should ship together to avoid an in-between state where contracts have the field but no one reads it.

## Verification

End-to-end smoke (replicates ROADMAP.md Day 1 finish line):

```bash
curl http://localhost:8000/api/health
curl -N -X POST http://localhost:8000/api/run/google-adk \
  -H "Content-Type: application/json" \
  -d '{"idea_text":"Chai delivery for LUMS campus","output_language":"en"}'
```

Pass criteria:
1. `pipeline_start` → 4× `agent_start`/`agent_complete` → 3× `agent_handoff` → `pipeline_complete` (matches features/agent-pipeline/validations.md V1-V10).
2. `pipeline_complete` payload now contains `cost_pkr_estimate` and `tokens_in` / `tokens_out`.
3. A weak idea (`"App that sells ice to penguins"`) produces ≥1 `kill_signal: true` and CVO verdict in `pass` or `pivot` bucket.
4. A solid idea (`"B2B WhatsApp invoicing for Karachi kiranas"`) produces 0 kill_signals, verdict ≥ `iterate`.
5. Network blip mid-run (kill DNS for 1s) is absorbed by `async_retry`, not surfaced as `pipeline_error`.
6. `from google_adk_agent.prompts import SKEPTIC_INSTRUCTION` works from both root and `api/` cwd (mirrors features/agent-pipeline/validations.md V23).
7. Frontend boardroom grid still renders with no console errors after `agent-types.ts` regenerates.

