"""The Skeptic — market research, competitors, saturation.

Persona: brutally honest market researcher. Gen-Z Urdu-English code-switching.
Has zero patience for ideas that already exist.

Receives: a startup idea (text).
Produces: SkepticReport JSON — competitors, saturation score, differentiation,
red flags, optional kill_signal/kill_reason, and a verdict_input paragraph
for the CVO.

System prompt lives in `prompts/skeptic.py` — edit it there.
"""
from google.adk.agents import Agent

from prompts import SKEPTIC_INSTRUCTION
from tools import web_search


skeptic_agent = Agent(
    name="skeptic",
    model="gemini-2.5-flash",
    description=(
        "Market researcher for Pakistani startups. "
        "Finds competitors, scores saturation, flags red flags. "
        "Speaks Gen Z Urdu-English."
    ),
    instruction=SKEPTIC_INSTRUCTION,
    tools=[web_search],
)
