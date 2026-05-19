from datetime import datetime
from typing import List, Literal, Optional

from pydantic import BaseModel, Field


FindingType = Literal["positive", "negative", "warning", "neutral"]
ChangeType = Literal["positive", "negative", "warning", "neutral"]
Verdict = Literal["INVEST", "WATCH", "PASS", "ACQUIRE"]


class StartupQuery(BaseModel):
    name: str = Field(..., min_length=1)
    intent: Optional[str] = "invest"
    sector: Optional[str] = None
    stage: Optional[str] = None
    funding: Optional[str] = None
    context: Optional[str] = None


class Finding(BaseModel):
    text: str
    type: FindingType = "neutral"


class AgentReport(BaseModel):
    id: int
    name: str
    role: str
    badge: str
    body: str
    findings: List[Finding] = []


class Dimension(BaseModel):
    name: str
    score: int = Field(..., ge=0, le=100)


class Metric(BaseModel):
    label: str
    value: str
    change: str
    change_type: ChangeType = "neutral"


class ReportData(BaseModel):
    startup_name: str
    intent: Optional[str] = None
    tags: List[str] = []
    score: int = Field(..., ge=0, le=1000)
    verdict: Verdict
    verdict_sub: Optional[str] = None
    dimensions: List[Dimension]
    metrics: List[Metric]
    agent_reports: List[AgentReport]


class AnalysisSummary(BaseModel):
    id: str
    startup_name: str
    intent: Optional[str] = None
    status: str
    score: Optional[int] = None
    verdict: Optional[str] = None
    created_at: datetime
    completed_at: Optional[datetime] = None


class AnalysisDetail(AnalysisSummary):
    sector: Optional[str] = None
    stage: Optional[str] = None
    funding: Optional[str] = None
    context: Optional[str] = None
    error: Optional[str] = None
    report: Optional[ReportData] = None
    progress: List["AgentProgress"] = []


class AgentProgress(BaseModel):
    agent_id: int
    agent_name: str
    status: str
    badge: Optional[str] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None


AnalysisDetail.model_rebuild()
