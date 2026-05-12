import Link from "next/link";

interface LaunchpadCTAProps {
  label: string;
  href: string;
  variant: "primary" | "secondary";
}

const BASE_CLASSES =
  "block w-full text-center py-3.5 px-6 rounded-xl font-semibold tracking-wide transition-colors duration-150 " +
  "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-bg-base";

const VARIANT_CLASSES = {
  primary:
    "bg-white text-bg-base hover:bg-neon-green hover:text-bg-base focus:ring-neon-green",
  secondary:
    "bg-bg-elevated text-white border border-white/15 hover:border-neon-green/60 hover:text-neon-green focus:ring-white/40",
} as const;

export default function LaunchpadCTA({ label, href, variant }: LaunchpadCTAProps) {
  return (
    <Link href={href} className={`${BASE_CLASSES} ${VARIANT_CLASSES[variant]}`}>
      {label}
    </Link>
  );
}
