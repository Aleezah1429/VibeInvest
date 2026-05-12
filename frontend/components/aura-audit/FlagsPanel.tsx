import type { Flags } from "@/lib/flag-extractor";

interface FlagsPanelProps {
  flags: Flags;
}

export default function FlagsPanel({ flags }: FlagsPanelProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Column
        title="Green Flags"
        badge="✓"
        badgeClass="bg-neon-green/20 text-neon-green border-neon-green/40"
        items={flags.green}
        emptyHint="No standout strengths from the boardroom."
      />
      <Column
        title="Red Flags"
        badge="✗"
        badgeClass="bg-neon-red/20 text-neon-red border-neon-red/40"
        items={flags.red}
        emptyHint="No major concerns flagged."
      />
    </div>
  );
}

interface ColumnProps {
  title: string;
  badge: string;
  badgeClass: string;
  items: string[];
  emptyHint: string;
}

function Column({ title, badge, badgeClass, items, emptyHint }: ColumnProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-bg-card p-5">
      <div className="flex items-center gap-2 mb-3">
        <span
          className={`inline-flex items-center justify-center w-6 h-6 rounded-full border text-xs ${badgeClass}`}
        >
          {badge}
        </span>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
          {title}
        </h3>
      </div>
      {items.length === 0 ? (
        <p className="text-xs text-white/40 italic">{emptyHint}</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((item, i) => (
            <li
              key={i}
              className="text-sm text-white/80 leading-snug line-clamp-3"
            >
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
