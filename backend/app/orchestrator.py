"""Orchestrator — runs the full 4-agent pipeline sequentially."""
import json
import logging
from datetime import datetime

from .db import SessionLocal
from .models import Analysis
from .scoring import aura_score, verdict_from_score
from .agents import cvo, hype, munshi, skeptic

log = logging.getLogger("orchestrator")


def run_pipeline(analysis_id: str) -> None:
    db = SessionLocal()
    try:
        a = db.get(Analysis, analysis_id)
        if not a:
            log.warning("run_pipeline: analysis %s not found", analysis_id)
            return
        a.status = "running"
        db.commit()
        log.info("pipeline starting for %s (%s)", a.startup_name, analysis_id)

        skeptic_out = skeptic.run(db, a)
        log.info("skeptic done: %s", skeptic_out["badge"])

        munshi_out = munshi.run(db, a, skeptic_out)
        log.info("munshi done: %s", munshi_out["badge"])

        hype_out = hype.run(db, a, skeptic_out, munshi_out)
        log.info("hype done: %s", hype_out["badge"])

        cvo_out = cvo.run(db, a, skeptic_out, munshi_out, hype_out)
        log.info("cvo done: %s verdict=%s", cvo_out["badge"], cvo_out["verdict"])

        score = aura_score(
            skeptic_out["market_fit_score"],
            munshi_out["financials_score"],
            hype_out["brand_power_score"],
            cvo_out["strategy_score"],
        )

        # Verdict is driven by the Aura Score (INVEST at 500+), not the LLM.
        verdict = verdict_from_score(score, a.intent, cvo_out["verdict"])
        # Keep the CVO's qualifier only when its verdict still stands — a
        # mismatched sub ("REJECT · STRONG CONVICTION") would read as a bug.
        verdict_sub = cvo_out["verdict_sub"] if verdict == cvo_out["verdict"] else ""

        report = {
            "startup_name": a.startup_name,
            "intent": a.intent,
            "tags": skeptic_out.get("tags", []),
            "score": score,
            "verdict": verdict,
            "verdict_sub": verdict_sub,
            "dimensions": [
                {"name": "Market fit", "score": skeptic_out["market_fit_score"]},
                {"name": "Financials", "score": munshi_out["financials_score"]},
                {"name": "Brand power", "score": hype_out["brand_power_score"]},
                {"name": "Strategy", "score": cvo_out["strategy_score"]},
            ],
            "metrics": munshi_out.get("metrics", []),
            "agent_reports": [
                _agent_report(skeptic_out),
                _agent_report(munshi_out),
                _agent_report(hype_out),
                _agent_report(cvo_out),
            ],
        }

        a.score = score
        a.verdict = verdict
        a.verdict_sub = verdict_sub
        a.report_json = json.dumps(report)
        a.status = "completed"
        a.completed_at = datetime.utcnow()
        db.commit()
        log.info("pipeline complete for %s: score=%d verdict=%s", a.startup_name, score, verdict)
    except Exception as e:
        log.exception("run_pipeline failed")
        a = db.get(Analysis, analysis_id)
        if a:
            a.status = "failed"
            a.error = str(e)
            a.completed_at = datetime.utcnow()
            db.commit()
    finally:
        db.close()


def _agent_report(out: dict) -> dict:
    return {
        "id": out["agent_id"],
        "name": out["name"],
        "role": out["role"],
        "badge": out["badge"],
        "body": out["summary"],
        "findings": out.get("findings", []),
    }
