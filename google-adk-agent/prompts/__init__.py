"""Centralized prompt registry for the VibeInvest boardroom agents.

Each agent's `<name>_agent.py` imports its system prompt from this package:

    from prompts import SKEPTIC_INSTRUCTION

Keeping prompts here (vs. inline in the agent files) makes them easier to
diff, A/B test, and localize. Wiring stays in `<name>_agent.py`; copy stays
here.
"""
from prompts.skeptic import SKEPTIC_INSTRUCTION
from prompts.munshi import MUNSHI_INSTRUCTION
from prompts.hype import HYPE_INSTRUCTION
from prompts.cvo import CVO_INSTRUCTION

__all__ = [
    "SKEPTIC_INSTRUCTION",
    "MUNSHI_INSTRUCTION",
    "HYPE_INSTRUCTION",
    "CVO_INSTRUCTION",
]
