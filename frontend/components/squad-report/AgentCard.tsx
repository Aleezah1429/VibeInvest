import type { AgentName } from "@/lib/agent-types";
import { AGENT_META } from "@/lib/agent-types";
import type { AgentState } from "@/lib/run-state";

interface AgentCardProps {
  agent: AgentName;
  state: AgentState;
}

const STATUS_LABEL: Record<AgentState["status"], string> = {
  idle: "Idle",
  working: "Working",
  complete: "Complete",
  error: "Error",
};

const STATUS_STYLE: Record<AgentState["status"], string> = {
  idle: "bg-white/5 text-white/40 border-white/10",
  working: "bg-neon-blue/15 text-neon-blue border-neon-blue/40 animate-pulse",
  complete: "bg-neon-green/15 text-neon-green border-neon-green/50",
  error: "bg-neon-red/15 text-neon-red border-neon-red/50",
};

const AGENT_ACCENT: Record<AgentName, string> = {
  skeptic: "from-neon-blue/30",
  munshi: "from-neon-green/30",
  hype: "from-neon-magenta/30",
  cvo: "from-neon-green/40",
};

export default function AgentCard({ agent, state }: AgentCardProps) {
  const meta = AGENT_META[agent];

  return (
    <div className="relative rounded-2xl border border-white/10 bg-bg-card p-5 overflow-hidden">
      <div
        aria-hidden
        className={`absolute -top-12 -right-12 w-32 h-32 rounded-full blur-2xl bg-gradient-radial ${AGENT_ACCENT[agent]} to-transparent`}
      />

      <div className="relative flex items-start justify-between gap-3 mb-4">
        <div>
          <div className="text-base font-semibold text-white">{meta.displayName}</div>
          <div className="text-xs text-white/50 mt-0.5">{meta.persona}</div>
        </div>
        <span
          className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded-full border ${STATUS_STYLE[state.status]}`}
        >
          {STATUS_LABEL[state.status]}
        </span>
      </div>

      {state.status !== "idle" && (
        <div className="relative max-h-40 overflow-y-auto text-xs text-white/70 leading-relaxed whitespace-pre-wrap font-mono">
          {state.streamedText || (
            <span className="text-white/30 italic">Thinking…</span>
          )}
        </div>
      )}

      {state.error && (
        <p className="relative mt-3 text-xs text-neon-red" role="alert">
          {state.error}
        </p>
      )}
    </div>
  );
}
