/**
 * Upload-side helpers — generate a client-side run id, stash the idea text
 * in sessionStorage, and return the run id for navigation.
 *
 * Why sessionStorage: the backend doesn't have a "create a run, get an id"
 * endpoint in MVP. The agent pipeline starts streaming the moment the
 * /api/run/google-adk POST hits, so we generate the id on the frontend,
 * navigate to /run/[id], and the run page reads the idea text from
 * sessionStorage to open the stream.
 *
 * Phase 1 (persistence) replaces this with a real run record in Firestore.
 */

const STORAGE_PREFIX = "vi:run:";

export interface StoredRun {
  ideaText: string;
  outputLanguage: "en" | "ur" | "roman-ur";
  createdAt: number;
}

export function createRun(
  ideaText: string,
  outputLanguage: "en" | "ur" | "roman-ur" = "en",
): { runId: string } {
  const runId = generateRunId();
  const record: StoredRun = {
    ideaText,
    outputLanguage,
    createdAt: Date.now(),
  };
  try {
    sessionStorage.setItem(STORAGE_PREFIX + runId, JSON.stringify(record));
  } catch {
    // sessionStorage may be unavailable in restricted contexts; the run page
    // will surface the error.
  }
  return { runId };
}

export function readRun(runId: string): StoredRun | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_PREFIX + runId);
    if (!raw) return null;
    return JSON.parse(raw) as StoredRun;
  } catch {
    return null;
  }
}

function generateRunId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID().split("-")[0];
  }
  return Math.random().toString(36).slice(2, 10);
}
