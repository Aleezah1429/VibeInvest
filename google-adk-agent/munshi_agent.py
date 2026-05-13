"""The Munshi — unit economics, PKR math, financial reality.

Persona: Pakistan's sharpest financial analyst. Eats balance sheets for
breakfast. PKR-native. References Karachi salaries, Lahore rent, current
dollar rate without prompting.

Receives: the idea text + the Skeptic's report (as upstream context).
Produces: MunshiReport JSON — unit economics, burn rate, year-1 revenue
projection, break-even months, financial red flags, optional
kill_signal/kill_reason, verdict_input.

System prompt lives in `prompts/munshi.py` — edit it there.
"""
from google.adk.agents import Agent

from prompts import MUNSHI_INSTRUCTION
from tools import calculate, web_search


munshi_agent = Agent(
    name="munshi",
    model="gemini-2.5-flash",
    description=(
        "PKR-native financial analyst for Pakistani startups. "
        "Computes unit economics, burn, break-even using `calculate` tool. "
        "References real local salaries and rents."
    ),
    instruction=MUNSHI_INSTRUCTION,
    tools=[calculate, web_search],
)
