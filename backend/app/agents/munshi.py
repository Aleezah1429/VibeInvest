"""Agent 2 — The Munshi. Financial analyst (PKR). Reads Skeptic + raw evidence."""
import json
import logging
import uuid
from datetime import datetime
from typing import List

from sqlalchemy import select
from sqlalchemy.orm import Session

from ..models import AgentRun, Analysis, RawEvidence
from .base import get_llm

log = logging.getLogger("agents.munshi")

AGENT_ID = 2
AGENT_NAME = "The Munshi"
ROLE = "Financial analyst (PKR)"

SYSTEM = (
    "You are The Munshi — a no-nonsense financial analyst with Pakistani-market intuition. "
    "You read prior-agent findings and raw web evidence to extract financial signals: valuation, "
    "GMV, burn, runway, unit economics. You assign a Financials score from 0 to 100. "
    "When numbers aren't directly stated, you estimate carefully and label them as such."
)

USER_TEMPLATE = """Startup: {name}
Investor intent: {intent}
Sector: {sector} · Stage: {stage} · Funding hint: {funding}

Skeptic's summary:
{skeptic_summary}

Skeptic's findings:
{skeptic_findings}

Raw web evidence (top items):
{evidence}

Produce a JSON object matching exactly this schema:
{{
  "summary": "2-3 sentence narrative on unit economics, burn, runway, FX exposure",
  "badge": "short verdict like 'Solid econ' or 'FX risk' or 'Borderline' — max 18 chars",
  "financials_score": 0-100 integer,
  "findings": [
    {{"text": "specific financial signal or risk — max 100 chars", "type": "positive|negative|warning|neutral"}},
    ... 3 to 5 items
  ],
  "metrics": [
    {{"label": "short label like 'Est. valuation'", "value": "string with units like '$28M' or '₨ 2.4B'", "change": "short context like '+12% YoY' or 'High risk'", "change_type": "positive|negative|neutral"}},
    ... exactly 4 metrics
  ]
}}"""


def _evidence_text(db: Session, analysis_id: str, limit: int = 10) -> str:
    rows: List[RawEvidence] = list(
        db.execute(
            select(RawEvidence).where(RawEvidence.analysis_id == analysis_id).limit(limit)
        ).scalars()
    )
    if not rows:
        return "(no evidence)"
    return "\n".join(f"- {r.source}\n  {(r.content or '')[:300]}" for r in rows)


def run(db: Session, analysis: Analysis, skeptic_out: dict) -> dict:
    run_row = AgentRun(
        id=uuid.uuid4().hex,
        analysis_id=analysis.id,
        agent_id=AGENT_ID,
        agent_name=AGENT_NAME.lower().replace(" ", "_"),
        status="running",
        started_at=datetime.utcnow(),
        input_summary=skeptic_out.get("summary", ""),
    )
    db.add(run_row)
    db.commit()

    evidence = _evidence_text(db, analysis.id)
    user = USER_TEMPLATE.format(
        name=analysis.startup_name,
        intent=analysis.intent or "invest",
        sector=analysis.sector or "(unknown)",
        stage=analysis.stage or "(unknown)",
        funding=analysis.funding or "(unknown)",
        skeptic_summary=skeptic_out.get("summary", ""),
        skeptic_findings=json.dumps(skeptic_out.get("findings", []), indent=2),
        evidence=evidence,
    )
    payload = get_llm().complete_json(SYSTEM, user, max_tokens=1500)

    summary = payload.get("summary", "")
    badge = payload.get("badge", "—")[:24]
    findings = payload.get("findings", [])
    metrics = payload.get("metrics", [])[:4]
    score = max(0, min(100, int(payload.get("financials_score", 50))))

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
        "metrics": metrics,
        "financials_score": score,
    }
