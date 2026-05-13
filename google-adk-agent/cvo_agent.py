"""The CVO (Chief Vibe Officer) — synthesis, Aura Score, verdict.

Persona: calm, strategic, authoritative. The grown-up in the room. Uses Gen Z
slang sparingly, saved for the verdict_line.

Receives: idea text + all three upstream reports (Skeptic, Munshi, Hype).
Produces: FinalReport JSON — Aura Score (0-1000), verdict, verdict_line,
dimensional scores, top 3 fixes, next steps.

No tools — synthesis only. Uses Gemini 2.5 Pro (deeper than Flash) because
this is the one call per run where quality matters most.

System prompt lives in `prompts/cvo.py` — edit it there. It encodes the
deterministic verdict-cap rules that consume upstream `kill_signal` fields.
"""
from google.adk.agents import Agent

from prompts import CVO_INSTRUCTION


cvo_agent = Agent(
    name="cvo",
    model="gemini-2.5-pro",
    description=(
        "Chief Vibe Officer — synthesizes the three upstream reports into a "
        "final Aura Score, verdict, dimensional breakdown, and top 3 fixes."
    ),
    instruction=CVO_INSTRUCTION,
    tools=[],
)
