/**
 * TypeScript mirror of `google-adk-agent/contracts.py` and the SSE event
 * vocabulary emitted by `api/services/google_adk_runner.py`.
 *
 * When you change a model here, update the Python file in the same commit.
 * The contract is load-bearing across Lane A (agents) and Lane B (full-stack).
 */

// ── Agent reports ──────────────────────────────────────────────────────────

export interface Competitor {
  name: string;
  url: string;
  summary: string;
}

export interface SkepticReport {
  competitors: Competitor[];
  market_saturation_score: number; // 1–10
  differentiation: string;
  red_flags: string[];
  verdict_input: string;
}

export interface UnitEconomics {
  revenue_per_unit_pkr: number;
  cost_per_unit_pkr: number;
  gross_margin_pct: number;
}

export interface MunshiReport {
  unit_economics: UnitEconomics;
  burn_rate_pkr_per_month: number;
  realistic_year_1_revenue_pkr: number;
  break_even_months: number;
  financial_red_flags: string[];
  verdict_input: string;
}

export interface HypeReport {
  taglines: [string, string, string];
  brand_vibe: string;
  pitch_deck_fixes: [string, string, string];
  soft_launch_strategy: string;
  verdict_input: string;
}

export type Verdict = "invest" | "iterate" | "pivot" | "pass";

export interface DimensionScore {
  score: number; // 1–10
  note: string;
}

export interface Dimensions {
  market: DimensionScore;
  money: DimensionScore;
  brand: DimensionScore;
  strategy: DimensionScore;
}

export interface FinalReport {
  aura_score: number; // 0–1000
  verdict: Verdict;
  verdict_line: string;
  dimensions: Dimensions;
  top_fixes: [string, string, string];
  next_steps: string;
}

// ── Agent identity ─────────────────────────────────────────────────────────

export type AgentName = "skeptic" | "munshi" | "hype" | "cvo";

export const AGENT_ORDER: readonly AgentName[] = [
  "skeptic",
  "munshi",
  "hype",
  "cvo",
] as const;

export const AGENT_META: Record<
  AgentName,
  { displayName: string; persona: string; section: "market-finances" | "brand-vibe" }
> = {
  skeptic: {
    displayName: "The Skeptic",
    persona: "Market research, competitors, saturation",
    section: "market-finances",
  },
  munshi: {
    displayName: "The Munshi",
    persona: "PKR unit economics, burn, break-even",
    section: "market-finances",
  },
  hype: {
    displayName: "The Hype",
    persona: "Branding, taglines, pitch reframing",
    section: "brand-vibe",
  },
  cvo: {
    displayName: "The CVO",
    persona: "Synthesis, contradictions, Aura Score",
    section: "brand-vibe",
  },
};

// ── SSE event vocabulary ───────────────────────────────────────────────────

export type SSEEvent =
  | { type: "pipeline_start"; run_id: string; idea_text: string }
  | { type: "agent_start"; agent: AgentName }
  | { type: "agent_text"; agent: AgentName; delta: string }
  | { type: "tool_call"; agent: AgentName; tool: string; args: Record<string, unknown> }
  | { type: "tool_result"; agent: AgentName; tool: string; result: unknown }
  | { type: "agent_complete"; agent: AgentName; report: AgentReport }
  | { type: "agent_handoff"; from: AgentName; to: AgentName }
  | { type: "pipeline_complete"; final_report: FinalReport }
  | { type: "pipeline_error"; agent?: AgentName; error: string };

export type AgentReport = SkepticReport | MunshiReport | HypeReport | FinalReport;
