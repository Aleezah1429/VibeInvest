import type { StartupQuery } from './types';

export type PendingAnalysisPayload = StartupQuery & {
  file?: { uri: string; name: string; type: string } | null;
};

let pending: PendingAnalysisPayload | null = null;

export function setPendingAnalysis(p: PendingAnalysisPayload) {
  pending = p;
}

export function consumePendingAnalysis(): PendingAnalysisPayload | null {
  const p = pending;
  pending = null;
  return p;
}
