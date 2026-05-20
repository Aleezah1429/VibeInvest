"""Agent 4 — The CVO. Synthesizes prior outputs into the final report + Aura Score."""
import json
import logging
import uuid
from datetime import datetime
from typing import Literal

from sqlalchemy.orm import Session

from .. import config
from ..models import AgentRun, Analysis
from .base import get_llm

log = logging.getLogger("agents.cvo")

AGENT_ID = 4
AGENT_NAME = "The CVO"
ROLE = "Chief Vibe Officer"

Verdict = Literal["INVEST", "WATCH", "PASS", "ACQUIRE"]

SYSTEM = (
    "You are The CVO — the Chief Vibe Officer. You read summaries from three prior agents "
    "(Skeptic, Munshi, Hype), resolve conflicts, weigh risk vs. upside, and produce a final verdict. "
    "You assign a Strategy score from 0 to 100. You pick exactly one verdict from "
    "[INVEST, WATCH, PASS, ACQUIRE] aligned with the investor's intent. "
    "INVEST: strong overall. WATCH: promising but risky. PASS: not now. ACQUIRE: only when intent=acquire and target is a strong fit."
)

USER_TEMPLATE = """Startup: {name}
Investor intent: {intent}
Sector: {sector} · Stage: {stage}

Skeptic ({skeptic_badge}, market_fit={market_fit}):
{skeptic_summary}

Munshi ({munshi_badge}, financials={financials}):
{munshi_summary}

Hype ({hype_badge}, brand_power={brand_power}):
{hype_summary}

Produce a JSON object matching exactly this schema:
{{
  "summary": "2-3 sentence executive synthesis tying all three perspectives together",
  "badge": "short verdict like 'Conviction' or 'Conditional' — max 18 chars",
  "strategy_score": 0-100 integer,
  "verdict": "INVEST" | "WATCH" | "PASS" | "ACQUIRE",
  "verdict_sub": "short qualifier like 'WITH CONDITIONS' or 'STRONG CONVICTION' — max 24 chars",
  "findings": [
    {{"text": "synthesis-level finding — max 100 chars", "type": "positive|negative|warning|neutral"}},
    ... 3 to 5 items
  ]
}}"""


def run(
    db: Session,
    analysis: Analysis,
    skeptic_out: dict,
    munshi_out: dict,
    hype_out: dict,
) -> dict:
    run_row = AgentRun(
        id=uuid.uuid4().hex,
        analysis_id=analysis.id,
        agent_id=AGENT_ID,
        agent_name=AGENT_NAME.lower().replace(" ", "_"),
        status="running",
        started_at=datetime.utcnow(),
        input_summary=f"{skeptic_out.get('badge')}/{munshi_out.get('badge')}/{hype_out.get('badge')}",
    )
    db.add(run_row)
    db.commit()

    user = USER_TEMPLATE.format(
        name=analysis.startup_name,
        intent=analysis.intent or "invest",
        sector=analysis.sector or "(unknown)",
        stage=analysis.stage or "(unknown)",
        skeptic_badge=skeptic_out.get("badge", ""),
        skeptic_summary=skeptic_out.get("summary", ""),
        market_fit=skeptic_out.get("market_fit_score", 0),
        munshi_badge=munshi_out.get("badge", ""),
        munshi_summary=munshi_out.get("summary", ""),
        financials=munshi_out.get("financials_score", 0),
        hype_badge=hype_out.get("badge", ""),
        hype_summary=hype_out.get("summary", ""),
        brand_power=hype_out.get("brand_power_score", 0),
    )
    payload = get_llm().complete_json(SYSTEM, user, model=config.CLAUDE_MODEL_CVO, max_tokens=1500)

    summary = payload.get("summary", "")
    badge = payload.get("badge", "—")[:24]
    findings = payload.get("findings", [])
    strategy_score = max(0, min(100, int(payload.get("strategy_score", 50))))
    verdict = payload.get("verdict", "WATCH").upper()
    if verdict not in {"INVEST", "WATCH", "PASS", "ACQUIRE"}:
        verdict = "WATCH"
    verdict_sub = payload.get("verdict_sub", "")[:32]

    run_row.status = "done"
    run_row.output_text = summary
    run_row.findings_json = json.dumps(findings)
    run_row.badge = badge
    run_row.completed_at = datetime.utcnow()
    db.commit()

    return {
        "agent_id": AGENT_ID,
        "name": AGENT_NAME,
        "role": ROLE,
        "badge": badge,
        "summary": summary,
        "findings": findings,
        "strategy_score": strategy_score,
        "verdict": verdict,
        "verdict_sub": verdict_sub,
    }
