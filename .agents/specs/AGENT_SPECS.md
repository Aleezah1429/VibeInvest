# Agent Specifications

Per-agent contract for the four LLM agents in [backend/app/agents/](../../backend/app/agents). Companion to [README.md](../../README.md) §3.

All agents share `LLMClient` ([base.py](../../backend/app/agents/base.py)): the system prompt is forced to "respond ONLY with a single JSON object", and `_extract_json` strips code fences before parsing. Models: agents 1–3 use `CLAUDE_MODEL` (default `claude-sonnet-4-5`), the CVO uses `CLAUDE_MODEL_CVO` (default `claude-opus-4-5`).

---

## 1. The Skeptic — market & competition
**Module:** [skeptic.py](../../backend/app/agents/skeptic.py) · **Score:** `market_fit_score` (0–100, **weight 0.30**) · **Tools:** Tavily (4 queries)

Queries: `"{name} startup company overview"`, `"{name} funding round investors"`, `"{name} competitors market share"`, `"{name} risks news 2024 2025"`. Top 12 results are fed to Claude; all 16 are persisted to `raw_evidence(kind="search")`.

System prompt:
> The Skeptic — a sharp market researcher. Reads raw web search results, surfaces verifiable facts, competitors, and red flags. Skeptical by default but fair. Assigns a Market-fit score from 0 to 100.

Output:
```json
{
  "summary": "2-3 sentence narrative",
  "badge": "≤ 18 chars (e.g. '3 flags', 'Solid TAM')",
  "market_fit_score": 0,
  "findings": [{ "text": "≤ 100 chars", "type": "positive|negative|warning|neutral" }],
  "tags": ["short", "category"]
}
```

---

## 2. The Munshi — financials
**Module:** [munshi.py](../../backend/app/agents/munshi.py) · **Score:** `financials_score` (0–100, **weight 0.25**) · **Tools:** none

Reads up to 10 `raw_evidence` rows + the Skeptic's summary. Also emits **the 4 metrics** that appear in the report's "Key Metrics" table (value can use any unit — `$28M`, `₨ 2.4B`, `+12% YoY`).

System prompt:
> The Munshi — a no-nonsense financial analyst with Pakistani-market intuition. Extracts valuation, GMV, burn, runway, unit economics. Estimates carefully when numbers aren't stated. Assigns a Financials score 0–100.

Output:
```json
{
  "summary": "…",
  "badge": "≤ 18 chars",
  "financials_score": 0,
  "findings": [{ "text": "…", "type": "positive|negative|warning|neutral" }],
  "metrics": [
    { "label": "Est. valuation", "value": "$28M", "change": "+12% YoY", "change_type": "positive|negative|neutral" }
  ]
}
```

---

## 3. The Hype — brand & sentiment
**Module:** [hype.py](../../backend/app/agents/hype.py) · **Score:** `brand_power_score` (0–100, **weight 0.20**) · **Tools:** Tavily (2 queries)

Queries: `"{name} brand reputation press coverage"`, `"{name} founder twitter social media presence"`. Results saved as `raw_evidence(kind="brand_search")`.

System prompt:
> The Hype — a brand-savvy Gen Z analyst. Reads market sentiment, brand strength, social presence, founder credibility. Confident and modern voice, claims backed by evidence. Assigns a Brand-power score 0–100.

Output:
```json
{
  "summary": "…",
  "badge": "≤ 18 chars",
  "brand_power_score": 0,
  "findings": [{ "text": "…", "type": "positive|negative|warning|neutral" }]
}
```

---

## 4. The CVO — synthesis & verdict
**Module:** [cvo.py](../../backend/app/agents/cvo.py) · **Score:** `strategy_score` (0–100, **weight 0.25**) · **Tools:** none · **Model:** `CLAUDE_MODEL_CVO` (default `claude-opus-4-5`)

Reads the three prior agent dicts. Verdict is coerced to `WATCH` if not in `{INVEST, WATCH, REJECT, ACQUIRE}`. `verdict_sub` truncated to 32 chars.

System prompt:
> The CVO (Chief Vibe Officer). Reads summaries from the three prior agents, resolves conflicts, weighs risk vs. upside. Picks exactly one verdict from [INVEST, WATCH, REJECT, ACQUIRE] aligned with intent. INVEST: strong overall. WATCH: promising but risky. REJECT: not a fit, do not pursue. ACQUIRE: only when intent=acquire and target is a strong fit.

Output:
```json
{
  "summary": "executive synthesis",
  "badge": "≤ 18 chars",
  "strategy_score": 0,
  "verdict": "INVEST | WATCH | REJECT | ACQUIRE",
  "verdict_sub": "≤ 24 chars (e.g. 'WITH CONDITIONS')",
  "findings": [{ "text": "…", "type": "positive|negative|warning|neutral" }]
}
```

---

## Hand-off & scoring

```
Skeptic ─▶ Munshi ─▶ Hype ─▶ CVO ─▶ orchestrator
   │          │         │         (synthesis only)
   ▼          ▼         ▼
raw_evidence (search, brand_search)
```

The orchestrator ([orchestrator.py](../../backend/app/orchestrator.py)) then computes:

```python
aura_score = round(0.30*market_fit + 0.25*financials + 0.20*brand_power + 0.25*strategy) * 10   # clamped [0, 1000]
```

…and writes the assembled `ReportData` to `analyses.report_json`.

---

## Failure handling

| Failure | Behavior |
|---|---|
| LLM JSON malformed | `_extract_json` raises → orchestrator marks analysis `failed`, stores `error` |
| Tavily error | `web_search` returns `[]`; agent runs with zero evidence |
| Anthropic API error | Propagates → orchestrator marks `failed` |
| Retries | None at any layer today |
