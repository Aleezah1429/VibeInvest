"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { createRun } from "@/lib/upload-client";

const MAX_CHARS = 2000;
const MIN_CHARS = 20;

interface TextInputCardProps {
  text: string;
  onTextChange: (next: string) => void;
}

export default function TextInputCard({ text, onTextChange }: TextInputCardProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const canSubmit = text.trim().length >= MIN_CHARS && !isPending;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setError(null);
    try {
      const { runId } = createRun(text.trim(), "en");
      startTransition(() => {
        router.push(`/run/${runId}`);
      });
    } catch {
      setError("Couldn't reach the boardroom — try again");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-white/10 bg-bg-elevated p-5 flex flex-col gap-4 min-h-[140px]"
    >
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-white">Text</span>
        <span className="text-xs text-white/40">
          {text.length} / {MAX_CHARS}
        </span>
      </div>

      <textarea
        value={text}
        onChange={(e) => onTextChange(e.target.value.slice(0, MAX_CHARS))}
        rows={6}
        placeholder="Describe your startup idea — what it does, who it's for, how it makes money. The boardroom needs enough to chew on."
        className="w-full resize-none bg-bg-base/80 border border-white/8 rounded-lg p-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-neon-green/60 focus:ring-2 focus:ring-neon-green/20"
      />

      {error && (
        <p role="alert" className="text-xs text-neon-red">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={!canSubmit}
        className="w-full py-3 rounded-xl font-semibold bg-white text-bg-base hover:bg-neon-green transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white"
      >
        {isPending ? "Opening boardroom…" : "Run Boardroom"}
      </button>
    </form>
  );
}
