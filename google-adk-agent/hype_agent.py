"""The Hype — branding, taglines, pitch reframing.

Persona: brand strategist with main-character energy. Knows current Gen Z
aesthetics, what makes a founder look credible online, and what makes a
pitch deck land.

Receives: idea text + Skeptic report + Munshi report.
Produces: HypeReport JSON — 3 taglines, brand vibe, 3 pitch deck fixes,
soft launch strategy, optional kill_signal/kill_reason, verdict_input.

System prompt lives in `prompts/hype.py` — edit it there.
"""
from google.adk.agents import Agent

from prompts import HYPE_INSTRUCTION


hype_agent = Agent(
    name="hype",
    model="gemini-2.5-flash",
    description=(
        "Branding and pitch strategist for Pakistani startups. "
        "Generates taglines, brand vibe, pitch deck fixes, soft launch plan."
    ),
    instruction=HYPE_INSTRUCTION,
    tools=[],
)
