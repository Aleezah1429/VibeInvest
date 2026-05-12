"use client";

import { linkedInShareUrl, whatsappShareUrl } from "@/lib/share-targets";

interface ShareMenuProps {
  verdictLine: string;
}

export default function ShareMenu({ verdictLine }: ShareMenuProps) {
  const pageUrl = typeof window !== "undefined" ? window.location.href : "";

  return (
    <div className="flex items-center gap-2">
      <ShareButton
        href={linkedInShareUrl(pageUrl)}
        label="Share on LinkedIn"
        aria="LinkedIn"
      >
        <LinkedInIcon />
      </ShareButton>
      <ShareButton
        href={whatsappShareUrl(verdictLine, pageUrl)}
        label="Share on WhatsApp"
        aria="WhatsApp"
      >
        <WhatsAppIcon />
      </ShareButton>
    </div>
  );
}

interface ShareButtonProps {
  href: string;
  label: string;
  aria: string;
  children: React.ReactNode;
}

function ShareButton({ href, aria, label, children }: ShareButtonProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      title={label}
      className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-bg-elevated border border-white/10 text-white/80 hover:border-neon-green/60 hover:text-neon-green transition-colors"
    >
      <span className="sr-only">{aria}</span>
      {children}
    </a>
  );
}

function LinkedInIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M19 0h-14C2.24 0 0 2.24 0 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5V5c0-2.76-2.24-5-5-5zM8 19H5V8h3v11zM6.5 6.73c-.97 0-1.75-.79-1.75-1.75 0-.97.78-1.75 1.75-1.75s1.75.78 1.75 1.75c0 .96-.78 1.75-1.75 1.75zM20 19h-3v-5.6c0-1.34-.03-3.07-1.87-3.07-1.87 0-2.16 1.46-2.16 2.97V19h-3V8h2.88v1.5h.04c.4-.76 1.38-1.56 2.84-1.56 3.04 0 3.6 2 3.6 4.59V19z" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.5 14.4c-.3-.2-1.7-.9-2-1-.3-.1-.5-.2-.7.2-.2.3-.8 1-1 1.2-.2.2-.4.2-.7 0-1.5-.8-2.6-1.4-3.6-3.2-.3-.5.3-.5.8-1.5.1-.2 0-.3 0-.5-.1-.2-.7-1.7-.9-2.3-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.4 0 1.4 1 2.8 1.2 3 .1.2 2 3 4.8 4.2.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.5-.1 1.7-.7 1.9-1.4.2-.6.2-1.2.2-1.4 0-.2-.3-.3-.5-.4zM12 2C6.5 2 2 6.5 2 12c0 1.9.5 3.7 1.5 5.3L2 22l4.8-1.5C8.4 21.5 10.1 22 12 22c5.5 0 10-4.5 10-10S17.5 2 12 2z" />
    </svg>
  );
}
