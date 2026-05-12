"""VibeInvest agent system — 4-agent boardroom: Skeptic → Munshi → Hype → CVO.

Top-level module loaded by `api/services/google_adk_runner.py` via
`importlib.util.spec_from_file_location` (the directory is hyphenated so it
isn't a regular Python package).

# What this module exports
- New canonical names:    skeptic_agent, munshi_agent, hype_agent, cvo_agent
- Legacy aliases:         researcher_agent, analyzer_agent, writer_agent, qa_agent
                          (so the existing google_adk_runner.py imports keep working)
- Helpers:                load_env(env_path), run_single_agent(agent, input_text)

# Why the sys.path nudge
The directory `google-adk-agent` contains a hyphen, which is not a valid Python
package name. We work around it by inserting this directory at the front of
sys.path so sibling files (skeptic_agent.py, tools.py, ...) can be imported as
flat top-level modules.
"""
from __future__ import annotations

import sys
from pathlib import Path

# ── sys.path nudge (must happen BEFORE sibling imports) ─────────────────────
_HERE = Path(__file__).parent.resolve()
if str(_HERE) not in sys.path:
    sys.path.insert(0, str(_HERE))


# ── Sibling imports ─────────────────────────────────────────────────────────
from dotenv import load_dotenv  # noqa: E402

from skeptic_agent import skeptic_agent  # noqa: E402
from munshi_agent import munshi_agent  # noqa: E402
from hype_agent import hype_agent  # noqa: E402
from cvo_agent import cvo_agent  # noqa: E402


# ── Legacy aliases ──────────────────────────────────────────────────────────
# The existing api/services/google_adk_runner.py imports the four agents by
# their original scaffold names. Aliasing keeps that runner working unchanged.
researcher_agent = skeptic_agent
analyzer_agent = munshi_agent
writer_agent = hype_agent
qa_agent = cvo_agent


# ── Helpers ─────────────────────────────────────────────────────────────────


def load_env(env_path: str | None = None) -> None:
    """Load environment variables from a .env file.

    Called by the runner at import time. Idempotent — safe to call multiple
    times. If the .env file does not exist, we silently fall back to whatever
    is already in the environment (e.g., shell exports, Docker env, Vercel).
    """
    path = Path(env_path) if env_path else _HERE / ".env"
    if path.exists():
        load_dotenv(path)


async def run_single_agent(agent, input_text: str) -> str:
    """Run one ADK agent end-to-end and return its final text response.

    Convenience helper for individual agent testing and for callers that want
    a non-streaming interface. The main pipeline in google_adk_runner.py uses
    its own streaming loop, so this is a supplementary utility.
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
        app_name="vibeinvest_boardroom",
        user_id="boardroom_user",
    )

    content = types.Content(role="user", parts=[types.Part(text=input_text)])

    final_text = ""
    async for event in runner.run_async(
        user_id="boardroom_user",
        session_id=session.id,
        new_message=content,
    ):
        if event.is_final_response() and event.content and event.content.parts:
            final_text = "".join(part.text for part in event.content.parts if part.text)

    return final_text


__all__ = [
    # New canonical names
    "skeptic_agent",
    "munshi_agent",
    "hype_agent",
    "cvo_agent",
    # Legacy aliases (used by api/services/google_adk_runner.py)
    "researcher_agent",
    "analyzer_agent",
    "writer_agent",
    "qa_agent",
    # Helpers
    "run_single_agent",
    "load_env",
]
