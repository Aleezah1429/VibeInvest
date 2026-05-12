"use client";

import { useEffect, useState } from "react";

import type { Verdict } from "@/lib/agent-types";
import { VERDICT_THEME } from "@/lib/verdict-theme";

interface AuraGaugeProps {
  score: number; // 0–1000
  verdict: Verdict;
}

const SIZE = 280;
const STROKE = 14;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const ANIM_MS = 1500;

export default function AuraGauge({ score, verdict }: AuraGaugeProps) {
  const [displayed, setDisplayed] = useState(0);
  const theme = VERDICT_THEME[verdict];

  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    function tick(now: number) {
      const t = Math.min(1, (now - start) / ANIM_MS);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      setDisplayed(Math.round(eased * score));
      if (t < 1) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [score]);

  const dashOffset = CIRCUMFERENCE * (1 - displayed / 1000);

  return (
    <div
      className="relative mx-auto"
      style={{ width: SIZE, height: SIZE, filter: `drop-shadow(${theme.glow})` }}
    >
      <svg width={SIZE} height={SIZE} className="-rotate-90">
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={STROKE}
        />
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke={theme.color}
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={dashOffset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xs uppercase tracking-[0.2em] text-white/40">
          Aura Score
        </span>
        <span
          className="text-6xl font-bold tabular-nums"
          style={{ color: theme.color }}
        >
          {displayed}
        </span>
        <span className="text-xs text-white/40 mt-1">/ 1000</span>
      </div>
    </div>
  );
}
