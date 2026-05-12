import Link from "next/link";

import UploadBento from "@/components/upload/UploadBento";

export default function UploadHub() {
  return (
    <main className="relative min-h-screen px-6 py-10 max-w-5xl mx-auto">
      <header className="flex items-center gap-3 mb-8">
        <Link
          href="/"
          aria-label="Back to launchpad"
          className="text-white/60 hover:text-white transition-colors text-xl"
        >
          ←
        </Link>
        <h1 className="text-xl font-semibold tracking-tight">Upload Hub</h1>
      </header>

      <p className="text-sm text-white/50 max-w-xl mb-6">
        Drop your idea — typed, a PDF deck, a voice note, or a photo of a
        handwritten plan. The boardroom takes it from there.
      </p>

      <UploadBento />
    </main>
  );
}
