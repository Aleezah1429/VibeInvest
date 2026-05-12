"use client";

import { useState } from "react";

import type { RunState } from "@/lib/run-state";
import type {
  HypeReport,
  MunshiReport,
  SkepticReport,
} from "@/lib/agent-types";

interface ExportReportButtonProps {
  runState: RunState;
}

export default function ExportReportButton({ runState }: ExportReportButtonProps) {
  const [busy, setBusy] = useState(false);

  const skeptic = runState.agents.skeptic.report as SkepticReport | null;
  const munshi = runState.agents.munshi.report as MunshiReport | null;
  const hype = runState.agents.hype.report as HypeReport | null;
  const cvo = runState.finalReport;

  const canExport = !!(skeptic && munshi && hype && cvo) && !busy;

  async function handleClick() {
    if (!canExport || !skeptic || !munshi || !hype || !cvo) return;
    setBusy(true);
    try {
      // Dynamic import — keeps jspdf out of the initial bundle
      const { generateInvestorReport } = await import("@/lib/investor-report");
      generateInvestorReport({
        ideaText: runState.ideaText,
        skeptic,
        munshi,
        hype,
        cvo,
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!canExport}
      className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-bg-base bg-neon-green hover:bg-neon-green/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
    >
      {busy ? "Generating…" : "Export Investor Report (PDF)"}
    </button>
  );
}
