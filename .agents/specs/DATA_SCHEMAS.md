# Data Schemas

Source of truth: [backend/app/models.py](../../backend/app/models.py), [backend/app/auth.py](../../backend/app/auth.py), [backend/app/schemas.py](../../backend/app/schemas.py). Mirror: [services/types.ts](../../services/types.ts). Companion to [README.md](../../README.md) §6.

Tables are created on startup via `Base.metadata.create_all()`. A small additive SQLite migration adds `analyses.user_id` for legacy DB files. Alembic is installed but **no migrations are wired** — non-additive schema changes need migrations added before deploy.

---

## Tables

### `users`
| Column | Type | Notes |
|---|---|---|
| `id` | TEXT PK | UUID4 hex |
| `name` | TEXT | ≥ 2 chars |
| `email` | TEXT UNIQUE INDEX | Lower-cased on save |
| `hashed_password` | TEXT? | `salt:pbkdf2_sha256(100k)`; null for Google-only accounts |
| `google_id` | TEXT? | Google `sub` claim |
| `created_at` | DATETIME | UTC |

### `analyses`
| Column | Type | Notes |
|---|---|---|
| `id` | TEXT PK | UUID4 hex |
| `user_id` | TEXT? FK→users | Nullable for legacy rows |
| `startup_name` | TEXT | Required |
| `intent`, `sector`, `stage`, `funding`, `context` | TEXT? | Free-form hints |
| `status` | TEXT | `queued` → `running` → `completed` / `failed` |
| `score` | INT? | 0–1000 Aura score |
| `verdict` | TEXT? | `INVEST` / `WATCH` / `REJECT` / `ACQUIRE` |
| `verdict_sub` | TEXT? | ≤ 32 chars |
| `report_json` | TEXT? | Denormalised `ReportData` blob |
| `error` | TEXT? | Failure reason |
| `created_at`, `completed_at` | DATETIME | UTC |

### `agent_runs`
| Column | Type | Notes |
|---|---|---|
| `id` | TEXT PK | UUID4 hex |
| `analysis_id` | TEXT FK→analyses | Cascade-delete |
| `agent_id` | INT | 1 Skeptic · 2 Munshi · 3 Hype · 4 CVO |
| `agent_name` | TEXT | `the_skeptic`, `the_munshi`, `the_hype`, `the_cvo` |
| `status` | TEXT | `running` / `done` / `failed` |
| `input_summary`, `output_text`, `findings_json`, `badge` | TEXT? | Per-agent persisted state |
| `started_at`, `completed_at` | DATETIME | UTC |

### `raw_evidence`
| Column | Type | Notes |
|---|---|---|
| `id` | TEXT PK | UUID4 hex |
| `analysis_id` | TEXT FK→analyses | Cascade-delete |
| `source` | TEXT? | URL or filename |
| `kind` | TEXT? | `search` / `brand_search` / `pdf` |
| `content` | TEXT? | Extracted text or `[{query}] {title}\n{snippet}` |
| `fetched_at` | DATETIME | UTC |

### Relationships
```
users 1 ──< analyses 1 ──< agent_runs        (cascade-delete from analysis)
                       └─< raw_evidence      (cascade-delete from analysis)
```

---

## Pydantic / TypeScript shapes — [schemas.py](../../backend/app/schemas.py) ↔ [services/types.ts](../../services/types.ts)

```python
FindingType = Literal["positive", "negative", "warning", "neutral"]
ChangeType  = FindingType
Verdict     = Literal["INVEST", "WATCH", "REJECT", "ACQUIRE"]
AnalysisStatus = Literal["queued", "running", "completed", "failed"]
```

| Shape | Fields |
|---|---|
| `Finding` | `text: str`, `type: FindingType` |
| `AgentReport` | `id, name, role, badge, body, findings: list[Finding]` |
| `Dimension` | `name: str`, `score: int` (0–100) |
| `Metric` | `label, value, change: str`, `change_type: ChangeType` |
| `ReportData` | `startup_name, intent?, tags, score (0–1000), verdict, verdict_sub?, dimensions, metrics, agent_reports` |
| `AnalysisSummary` | row-level view: `id, startup_name, intent?, status, score?, verdict?, created_at, completed_at?` |
| `AnalysisDetail` | extends summary with `sector?, stage?, funding?, context?, error?, report?, progress` |
| `AgentProgress` | `agent_id, agent_name, status, badge?, started_at?, completed_at?` |
| `RecentAnalysisItem` | dashboard view: `id, name, score, verdict, finished_at, breakdowns[]` |
| `DashboardBreakdown` | `label, val` (Market / Financials / Brand only — Strategy is collapsed into the headline score) |

> The frontend's `DashboardVerdict` union also includes `PIVOT` / `ITERATE` for design completeness — the backend never produces these.

---

## `report_json` contract

Matches `ReportData` exactly. Written by the orchestrator after the CVO returns. Read by:
- `_to_detail()` in [routes/analyses.py](../../backend/app/routes/analyses.py) — deserialises for API response
- `/recent` — extracts `dimensions` for the dashboard chart
- `/{id}/pdf` — passed straight to `generate_due_diligence_pdf()`

Treat as canonical and immutable. Schema evolution should be additive; readers should tolerate unknown keys.

---

## Aura score formula — [scoring.py](../../backend/app/scoring.py)

```python
def aura_score(market_fit, financials, brand_power, strategy) -> int:
    weighted = 0.30*market_fit + 0.25*financials + 0.20*brand_power + 0.25*strategy
    return max(0, min(1000, round(weighted * 10)))
```

Weights sum to 1.0. Inputs 0–100, output 0–1000. Adjust here if a new agent is added — keep weights summing to 1.0.

---

## Sync rules

- Edit `models.py` → write an Alembic migration before deploying to a DB with data.
- Edit `schemas.py` → mirror in `services/types.ts`.
- Edit a `Literal[…]` union → grep both repos for the literal strings; both sides declare by hand.
