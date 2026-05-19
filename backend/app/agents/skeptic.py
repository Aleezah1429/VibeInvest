"""Agent 1 — The Skeptic. Gathers raw evidence, flags red flags, scores Market fit."""
import json
import logging
import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy.orm import Session

from ..models import AgentRun, Analysis, RawEvidence
from .base import get_llm
from .tools import format_search_results, web_search

log = logging.getLogger("agents.skeptic")

AGENT_ID = 1
AGENT_NAME = "The Skeptic"
ROLE = "Market & competition researcher"

SYSTEM = (
    "You are The Skeptic — a sharp market researcher doing due diligence on a startup. "
    "You read raw web search results and surface verifiable facts, competitors, and red flags. "
    "You are skeptical by default but fair. You assign a Market-fit score from 0 to 100."
)

USER_TEMPLATE = """Startup: {name}
Investor intent: {intent}
Sector hint: {sector}
Stage hint: {stage}
Funding hint: {funding}
User concern: {concern}

Web search evidence:
{evidence}

Produce a JSON object matching exactly this schema:
{{
  "summary": "2-3 sentence narrative on market position, competitors, and structural risks",
  "badge": "short verdict like '3 flags' or 'Cautious' or 'Solid TAM' — max 18 chars",
  "market_fit_score": 0-100 integer,
  "findings": [
    {{"text": "specific fact or risk — max 100 chars", "type": "positive|negative|warning|neutral"}},
    ... 3 to 5 items
  ],
  "tags": ["short", "category", "tags"]
}}"""


def run(db: Session, analysis: Analysis) -> dict:
    started = datetime.utcnow()
    run_row = AgentRun(
        id=uuid.uuid4().hex,
        analysis_id=analysis.id,
        agent_id=AGENT_ID,
        agent_name=AGENT_NAME.lower().replace(" ", "_"),
        status="running",
        started_at=started,
    )
    db.add(run_row)
    db.commit()

    name = analysis.startup_name
    queries = [
        f"{name} startup company overview",
        f"{name} funding round investors",
        f"{name} competitors market share",
        f"{name} risks news 2024 2025",
    ]
    all_results = []
    for q in queries:
        results = web_search(q, max_results=4)
        all_results.extend(results)
        for r in results:
            db.add(
                RawEvidence(
                    id=uuid.uuid4().hex,
                    analysis_id=analysis.id,
                    source=r.get("url"),
                    kind="search",
                    content=f"[{q}] {r.get('title', '')}\n{r.get('content', '')}",
                )
            )
    db.commit()

    evidence_text = format_search_results(all_results[:12])

    llm = get_llm()
    user = USER_TEMPLATE.format(
        name=name,
        intent=analysis.intent or "invest",
        sector=analysis.sector or "(unknown)",
        stage=analysis.stage or "(unknown)",
        funding=analysis.funding or "(unknown)",
        concern=analysis.context or "(none)",
        evidence=evidence_text,
    )
    payload = llm.complete_json(SYSTEM, user, max_tokens=1200)

    findings = payload.get("findings", [])
    summary = payload.get("summary", "")
    badge = payload.get("badge", "—")[:24]
    market_score = int(payload.get("market_fit_score", 50))
    tags = payload.get("tags", [])[:6]

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
        "market_fit_score": max(0, min(100, market_score)),
        "tags": tags,
        "evidence_count": len(all_results),
    }
