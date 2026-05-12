# Plan — Agent Pipeline

## Goal
Create `google-adk-agent/agent_system.py` (currently missing — this is the **Day 1 blocker**) and wire the four agents — Skeptic → Munshi → Hype → CVO — into the existing `api/services/google_adk_runner.py` orchestrator. The pipeline accepts an idea, runs four agents sequentially, streams SSE events as it goes, and ends with a strict-JSON `final_report` from the CVO.

**Phase:** 0 (hackathon MVP — backend foundation for every other feature).

## User stories
- As Lane B (full-stack), I can `curl -N -X POST .../api/run/google-adk -d '{"idea_text":"..."}'` and see four agents stream SSE events ending in `pipeline_complete`.
- As a frontend, I receive a stable event vocabulary: `pipeline_start`, `agent_start`, `agent_text`, `tool_call`, `tool_result`, `agent_complete`, `agent_handoff`, `pipeline_complete`, `pipeline_error`.
- As the CVO, I can synthesize three upstream JSON reports into a final report with `aura_score`, `verdict`, `dimensions`, and `top_fixes`.
- As a developer debugging on Day 2, when an agent emits malformed JSON, the orchestrator retries once and degrades gracefully on the second failure.

## Architecture sketch

```
google-adk-agent/
  agent_system.py                 Top-level: defines the 4 agents, exports them under both new and legacy names
  contracts.py                    Pydantic models for SkepticReport, MunshiReport, HypeReport, FinalReport
  agents/
    skeptic_agent.py              System prompt + tool wiring for Skeptic
    munshi_agent.py               System prompt + tool wiring for Munshi
    hype_agent.py                 System prompt + tool wiring for Hype
    cvo_agent.py                  System prompt + tool wiring for CVO (no tools)
  tools/
    web_search.py                 Skeptic + Munshi tool
    calculate.py                  Munshi tool
  .env                            GOOGLE_API_KEY, ALLOWED_ORIGINS

api/services/
  google_adk_runner.py            (existing) — imports agents from agent_system, runs the pipeline, emits SSE
```

The runner at `api/services/google_adk_runner.py:118` already does the orchestration plumbing — keep it. Only the agent definitions and prompts change.

## Alias map (so the runner keeps working without edits)

```python
# google-adk-agent/agent_system.py
from .agents.skeptic_agent import skeptic_agent as researcher_agent  # legacy alias
from .agents.munshi_agent import munshi_agent as analyzer_agent      # legacy alias
from .agents.hype_agent import hype_agent as writer_agent            # legacy alias
from .agents.cvo_agent import cvo_agent as qa_agent                  # legacy alias

# New names (preferred going forward)
from .agents.skeptic_agent import skeptic_agent
from .agents.munshi_agent import munshi_agent
from .agents.hype_agent import hype_agent
from .agents.cvo_agent import cvo_agent
```

## SSE event contract (the load-bearing part)

```ts
type SSEEvent =
  | { type: "pipeline_start"; run_id: string; idea_text: string }
  | { type: "agent_start"; agent: "skeptic" | "munshi" | "hype" | "cvo"; message?: string }
  | { type: "agent_text"; agent: AgentName; delta: string }              // streaming text
  | { type: "tool_call"; agent: AgentName; tool: string; args: object }
  | { type: "tool_result"; agent: AgentName; tool: string; result: any }
  | { type: "agent_complete"; agent: AgentName; report: object }         // structured output
  | { type: "agent_handoff"; from: AgentName; to: AgentName }
  | { type: "pipeline_complete"; final_report: FinalReport }
  | { type: "pipeline_error"; agent?: AgentName; error: string }
```

This contract is mirrored in `frontend/lib/agent-types.ts`. Both files change together when the contract evolves.

## Decisions
- **Strict JSON output, one-shot retry.** If an agent returns text that doesn't parse, the orchestrator sends a "your previous response was not valid JSON, here it is, fix it" follow-up. After one retry, fail the run with `pipeline_error`.
- **No web search in Phase 0 — optional.** Lane A's call. If `web_search` works on Gemini Flash within 30 minutes of trying, ship it. If not, the Skeptic reasons from prompt and we pick demo ideas the model handles well (per ROADMAP.md "What we cut").
- **CVO uses Gemini 2.5 Pro; the other three use Flash.** Cost/quality split.
- **No parallel execution.** Agents run strictly sequentially — the Munshi needs the Skeptic's report, the Hype needs both, the CVO needs all three.

## Out of scope (Phase 0)
- Voice / image / PDF preprocessing (handled separately in Phase 0.5 upload-hub extensions)
- Urdu output (Phase 0.5)
- Persistent run storage (Phase 1 — runs are ephemeral, in-memory only)
- Real competitor dataset for the Skeptic (Phase 2)
- Specialist agents — Legal, Tech, HR (Phase 3+)
