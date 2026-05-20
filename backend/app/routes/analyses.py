import json
import uuid
import os
import shutil
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query, Form, File, UploadFile, Response
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..auth import User
from ..db import get_session
from ..models import Analysis, AgentRun, RawEvidence
from ..schemas import (
    AgentProgress,
    AnalysisDetail,
    AnalysisSummary,
    DashboardBreakdown,
    RecentAnalysisItem,
    ReportData,
)
from ..pdf_parser import extract_text_from_pdf
from ..pdf_generator import generate_due_diligence_pdf
from ..services.deps import get_current_user


router = APIRouter(prefix="/api/analyses", tags=["analyses"])

UPLOAD_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "uploads"))
os.makedirs(UPLOAD_DIR, exist_ok=True)


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
    background: BackgroundTasks,
    name: str = Form(...),
    intent: Optional[str] = Form("invest"),
    sector: Optional[str] = Form(None),
    stage: Optional[str] = Form(None),
    funding: Optional[str] = Form(None),
    context: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    analysis_id = uuid.uuid4().hex
    analysis = Analysis(
        id=analysis_id,
        user_id=current_user.id,
        startup_name=name.strip(),
        intent=(intent or "invest").strip().lower(),
        sector=sector,
        stage=stage,
        funding=funding,
        context=context,
        status="queued",
        created_at=datetime.utcnow(),
    )
    db.add(analysis)
    
    # Process PDF file if provided
    if file and file.filename:
        # Generate safe filename and path
        file_ext = os.path.splitext(file.filename)[1]
        safe_filename = f"{analysis_id}{file_ext}"
        file_path = os.path.join(UPLOAD_DIR, safe_filename)
        
        # Save file to uploads directory
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Extract text from the PDF
        extracted_text = extract_text_from_pdf(file_path)
        
        if extracted_text:
            # Save extracted text to RawEvidence so agents can consume it
            evidence = RawEvidence(
                id=uuid.uuid4().hex,
                analysis_id=analysis_id,
                source=file.filename,
                kind="pdf",
                content=extracted_text,
            )
            db.add(evidence)

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
    current_user: User = Depends(get_current_user),
):
    stmt = (
        select(Analysis)
        .where(Analysis.user_id == current_user.id)
        .order_by(Analysis.created_at.desc())
        .limit(limit)
    )
    if status:
        stmt = (
            select(Analysis)
            .where(Analysis.user_id == current_user.id, Analysis.status == status)
            .order_by(Analysis.created_at.desc())
            .limit(limit)
        )
    rows = db.execute(stmt).scalars().all()
    return [_to_summary(a) for a in rows]


@router.get("/recent", response_model=List[RecentAnalysisItem])
def get_recent_analyses(
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Recent completed analyses for the dashboard — includes the Aura score,
    verdict, and the Market/Financials/Brand breakdowns extracted from the
    stored report JSON."""
    stmt = (
        select(Analysis)
        .where(
            Analysis.user_id == current_user.id,
            Analysis.status == "completed",
            Analysis.score.isnot(None),
            Analysis.verdict.isnot(None),
        )
        .order_by(Analysis.completed_at.desc())
        .limit(limit)
    )
    rows = db.execute(stmt).scalars().all()

    # Frontend's AuraScoreCard shows three breakdowns labeled
    # Market / Financials / Brand — map the orchestrator's dimension names.
    DIM_LABEL = {
        "Market fit": "Market",
        "Financials": "Financials",
        "Brand power": "Brand",
    }

    items: List[RecentAnalysisItem] = []
    for a in rows:
        breakdowns: List[DashboardBreakdown] = []
        if a.report_json:
            try:
                report = json.loads(a.report_json)
                for d in report.get("dimensions", []):
                    label = DIM_LABEL.get(d.get("name", ""))
                    if label:
                        breakdowns.append(
                            DashboardBreakdown(label=label, val=int(d.get("score", 0)))
                        )
            except Exception:
                # Corrupt report_json shouldn't break the dashboard.
                pass
        items.append(
            RecentAnalysisItem(
                id=a.id,
                name=a.startup_name,
                score=a.score or 0,
                verdict=a.verdict or "WATCH",
                finished_at=a.completed_at or a.created_at,
                breakdowns=breakdowns,
            )
        )
    return items


@router.get("/{analysis_id}/pdf")
def get_analysis_pdf(
    analysis_id: str,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    a = db.get(Analysis, analysis_id)
    if not a or a.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Analysis not found")
        
    if not a.report_json:
        # If report not generated yet or failed, use mock/placeholder structure or raise error
        if a.status == "failed":
            raise HTTPException(status_code=400, detail="Cannot generate PDF for a failed analysis")
        raise HTTPException(status_code=400, detail="Analysis report is still in progress")

    try:
        report_data = json.loads(a.report_json)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load report data: {e}")

    # Generate PDF bytes using the report lab service
    pdf_bytes = generate_due_diligence_pdf(report_data)
    
    safe_name = a.startup_name.replace(" ", "_").strip()
    headers = {
        "Content-Disposition": f"inline; filename={safe_name}_due_diligence.pdf"
    }
    
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers=headers
    )


@router.get("/{analysis_id}", response_model=AnalysisDetail)
def get_analysis(
    analysis_id: str,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    a = db.get(Analysis, analysis_id)
    if not a or a.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Analysis not found")
    return _to_detail(a)


@router.delete("/{analysis_id}", status_code=204)
def delete_analysis(
    analysis_id: str,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    a = db.get(Analysis, analysis_id)
    if not a or a.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Analysis not found")
    db.delete(a)
    db.commit()
    return None


