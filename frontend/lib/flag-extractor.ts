/**
 * Pure function: turn a FinalReport into green/red flag lists for the
 * Aura Audit display.
 *
 * Rule:
 *   - Each dimension with score >= 7 → green flag
 *   - Each dimension with score <= 4 → red flag
 *   - All three top_fixes are always red flags
 */
import type { FinalReport } from "./agent-types";

const DIMENSION_LABELS: Record<keyof FinalReport["dimensions"], string> = {
  market: "Market",
  money: "Money",
  brand: "Brand",
  strategy: "Strategy",
};

export interface Flags {
  green: string[];
  red: string[];
}

export function extractFlags(report: FinalReport): Flags {
  const green: string[] = [];
  const red: string[] = [];

  for (const [key, dim] of Object.entries(report.dimensions) as [
    keyof FinalReport["dimensions"],
    FinalReport["dimensions"]["market"],
  ][]) {
    const label = `${DIMENSION_LABELS[key]}: ${dim.note}`;
    if (dim.score >= 7) green.push(label);
    else if (dim.score <= 4) red.push(label);
  }

  for (const fix of report.top_fixes) {
    red.push(fix);
  }

  return { green, red };
}
