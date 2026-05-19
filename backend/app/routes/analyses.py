import json
import uuid
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..db import get_session
from ..models import Analysis, AgentRun
from ..schemas import (
    AgentProgress,
    AnalysisDetail,
    AnalysisSummary,
    ReportData,
    StartupQuery,
)

router = APIRouter(prefix="/api/analyses", tags=["analyses"])


def _to_summary(a: Analysis) -> AnalysisSummary:
    return AnalysisSummary(
        id=a.id,
        startup_name=a.startup_name,
        intent=a.intent,
        status=a.status,
        score=a.score,
        verdict=a.verdict,
        created_at=a.created_at,
        completed_at=a.completed_at,
    )


def _to_detail(a: Analysis) -> AnalysisDetail:
    report = None
    if a.report_json:
        try:
            report = ReportData(**json.loads(a.report_json))
        except Exception as e:
            import logging
            logging.getLogger("routes.analyses").warning("ReportData parse failed for %s: %s", a.id, e)
            report = None
    progress = [
        AgentProgress(
            agent_id=r.agent_id,
            agent_name=r.agent_name,
            status=r.status,
            badge=r.badge,
            started_at=r.started_at,
            completed_at=r.completed_at,
        )
        for r in sorted(a.agent_runs, key=lambda r: r.agent_id)
    ]
    return AnalysisDetail(
        id=a.id,
        startup_name=a.startup_name,
        intent=a.intent,
        sector=a.sector,
        stage=a.stage,
        funding=a.funding,
        context=a.context,
        status=a.status,
        score=a.score,
        verdict=a.verdict,
        created_at=a.created_at,
        completed_at=a.completed_at,
        error=a.error,
        report=report,
        progress=progress,
    )


@router.post("", response_model=AnalysisDetail, status_code=201)
def create_analysis(
    query: StartupQuery,
    background: BackgroundTasks,
    db: Session = Depends(get_session),
):
    analysis = Analysis(
        id=uuid.uuid4().hex,
        startup_name=query.name.strip(),
        intent=(query.intent or "invest").strip().lower(),
        sector=query.sector,
        stage=query.stage,
        funding=query.funding,
        context=query.context,
        status="queued",
        created_at=datetime.utcnow(),
    )
    db.add(analysis)
    db.commit()
    db.refresh(analysis)

    # Lazy import so this module loads even before the orchestrator is wired up.
    from ..orchestrator import run_pipeline

    background.add_task(run_pipeline, analysis.id)
    return _to_detail(analysis)


@router.get("", response_model=List[AnalysisSummary])
def list_analyses(
    limit: int = Query(10, ge=1, le=50),
    status: Optional[str] = None,
    db: Session = Depends(get_session),
):
    stmt = select(Analysis).order_by(Analysis.created_at.desc()).limit(limit)
    if status:
        stmt = select(Analysis).where(Analysis.status == status).order_by(Analysis.created_at.desc()).limit(limit)
    rows = db.execute(stmt).scalars().all()
    return [_to_summary(a) for a in rows]


@router.get("/{analysis_id}", response_model=AnalysisDetail)
def get_analysis(analysis_id: str, db: Session = Depends(get_session)):
    a = db.get(Analysis, analysis_id)
    if not a:
        raise HTTPException(status_code=404, detail="Analysis not found")
    return _to_detail(a)


@router.delete("/{analysis_id}", status_code=204)
def delete_analysis(analysis_id: str, db: Session = Depends(get_session)):
    a = db.get(Analysis, analysis_id)
    if not a:
        raise HTTPException(status_code=404, detail="Analysis not found")
    db.delete(a)
    db.commit()
    return None
