interface StubInputCardProps {
  label: string;
  icon: React.ReactNode;
}

export default function StubInputCard({ label, icon }: StubInputCardProps) {
  return (
    <div
      aria-disabled
      className="relative rounded-2xl border border-white/8 bg-bg-elevated p-5 flex flex-col items-center justify-center gap-3 min-h-[140px] opacity-90"
    >
      <span className="absolute top-3 right-3 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border border-neon-magenta/50 text-neon-magenta">
        Live in Week 1
      </span>
      <div className="text-white/70">{icon}</div>
      <div className="text-sm text-white/70">{label}</div>
    </div>
  );
}
