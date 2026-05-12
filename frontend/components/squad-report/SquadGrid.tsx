import type { RunState } from "@/lib/run-state";

import AgentCard from "./AgentCard";

interface SquadGridProps {
  state: RunState;
}

export default function SquadGrid({ state }: SquadGridProps) {
  return (
    <section className="flex flex-col gap-10">
      <div>
        <SectionHeader title="Squad Report: Market & Finances" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AgentCard agent="skeptic" state={state.agents.skeptic} />
          <AgentCard agent="munshi" state={state.agents.munshi} />
        </div>
      </div>

      <div>
        <SectionHeader title="Squad Report: Brand & Vibe" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AgentCard agent="hype" state={state.agents.hype} />
          <AgentCard agent="cvo" state={state.agents.cvo} />
        </div>
      </div>
    </section>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <h2 className="text-sm uppercase tracking-[0.18em] text-white/50 mb-4">
      {title}
    </h2>
  );
}
