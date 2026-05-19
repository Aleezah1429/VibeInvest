"""LLM provider adapter — Claude live, Gemini stubbed for tomorrow."""
import json
import logging
import re
from typing import Optional

from anthropic import Anthropic

from .. import config

log = logging.getLogger("agents.llm")


class LLMClient:
    def complete_json(self, system: str, user: str, model: Optional[str] = None, max_tokens: int = 1500) -> dict:
        raise NotImplementedError


_JSON_BLOCK_RE = re.compile(r"\{.*\}", re.DOTALL)


def _extract_json(text: str) -> dict:
    """Best-effort: try a direct parse, then yank the largest {...} block."""
    text = text.strip()
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\s*", "", text)
        text = re.sub(r"\s*```$", "", text)
    try:
        return json.loads(text)
    except Exception:
        m = _JSON_BLOCK_RE.search(text)
        if not m:
            raise ValueError(f"No JSON object found in LLM response: {text[:200]}")
        return json.loads(m.group(0))


class ClaudeClient(LLMClient):
    def __init__(self):
        if not config.CLAUDE_API_KEY:
            raise RuntimeError("CLAUDE_API_KEY not set in environment")
        self.client = Anthropic(api_key=config.CLAUDE_API_KEY)

    def complete_json(self, system: str, user: str, model: Optional[str] = None, max_tokens: int = 1500) -> dict:
        model = model or config.CLAUDE_MODEL
        log.info("Claude call model=%s", model)
        resp = self.client.messages.create(
            model=model,
            max_tokens=max_tokens,
            system=system + "\n\nRespond ONLY with a single JSON object. No prose, no markdown fences.",
            messages=[{"role": "user", "content": user}],
        )
        text = "".join(block.text for block in resp.content if getattr(block, "type", None) == "text")
        return _extract_json(text)


class GeminiClient(LLMClient):
    """Stub — wired up tomorrow alongside Postgres."""

    def complete_json(self, system: str, user: str, model: Optional[str] = None, max_tokens: int = 1500) -> dict:
        raise NotImplementedError("Gemini provider not yet wired. Set LLM_PROVIDER=claude.")


def get_llm() -> LLMClient:
    if config.LLM_PROVIDER == "gemini":
        return GeminiClient()
    return ClaudeClient()
