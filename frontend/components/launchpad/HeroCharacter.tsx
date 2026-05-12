/**
 * HeroCharacter — placeholder brand art for the Launchpad.
 *
 * This is a stylized inline SVG (geometric founder-with-laptop motif) chosen
 * because it's swap-friendly: Lane C ships a real character illustration in
 * Phase 0.5 and this component is the only place that changes.
 */
export default function HeroCharacter() {
  return (
    <div
      role="img"
      aria-label="VibeInvest brand mark — a founder at a laptop"
      className="relative mx-auto h-44 w-44 sm:h-52 sm:w-52"
    >
      {/* Glow halo */}
      <div
        className="absolute inset-0 rounded-full blur-2xl animate-hero-pulse"
        style={{
          background:
            "radial-gradient(closest-side, var(--color-neon-green-glow), transparent 70%)",
        }}
      />

      <svg
        viewBox="0 0 200 200"
        xmlns="http://www.w3.org/2000/svg"
        className="relative h-full w-full"
        fill="none"
      >
        <defs>
          <radialGradient id="ringGrad" cx="50%" cy="50%" r="50%">
            <stop offset="60%" stopColor="rgba(34,197,94,0)" />
            <stop offset="92%" stopColor="rgba(34,197,94,0.55)" />
            <stop offset="100%" stopColor="rgba(34,197,94,0)" />
          </radialGradient>
          <linearGradient id="laptopGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
          <linearGradient id="screenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22c55e" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
        </defs>

        {/* Outer ring */}
        <circle cx="100" cy="100" r="92" fill="url(#ringGrad)" />
        <circle cx="100" cy="100" r="84" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />

        {/* Head */}
        <circle cx="100" cy="78" r="20" fill="#1e293b" stroke="#22c55e" strokeWidth="1.4" />
        {/* Eyes */}
        <circle cx="93" cy="77" r="1.8" fill="#22c55e" />
        <circle cx="107" cy="77" r="1.8" fill="#22c55e" />
        {/* Smile */}
        <path d="M93 85 Q100 90 107 85" stroke="#22c55e" strokeWidth="1.4" strokeLinecap="round" />

        {/* Shoulders / torso */}
        <path
          d="M68 132 Q68 110 100 108 Q132 110 132 132 L132 148 L68 148 Z"
          fill="#1e293b"
          stroke="#3b82f6"
          strokeWidth="1.2"
        />

        {/* Laptop base */}
        <rect x="58" y="146" width="84" height="6" rx="2" fill="url(#laptopGrad)" stroke="rgba(255,255,255,0.08)" strokeWidth="0.8" />
        {/* Laptop screen */}
        <rect x="64" y="118" width="72" height="30" rx="3" fill="url(#screenGrad)" opacity="0.95" />
        {/* Screen glare lines */}
        <path d="M70 126 L130 126" stroke="rgba(255,255,255,0.4)" strokeWidth="0.6" />
        <path d="M70 132 L120 132" stroke="rgba(255,255,255,0.25)" strokeWidth="0.6" />
        <path d="M70 138 L110 138" stroke="rgba(255,255,255,0.18)" strokeWidth="0.6" />

        {/* Floating sparks — neon dots around the figure */}
        <circle cx="36" cy="60" r="2" fill="#d946ef" opacity="0.85" />
        <circle cx="164" cy="72" r="1.6" fill="#22c55e" opacity="0.9" />
        <circle cx="170" cy="140" r="1.8" fill="#3b82f6" opacity="0.85" />
        <circle cx="28" cy="130" r="1.4" fill="#d946ef" opacity="0.75" />
      </svg>
    </div>
  );
}
