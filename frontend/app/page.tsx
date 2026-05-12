import HeroCharacter from "@/components/launchpad/HeroCharacter";
import LaunchpadCTA from "@/components/launchpad/LaunchpadCTA";
import { COPY } from "@/lib/copy";

export default function Launchpad() {
  return (
    <main className="relative min-h-screen overflow-hidden flex flex-col items-center justify-center px-6 py-12">
      {/* Ambient neon backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 50% at 30% 20%, rgba(59,130,246,0.18), transparent 70%), " +
            "radial-gradient(50% 45% at 75% 80%, rgba(217,70,239,0.16), transparent 70%), " +
            "radial-gradient(40% 40% at 50% 100%, rgba(34,197,94,0.14), transparent 70%)",
        }}
      />

      <div className="relative z-10 w-full max-w-md text-center">
        <HeroCharacter />

        <h1 className="mt-8 text-3xl sm:text-4xl font-bold tracking-tight text-white">
          {COPY.launchpad.headline}
        </h1>

        <p className="mt-3 text-sm sm:text-base text-white/60 max-w-sm mx-auto">
          {COPY.launchpad.tagline}
        </p>

        <div className="mt-10 flex flex-col gap-3 md:flex-row md:gap-4">
          <div className="flex-1">
            <LaunchpadCTA
              label={COPY.launchpad.primaryCta}
              href="/upload"
              variant="primary"
            />
          </div>
          <div className="flex-1">
            <LaunchpadCTA
              label={COPY.launchpad.secondaryCta}
              href="/upload"
              variant="secondary"
            />
          </div>
        </div>
      </div>
    </main>
  );
}
