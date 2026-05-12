/**
 * Single boundary for verdict color + glow + label mapping. Both the
 * Aura Audit gauge and the Final Verdict card consume this — no inline
 * verdict colors anywhere else.
 *
 * Tailwind dynamic classes don't work with computed strings, so we expose
 * raw hex/css values and let consumers apply them via `style`.
 */
import type { Verdict } from "./agent-types";

export interface VerdictTheme {
  label: string;
  color: string;
  glow: string;
  /** Tailwind class for solid foreground use (e.g., text). */
  tw: string;
}

export const VERDICT_THEME: Record<Verdict, VerdictTheme> = {
  invest: {
    label: "INVEST!",
    color: "#22c55e",
    glow: "0 0 40px rgba(34,197,94,0.6)",
    tw: "text-neon-green",
  },
  iterate: {
    label: "ITERATE",
    color: "#3b82f6",
    glow: "0 0 40px rgba(59,130,246,0.6)",
    tw: "text-neon-blue",
  },
  pivot: {
    label: "PIVOT",
    color: "#d946ef",
    glow: "0 0 40px rgba(217,70,239,0.6)",
    tw: "text-neon-magenta",
  },
  pass: {
    label: "PASS",
    color: "#ef4444",
    glow: "0 0 40px rgba(239,68,68,0.6)",
    tw: "text-neon-red",
  },
};

/** Derive the verdict from an Aura Score using the spec's score bands. */
export function verdictForScore(score: number): Verdict {
  if (score >= 800) return "invest";
  if (score >= 600) return "iterate";
  if (score >= 400) return "pivot";
  return "pass";
}
