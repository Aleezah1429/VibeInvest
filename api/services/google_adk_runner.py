"""VibeInvest agent pipeline runner.

Wires the four ADK agents (Skeptic → Munshi → Hype → CVO) into an async
generator that yields VibeInvest SSE events. Each agent's free-text response
is parsed against its Pydantic contract; on parse failure we retry once with
a fix-it instruction, then emit `pipeline_error` and bail.

# Event contract — mirror of frontend/lib/agent-types.ts
- pipeline_start   { run_id, idea_text }
- agent_start      { agent }
- agent_text       { agent, delta }
- tool_call        { agent, tool, args }
- tool_result      { agent, tool, result }
- agent_complete   { agent, report }       <-- structured (parsed Pydantic model)
- agent_handoff    { from, to }
- pipeline_complete { final_report, tokens_in, tokens_out, cost_pkr_estimate }
- pipeline_error   { agent?, error }
"""
from __future__ import annotations

import asyncio
import importlib.util
import json
import logging
import re
import uuid
from pathlib import Path
from typing import Any, AsyncGenerator, Type

from pydantic import BaseModel, ValidationError


log = logging.getLogger(__name__)


# ── Load the agent system (hyphenated dir, so use spec_from_file_location) ──
_AGENT_DIR = Path(__file__).parent.parent.parent / "google-adk-agent"

_sys_spec = importlib.util.spec_from_file_location(
    "google_adk_agent_system", str(_AGENT_DIR / "agent_system.py")
)
_sys_mod = importlib.util.module_from_spec(_sys_spec)
_sys_spec.loader.exec_module(_sys_mod)

skeptic_agent = _sys_mod.skeptic_agent
munshi_agent = _sys_mod.munshi_agent
hype_agent = _sys_mod.hype_agent
cvo_agent = _sys_mod.cvo_agent

# Legacy aliases (still exported for backward compat; not used in this runner)
researcher_agent = _sys_mod.researcher_agent
analyzer_agent = _sys_mod.analyzer_agent
writer_agent = _sys_mod.writer_agent
qa_agent = _sys_mod.qa_agent

# Load env from the agent dir's .env
_sys_mod.load_env(env_path=str(_AGENT_DIR / ".env"))

# Load the Pydantic contracts the same way (sibling file to agent_system.py).
_contracts_spec = importlib.util.spec_from_file_location(
    "google_adk_contracts", str(_AGENT_DIR / "contracts.py")
)
_contracts_mod = importlib.util.module_from_spec(_contracts_spec)
_contracts_spec.loader.exec_module(_contracts_mod)

SkepticReport = _contracts_mod.SkepticReport
MunshiReport = _contracts_mod.MunshiReport
HypeReport = _contracts_mod.HypeReport
FinalReport = _contracts_mod.FinalReport

# Load shared utilities (retry, cost, token extraction).
_util_spec = importlib.util.spec_from_file_location(
    "google_adk_util", str(_AGENT_DIR / "util.py")
)
_util_mod = importlib.util.module_from_spec(_util_spec)
_util_spec.loader.exec_module(_util_mod)

estimate_cost_pkr = _util_mod.estimate_cost_pkr
extract_token_counts = _util_mod.extract_token_counts


# Model attribution for the four agents (used for cost estimation).
_AGENT_MODELS = {
    "skeptic": "gemini-2.5-flash",
    "munshi":  "gemini-2.5-flash",
    "hype":    "gemini-2.5-flash",
    "cvo":     "gemini-2.5-pro",
}


# ── JSON parsing helpers ────────────────────────────────────────────────────


_JSON_FENCE = re.compile(r"```(?:json)?\s*(\{.*?\})\s*```", re.DOTALL)
_FIRST_OBJECT = re.compile(r"\{.*\}", re.DOTALL)


def _extract_json(text: str) -> str | None:
    """Pull a JSON object out of an agent's raw text response.

    Agents are instructed to return strict JSON with no fences, but defensive
    extraction handles the case where a fenced block sneaks in.
    """
    if not text:
        return None
    fenced = _JSON_FENCE.search(text)
    if fenced:
        return fenced.group(1)
    obj = _FIRST_OBJECT.search(text)
    if obj:
        return obj.group(0)
    return None


def _parse(text: str, model: Type[BaseModel]) -> BaseModel | None:
    """Try to parse and validate `text` as `model`. Return None on any failure."""
    raw = _extract_json(text)
    if raw is None:
        return None
    try:
        data = json.loads(raw)
    except json.JSONDecodeError:
        return None
    try:
        return model.model_validate(data)
    except ValidationError:
        return None


# ── ADK agent streaming ─────────────────────────────────────────────────────


async def _stream_agent_once(
    agent_name: str,
    agent: Any,
    input_text: str,
    out_queue: asyncio.Queue,
) -> tuple[str, int, int]:
    """Single ADK streaming pass.

    Returns (final_text, tokens_in, tokens_out). Raises on any failure — the
    caller's retry wrapper decides whether to try again.
    """
    from google.adk.runners import Runner as ADKRunner
    from google.adk.sessions import InMemorySessionService
    from google.genai import types

    session_service = InMemorySessionService()
    runner = ADKRunner(
        agent=agent,
        app_name="vibeinvest_boardroom",
        session_service=session_service,
    )
    session = await session_service.create_session(
        app_name="vibeinvest_boardroom", user_id="boardroom_user"
    )

    content = types.Content(role="user", parts=[types.Part(text=input_text)])

    final_text = ""
    tokens_in = 0
    tokens_out = 0

    async for event in runner.run_async(
        user_id="boardroom_user",
        session_id=session.id,
        new_message=content,
    ):
        # Track cumulative token usage — ADK usually puts the running total on
        # each event's usage_metadata, so we take the max across the stream.
        ti, to = extract_token_counts(event)
        tokens_in = max(tokens_in, ti)
        tokens_out = max(tokens_out, to)

        # Tool calls
        actions = getattr(event, "actions", None)
        if actions:
            tool_calls = getattr(actions, "tool_calls", None) or []
            for tc in tool_calls:
                fn_name = (
                    getattr(tc, "name", None)
                    or getattr(tc, "function_name", "unknown")
                )
                fn_args = getattr(tc, "args", None) or getattr(tc, "arguments", {})
                await out_queue.put(
                    {
                        "type": "tool_call",
                        "agent": agent_name,
                        "tool": fn_name,
                        "args": fn_args if isinstance(fn_args, dict) else {"raw": str(fn_args)[:300]},
                    }
                )

        # Tool results + streaming text parts
        if event.content and event.content.parts:
            for part in event.content.parts:
                if getattr(part, "function_response", None):
                    fr = part.function_response
                    result = getattr(fr, "response", None)
                    await out_queue.put(
                        {
                            "type": "tool_result",
                            "agent": agent_name,
                            "tool": getattr(fr, "name", "unknown"),
                            "result": result if isinstance(result, (dict, list, str, int, float, bool)) else str(result)[:500],
                        }
                    )
                elif getattr(part, "text", None) and not event.is_final_response():
                    await out_queue.put(
                        {
                            "type": "agent_text",
                            "agent": agent_name,
                            "delta": part.text,
                        }
                    )

        if event.is_final_response() and event.content and event.content.parts:
            final_text = "".join(
                p.text for p in event.content.parts if getattr(p, "text", None)
            )

    return final_text, tokens_in, tokens_out


async def _stream_agent_with_retry(
    agent_name: str,
    agent: Any,
    input_text: str,
    out_queue: asyncio.Queue,
    attempts: int = 3,
    base_delay: float = 1.0,
) -> tuple[str, int, int]:
    """Run `_stream_agent_once` with exponential-backoff retry on Exception.

    Happy-path (attempt 1 succeeds) streams events live to `out_queue`. If
    attempt 1 fails, attempts 2..N stream into a discard queue so the
    frontend doesn't see duplicate agent_text deltas — it just sees a brief
    pause before the eventual agent_complete.

    The final exception propagates if all attempts exhaust, so the
    orchestrator can emit `pipeline_error`.
    """
    last_exc: Exception | None = None
    delay = base_delay
    for attempt in range(1, attempts + 1):
        target = out_queue if attempt == 1 else asyncio.Queue()
        try:
            return await _stream_agent_once(agent_name, agent, input_text, target)
        except Exception as exc:
            last_exc = exc
            log.warning(
                "agent %s stream attempt %d/%d failed: %s",
                agent_name, attempt, attempts, exc,
            )
            if attempt == attempts:
                break
            await asyncio.sleep(delay)
            delay *= 2
    assert last_exc is not None  # exhausted loop entered the except branch
    raise last_exc


async def _drain_until_done(queue: asyncio.Queue, task: asyncio.Task) -> AsyncGenerator[dict, None]:
    """Yield queued events until the agent task finishes, then drain remainder."""
    while not task.done():
        try:
            event = await asyncio.wait_for(queue.get(), timeout=0.3)
            yield event
        except asyncio.TimeoutError:
            continue
    while not queue.empty():
        yield queue.get_nowait()


# ── Per-agent runners with JSON validation + one-shot retry ─────────────────


_RETRY_PREAMBLE = (
    "Your previous response was not valid JSON matching the required schema. "
    "Below is what you returned. Re-emit ONLY the valid JSON object, no fences, "
    "no preamble, no commentary. Here is your previous output:\n\n"
)


async def _run_and_parse(
    agent_name: str,
    agent: Any,
    user_msg: str,
    model: Type[BaseModel],
    queue: asyncio.Queue,
) -> AsyncGenerator[Any, None]:
    """Run an agent (with network retry), parse JSON, retry once on parse fail.

    Yields SSE events as they stream, then a sentinel dict as the LAST item:
    `{"_done": True, "report": <model|None>, "tokens_in": int, "tokens_out": int}`.

    On unrecoverable network failure (after retries), the sentinel carries
    `_error: <str>` instead, and the orchestrator emits pipeline_error.
    """
    # First attempt — includes network retry.
    task = asyncio.create_task(
        _stream_agent_with_retry(agent_name, agent, user_msg, queue)
    )
    async for event in _drain_until_done(queue, task):
        yield event

    try:
        final_text, tokens_in, tokens_out = await task
    except Exception as exc:
        yield {"_done": True, "report": None, "tokens_in": 0, "tokens_out": 0, "_error": str(exc)}
        return

    parsed = _parse(final_text, model)
    if parsed is not None:
        yield {"_done": True, "report": parsed, "tokens_in": tokens_in, "tokens_out": tokens_out}
        return

    # JSON-parse retry: re-ask the model to emit valid JSON. Network retry
    # is applied here too.
    retry_msg = _RETRY_PREAMBLE + final_text
    task = asyncio.create_task(
        _stream_agent_with_retry(agent_name, agent, retry_msg, queue)
    )
    async for event in _drain_until_done(queue, task):
        yield event
    try:
        final_text, ti2, to2 = await task
    except Exception as exc:
        yield {"_done": True, "report": None, "tokens_in": tokens_in, "tokens_out": tokens_out, "_error": str(exc)}
        return

    parsed = _parse(final_text, model)
    yield {
        "_done": True,
        "report": parsed,
        "tokens_in": tokens_in + ti2,
        "tokens_out": tokens_out + to2,
    }


# ── Orchestrator ────────────────────────────────────────────────────────────


def _skeptic_user_message(idea_text: str, output_language: str) -> str:
    return (
        f"Analyze this Pakistani startup idea:\n\n{idea_text}\n\n"
        f"Output language for free-text fields: {output_language}. "
        "Return strictly valid JSON per your output contract."
    )


def _munshi_user_message(idea_text: str, skeptic_report: BaseModel, output_language: str) -> str:
    return (
        f"Analyze the financial reality of this Pakistani startup idea:\n\n{idea_text}\n\n"
        f"The Skeptic has just reported:\n{skeptic_report.model_dump_json(indent=2)}\n\n"
        f"Output language: {output_language}. "
        "Return strictly valid JSON per your output contract."
    )


def _hype_user_message(
    idea_text: str, skeptic_report: BaseModel, munshi_report: BaseModel, output_language: str
) -> str:
    return (
        f"Re-pitch and brand this Pakistani startup idea:\n\n{idea_text}\n\n"
        f"Skeptic's report:\n{skeptic_report.model_dump_json(indent=2)}\n\n"
        f"Munshi's report:\n{munshi_report.model_dump_json(indent=2)}\n\n"
        f"Output language: {output_language}. "
        "Return strictly valid JSON per your output contract."
    )


def _cvo_user_message(
    idea_text: str,
    skeptic_report: BaseModel,
    munshi_report: BaseModel,
    hype_report: BaseModel,
    output_language: str,
) -> str:
    return (
        f"Synthesize the boardroom's verdict on this Pakistani startup idea:\n\n{idea_text}\n\n"
        f"Skeptic's report:\n{skeptic_report.model_dump_json(indent=2)}\n\n"
        f"Munshi's report:\n{munshi_report.model_dump_json(indent=2)}\n\n"
        f"Hype's report:\n{hype_report.model_dump_json(indent=2)}\n\n"
        f"Output language: {output_language}. "
        "Return strictly valid JSON per your output contract."
    )


# Ring buffer cap for the in-memory run-report store. See api/main.py for the
# OrderedDict it's stored on.
REPORT_STORE_CAPACITY = 50


def _store_final_report(run_id: str, final_report: BaseModel) -> None:
    """Stash the final report keyed by run_id for the /export route.

    Bound to app.state.reports if FastAPI started us; otherwise no-op so
    direct module-level test invocations don't crash.
    """
    try:
        from fastapi import FastAPI  # noqa: F401
        # Late import to avoid circular at module load.
        import api.main as _main_mod
    except Exception:
        return
    store = getattr(_main_mod.app.state, "reports", None)
    if store is None:
        return
    store[run_id] = final_report
    # Evict oldest until under cap.
    while len(store) > REPORT_STORE_CAPACITY:
        store.popitem(last=False)


async def run_pipeline(idea_text: str, output_language: str = "en") -> AsyncGenerator[dict, None]:
    """Run the 4-agent VibeInvest boardroom and yield SSE events.

    Each agent: stream live events → parse final response → one-shot JSON
    retry on parse failure → up-to-3 network retries on transient errors →
    emit `agent_complete` with the structured report. After all four
    succeed, emit `pipeline_complete` with the CVO's final report plus
    cumulative token counts and an estimated PKR cost.
    """
    run_id = uuid.uuid4().hex[:8]
    yield {"type": "pipeline_start", "run_id": run_id, "idea_text": idea_text}

    queue: asyncio.Queue = asyncio.Queue()

    # Cumulative token totals across the four agents.
    total_in = 0
    total_out = 0
    total_cost_pkr = 0.0

    async def _consume(agent_name: str, agent, user_msg: str, model_cls):
        """Run one stage, yield SSE events from the queue, and return the
        parsed report (or None on terminal failure)."""
        nonlocal total_in, total_out, total_cost_pkr
        parsed: BaseModel | None = None
        error_msg: str | None = None
        async for item in _run_and_parse(agent_name, agent, user_msg, model_cls, queue):
            if isinstance(item, dict) and item.get("_done"):
                parsed = item["report"]
                error_msg = item.get("_error")
                ti = item.get("tokens_in", 0)
                to = item.get("tokens_out", 0)
                total_in += ti
                total_out += to
                total_cost_pkr += estimate_cost_pkr(
                    _AGENT_MODELS.get(agent_name, ""), ti, to
                )
            else:
                yield item
        # Return-via-attribute pattern (async generators can't return values).
        yield {"_terminal": True, "report": parsed, "error": error_msg}

    # ── Skeptic ──
    yield {"type": "agent_start", "agent": "skeptic"}
    skeptic_report: BaseModel | None = None
    skeptic_error: str | None = None
    async for item in _consume("skeptic", skeptic_agent,
                               _skeptic_user_message(idea_text, output_language),
                               SkepticReport):
        if isinstance(item, dict) and item.get("_terminal"):
            skeptic_report = item["report"]
            skeptic_error = item["error"]
        else:
            yield item

    if skeptic_report is None:
        yield {"type": "pipeline_error", "agent": "skeptic",
               "error": skeptic_error or "Skeptic produced malformed JSON twice"}
        return

    yield {"type": "agent_complete", "agent": "skeptic", "report": skeptic_report.model_dump()}
    yield {"type": "agent_handoff", "from": "skeptic", "to": "munshi"}

    # ── Munshi ──
    yield {"type": "agent_start", "agent": "munshi"}
    munshi_report: BaseModel | None = None
    munshi_error: str | None = None
    async for item in _consume("munshi", munshi_agent,
                               _munshi_user_message(idea_text, skeptic_report, output_language),
                               MunshiReport):
        if isinstance(item, dict) and item.get("_terminal"):
            munshi_report = item["report"]
            munshi_error = item["error"]
        else:
            yield item

    if munshi_report is None:
        yield {"type": "pipeline_error", "agent": "munshi",
               "error": munshi_error or "Munshi produced malformed JSON twice"}
        return

    yield {"type": "agent_complete", "agent": "munshi", "report": munshi_report.model_dump()}
    yield {"type": "agent_handoff", "from": "munshi", "to": "hype"}

    # ── Hype ──
    yield {"type": "agent_start", "agent": "hype"}
    hype_report: BaseModel | None = None
    hype_error: str | None = None
    async for item in _consume("hype", hype_agent,
                               _hype_user_message(idea_text, skeptic_report, munshi_report, output_language),
                               HypeReport):
        if isinstance(item, dict) and item.get("_terminal"):
            hype_report = item["report"]
            hype_error = item["error"]
        else:
            yield item

    if hype_report is None:
        yield {"type": "pipeline_error", "agent": "hype",
               "error": hype_error or "Hype produced malformed JSON twice"}
        return

    yield {"type": "agent_complete", "agent": "hype", "report": hype_report.model_dump()}
    yield {"type": "agent_handoff", "from": "hype", "to": "cvo"}

    # ── CVO ──
    yield {"type": "agent_start", "agent": "cvo"}
    final_report: BaseModel | None = None
    cvo_error: str | None = None
    async for item in _consume("cvo", cvo_agent,
                               _cvo_user_message(idea_text, skeptic_report, munshi_report, hype_report, output_language),
                               FinalReport):
        if isinstance(item, dict) and item.get("_terminal"):
            final_report = item["report"]
            cvo_error = item["error"]
        else:
            yield item

    if final_report is None:
        yield {"type": "pipeline_error", "agent": "cvo",
               "error": cvo_error or "CVO produced malformed JSON twice"}
        return

    yield {"type": "agent_complete", "agent": "cvo", "report": final_report.model_dump()}

    # Stash the final report so /api/run/{run_id}/export can find it.
    _store_final_report(run_id, final_report)

    yield {
        "type": "pipeline_complete",
        "final_report": final_report.model_dump(),
        "tokens_in": total_in,
        "tokens_out": total_out,
        "cost_pkr_estimate": round(total_cost_pkr, 4),
    }
