"""Pydantic models for agent I/O contracts.

Mirrored 1:1 in `frontend/lib/agent-types.ts`. When you change a model here,
update the TS file in the same commit — the contract is load-bearing across
Lane A (agents) and Lane B (full-stack).
"""
from typing import Literal

from pydantic import BaseModel, Field


# ── Skeptic ─────────────────────────────────────────────────────────────────


class Competitor(BaseModel):
    name: str
    url: str
    summary: str


class SkepticReport(BaseModel):
    competitors: list[Competitor]
    market_saturation_score: int = Field(ge=1, le=10)
    differentiation: str
    red_flags: list[str]
    verdict_input: str


# ── Munshi ──────────────────────────────────────────────────────────────────


class UnitEconomics(BaseModel):
    revenue_per_unit_pkr: float
    cost_per_unit_pkr: float
    gross_margin_pct: float


class MunshiReport(BaseModel):
    unit_economics: UnitEconomics
    burn_rate_pkr_per_month: float
    realistic_year_1_revenue_pkr: float
    break_even_months: float
    financial_red_flags: list[str]
    verdict_input: str


# ── Hype ────────────────────────────────────────────────────────────────────


class HypeReport(BaseModel):
    taglines: list[str] = Field(min_length=3, max_length=3)
    brand_vibe: str
    pitch_deck_fixes: list[str] = Field(min_length=3, max_length=3)
    soft_launch_strategy: str
    verdict_input: str


# ── CVO (final) ─────────────────────────────────────────────────────────────


Verdict = Literal["invest", "iterate", "pivot", "pass"]


class DimensionScore(BaseModel):
    score: int = Field(ge=1, le=10)
    note: str


class Dimensions(BaseModel):
    market: DimensionScore
    money: DimensionScore
    brand: DimensionScore
    strategy: DimensionScore


class FinalReport(BaseModel):
    aura_score: int = Field(ge=0, le=1000)
    verdict: Verdict
    verdict_line: str
    dimensions: Dimensions
    top_fixes: list[str] = Field(min_length=3, max_length=3)
    next_steps: str
