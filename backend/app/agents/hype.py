"""Agent 3 — The Hype. Brand/market sentiment analyst (Gen Z voice)."""
import json
import logging
import uuid
from datetime import datetime

from sqlalchemy.orm import Session

from ..models import AgentRun, Analysis, RawEvidence
from .base import get_llm
from .tools import format_search_results, web_search

log = logging.getLogger("agents.hype")

AGENT_ID = 3
AGENT_NAME = "The Hype"
ROLE = "Brand guru (Gen Z)"

SYSTEM = (
    "You are The Hype — a brand-savvy Gen Z analyst who reads market sentiment, brand strength, "
    "social presence, and cultural fit. You write in a confident, modern, slightly playful voice "
    "but you back claims with evidence. You assign a Brand-power score from 0 to 100."
)

USER_TEMPLATE = """Startup: {name}
Sector: {sector}

Skeptic's summary:
{skeptic_summary}

Munshi's summary:
{munshi_summary}

Fresh brand-focused search results:
{brand_search}

Produce a JSON object matching exactly this schema:
{{
  "summary": "2-3 sentence narrative on brand strength, sentiment, founder presence",
  "badge": "short verdict like 'Iconic' or 'Mid' or 'Strong PR' — max 18 chars",
  "brand_power_score": 0-100 integer,
  "findings": [
    {{"text": "specific brand or sentiment signal — max 100 chars", "type": "positive|negative|warning|neutral"}},
    ... 3 to 5 items
  ]
}}"""


def run(db: Session, analysis: Analysis, skeptic_out: dict, munshi_out: dict) -> dict:
    run_row = AgentRun(
        id=uuid.uuid4().hex,
        analysis_id=analysis.id,
        agent_id=AGENT_ID,
        agent_name=AGENT_NAME.lower().replace(" ", "_"),
        status="running",
        started_at=datetime.utcnow(),
        input_summary=munshi_out.get("summary", ""),
    )
    db.add(run_row)
    db.commit()

    name = analysis.startup_name
    brand_queries = [
        f"{name} brand reputation press coverage",
        f"{name} founder twitter social media presence",
    ]
    brand_results = []
    for q in brand_queries:
        results = web_search(q, max_results=4)
        brand_results.extend(results)
        for r in results:
            db.add(
                RawEvidence(
                    id=uuid.uuid4().hex,
                    analysis_id=analysis.id,
                    source=r.get("url"),
                    kind="brand_search",
                    content=f"[{q}] {r.get('title', '')}\n{r.get('content', '')}",
                )
            )
    db.commit()

    user = USER_TEMPLATE.format(
        name=name,
        sector=analysis.sector or "(unknown)",
        skeptic_summary=skeptic_out.get("summary", ""),
        munshi_summary=munshi_out.get("summary", ""),
        brand_search=format_search_results(brand_results[:8]),
    )
    payload = get_llm().complete_json(SYSTEM, user, max_tokens=1200)

    summary = payload.get("summary", "")
    badge = payload.get("badge", "—")[:24]
    findings = payload.get("findings", [])
    score = max(0, min(100, int(payload.get("brand_power_score", 50))))

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
        "brand_power_score": score,
    }
