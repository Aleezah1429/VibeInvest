import type { RunState } from "@/lib/run-state";
import { VERDICT_THEME } from "@/lib/verdict-theme";

import ExportReportButton from "./ExportReportButton";
import ShareMenu from "./ShareMenu";

interface VerdictCardProps {
  runState: RunState;
}

export default function VerdictCard({ runState }: VerdictCardProps) {
  const report = runState.finalReport;
  if (!report) return null;
  const theme = VERDICT_THEME[report.verdict];

  return (
    <section className="rounded-3xl border border-white/10 bg-bg-card p-8 flex flex-col items-center text-center gap-6 max-w-2xl mx-auto">
      <CVOPortrait color={theme.color} />

      <div>
        <div className="text-xs uppercase tracking-[0.18em] text-white/40 mb-1">
          The CVO
        </div>
        <h2 className="text-xs uppercase tracking-[0.2em] text-white/50">
          Final Verdict
        </h2>
        <div
          className="text-5xl sm:text-6xl font-extrabold mt-2"
          style={{ color: theme.color, textShadow: theme.glow }}
        >
          {theme.label}
        </div>
      </div>

      <p className="text-base sm:text-lg text-white/80 leading-relaxed max-w-lg">
        {report.verdict_line}
      </p>

      <div className="flex flex-col items-center gap-4 pt-2">
        <ExportReportButton runState={runState} />
        <ShareMenu verdictLine={report.verdict_line} />
      </div>
    </section>
  );
}

function CVOPortrait({ color }: { color: string }) {
  return (
    <div
      role="img"
      aria-label="The CVO"
      className="relative w-32 h-32 rounded-full overflow-hidden border-2"
      style={{ borderColor: color, boxShadow: `0 0 30px ${color}55` }}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <defs>
          <radialGradient id="cvoBg" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </radialGradient>
        </defs>
        <rect width="100" height="100" fill="url(#cvoBg)" />
        <circle cx="50" cy="40" r="14" fill="#334155" stroke={color} strokeWidth="1" />
        <circle cx="45" cy="39" r="1.3" fill={color} />
        <circle cx="55" cy="39" r="1.3" fill={color} />
        <path d="M44 47 Q50 50 56 47" stroke={color} strokeWidth="1" strokeLinecap="round" fill="none" />
        <path d="M30 88 Q30 65 50 64 Q70 65 70 88 Z" fill="#1e293b" stroke={color} strokeWidth="1" />
        <circle cx="65" cy="74" r="3" fill={color} opacity="0.85" />
        <text x="65" y="76" textAnchor="middle" fontSize="3.5" fontWeight="700" fill="#0f172a">CVO</text>
      </svg>
    </div>
  );
}
