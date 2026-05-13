"use client";

import { useEffect, useReducer, useRef } from "react";
import { useParams, useRouter } from "next/navigation";

import { readRun } from "@/lib/upload-client";
import { openBoardroomStream } from "@/lib/sse-client";
import { applyEvent, INITIAL_RUN_STATE } from "@/lib/run-state";
import { extractFlags } from "@/lib/flag-extractor";

import SquadGrid from "@/components/squad-report/SquadGrid";
import AuraGauge from "@/components/aura-audit/AuraGauge";
import FlagsPanel from "@/components/aura-audit/FlagsPanel";
import VerdictCard from "@/components/final-verdict/VerdictCard";

export default function RunPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const runId = params.id;

  const [state, dispatch] = useReducer(applyEvent, INITIAL_RUN_STATE);
  const startedRef = useRef(false);
  const auraSectionRef = useRef<HTMLDivElement>(null);

  // Kick off the stream on mount (once)
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const stored = readRun(runId);
    if (!stored) {
      // No idea in storage — user landed here directly without going through /upload
      router.replace("/upload");
      return;
    }

    const stream = openBoardroomStream({
      idea_text: stored.ideaText,
      output_language: stored.outputLanguage,
    });

    (async () => {
      try {
        for await (const event of stream.events) {
          dispatch(event);
        }
      } catch (err) {
        // Strict Mode dev double-invoke and intentional unmount navigation
        // both abort the in-flight fetch — that's not a real pipeline error.
        if (err instanceof DOMException && err.name === "AbortError") return;
        const message = err instanceof Error ? err.message : "Connection lost";
        dispatch({ type: "pipeline_error", error: message });
      }
    })();

    return () => stream.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runId]);

  // Smooth-scroll to the Aura Audit once the final report arrives
  useEffect(() => {
    if (state.finalReport && auraSectionRef.current) {
      auraSectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [state.finalReport]);

  const flags = state.finalReport ? extractFlags(state.finalReport) : null;

  return (
    <main className="max-w-5xl mx-auto px-6 py-10">
      <header className="mb-8">
        <div className="text-xs uppercase tracking-[0.18em] text-white/40 mb-2">
          Boardroom Run · {runId}
        </div>
        <h1 className="text-lg sm:text-xl font-medium text-white/80 line-clamp-2">
          {state.ideaText || "Connecting to the boardroom…"}
        </h1>
        {state.pipelineError && (
          <p role="alert" className="mt-3 text-sm text-neon-red">
            {state.pipelineError}
          </p>
        )}
      </header>

      <SquadGrid state={state} />

      {state.finalReport && flags && (
        <section ref={auraSectionRef} className="mt-16 flex flex-col gap-10">
          <div className="flex flex-col items-center gap-8">
            <h2 className="text-sm uppercase tracking-[0.18em] text-white/50">
              Your Aura Audit
            </h2>
            <AuraGauge
              score={state.finalReport.aura_score}
              verdict={state.finalReport.verdict}
            />
          </div>
          <FlagsPanel flags={flags} />
        </section>
      )}

      {state.finalReport && (
        <section className="mt-16">
          <VerdictCard runState={state} />
        </section>
      )}
    </main>
  );
}
