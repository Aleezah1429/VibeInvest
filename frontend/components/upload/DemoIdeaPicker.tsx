"use client";

import { DEMO_IDEAS } from "@/lib/demo-ideas";

interface DemoIdeaPickerProps {
  onPick: (text: string) => void;
}

export default function DemoIdeaPicker({ onPick }: DemoIdeaPickerProps) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs uppercase tracking-wider text-white/40">
        Or try a demo idea
      </span>
      <div className="flex flex-wrap gap-2">
        {DEMO_IDEAS.map((idea) => (
          <button
            key={idea.label}
            type="button"
            onClick={() => onPick(idea.text)}
            className="text-xs px-3 py-1.5 rounded-full bg-bg-elevated border border-white/10 text-white/80 hover:border-neon-blue/60 hover:text-neon-blue transition-colors"
          >
            {idea.label}
          </button>
        ))}
      </div>
    </div>
  );
}
