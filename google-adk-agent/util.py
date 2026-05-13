"""Shared utilities for the VibeInvest ADK pipeline.

Three concerns live here so the runner stays focused on orchestration:

1. `async_retry` — wrap a coroutine factory with exponential-backoff retry,
   absorbing transient Gemini failures so they don't surface as pipeline_error.
2. `estimate_cost_pkr` — back-of-envelope PKR cost from input/output token
   counts. Surfaced to judges so "what does one roast cost?" has an answer.
3. `extract_token_counts` — pull (in, out) tokens off an ADK event's
   `usage_metadata` defensively (the field is optional and shape-fluid).

Adapted from idea-kill-switch's `utils/claude_client.py` retry decorator and
cost accounting, simplified to drop the tenacity dependency.
"""
from __future__ import annotations

import asyncio
import logging
from typing import Any, Awaitable, Callable, TypeVar


log = logging.getLogger(__name__)

T = TypeVar("T")


# ── Retry ───────────────────────────────────────────────────────────────────


async def async_retry(
    coro_fn: Callable[[], Awaitable[T]],
    *,
    attempts: int = 3,
    base_delay: float = 1.0,
) -> T:
    """Run `coro_fn()`, retrying on Exception with exponential backoff.

    `coro_fn` is a no-arg callable that returns a fresh coroutine each call —
    you cannot await the same coroutine twice, so we re-build it per attempt.

    On the last attempt, the original exception propagates so the caller can
    decide whether to convert it to a `pipeline_error` event.
    """
    delay = base_delay
    for attempt in range(1, attempts + 1):
        try:
            return await coro_fn()
        except Exception as exc:
            if attempt == attempts:
                log.warning("async_retry exhausted after %d attempts: %s", attempts, exc)
                raise
            log.info(
                "async_retry attempt %d/%d failed (%s); sleeping %.1fs",
                attempt, attempts, exc, delay,
            )
            await asyncio.sleep(delay)
            delay *= 2
    # Unreachable — the loop either returns or raises.
    raise RuntimeError("async_retry fell through without returning")


# ── Cost estimation ─────────────────────────────────────────────────────────

# Per-million-token USD list rates (Google Gemini API, late 2025 published
# pricing). These are best-effort estimates for the share-card line — not a
# billing source of truth.
_USD_RATES_PER_MTOK = {
    "gemini-2.5-flash": {"in": 0.30, "out": 2.50},
    "gemini-2.5-pro":   {"in": 1.25, "out": 10.00},
}

# Approximate USD→PKR conversion. Holds the same fudge as MUNSHI_INSTRUCTION's
# reference rate so the surfaced number doesn't contradict the agent's math.
_USD_TO_PKR = 280.0


def estimate_cost_pkr(model: str, tokens_in: int, tokens_out: int) -> float:
    """Best-effort PKR cost estimate for one Gemini call.

    Unknown models return 0.0 and log a warning — better than a misleading
    number on the demo screen.
    """
    rates = _USD_RATES_PER_MTOK.get(model)
    if rates is None:
        log.warning("estimate_cost_pkr: unknown model %r, returning 0.0", model)
        return 0.0
    usd = (tokens_in / 1_000_000) * rates["in"] + (tokens_out / 1_000_000) * rates["out"]
    return round(usd * _USD_TO_PKR, 4)


# ── Token-count extraction from ADK events ──────────────────────────────────


def extract_token_counts(event: Any) -> tuple[int, int]:
    """Pull `(prompt_tokens, completion_tokens)` off an ADK event.

    ADK exposes usage info on `event.usage_metadata` for the final response of
    each turn. The field is optional and its attribute names have varied across
    ADK versions (`prompt_token_count` vs `input_tokens`, etc.), so this digs
    defensively and falls back to `(0, 0)` rather than raising.
    """
    if event is None:
        return 0, 0
    usage = getattr(event, "usage_metadata", None)
    if usage is None:
        return 0, 0
    # Try a couple of attribute name shapes seen in the wild.
    tokens_in = (
        getattr(usage, "prompt_token_count", None)
        or getattr(usage, "input_tokens", None)
        or 0
    )
    tokens_out = (
        getattr(usage, "candidates_token_count", None)
        or getattr(usage, "output_tokens", None)
        or 0
    )
    try:
        return int(tokens_in), int(tokens_out)
    except (TypeError, ValueError):
        return 0, 0
