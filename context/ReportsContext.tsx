import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

/**
 * Lightweight in-memory store for completed agent runs.
 *
 * No persistence yet — we don't have AsyncStorage / MMKV installed. The list
 * resets when the app process restarts. That's an acceptable trade-off for
 * the hackathon scope; the dashboard's empty-vs-populated split works as
 * long as a session contains at least one run.
 */
export type Verdict = 'INVEST' | 'WATCH' | 'PASS' | 'ACQUIRE' | 'PIVOT' | 'ITERATE';

export interface SavedReport {
  id: string;
  name: string;
  score: number;          // 0–1000 Aura score
  verdict: Verdict;
  /** ISO timestamp the run finished. */
  finishedAt: string;
  /** Optional dimensional breakdown for the AuraScore card. */
  breakdowns?: { label: string; val: number }[];
}

interface ReportsContextType {
  reports: SavedReport[];
  latestReport: SavedReport | null;
  addReport: (r: Omit<SavedReport, 'id' | 'finishedAt'> & { id?: string; finishedAt?: string }) => void;
  clearReports: () => void;
}

const ReportsContext = createContext<ReportsContextType | undefined>(undefined);

export function ReportsProvider({ children }: { children: React.ReactNode }) {
  const [reports, setReports] = useState<SavedReport[]>([]);

  const addReport = useCallback<ReportsContextType['addReport']>((r) => {
    setReports((prev) => {
      const id = r.id ?? `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const finishedAt = r.finishedAt ?? new Date().toISOString();
      // Dedup by name (most-recent wins) so a re-run replaces the old entry
      // instead of cluttering the recent list.
      const filtered = prev.filter((p) => p.name.toLowerCase() !== r.name.toLowerCase());
      return [{ ...r, id, finishedAt }, ...filtered];
    });
  }, []);

  const clearReports = useCallback(() => setReports([]), []);

  const value = useMemo<ReportsContextType>(
    () => ({
      reports,
      latestReport: reports[0] ?? null,
      addReport,
      clearReports,
    }),
    [reports, addReport, clearReports],
  );

  return <ReportsContext.Provider value={value}>{children}</ReportsContext.Provider>;
}

export function useReports() {
  const ctx = useContext(ReportsContext);
  if (ctx === undefined) {
    throw new Error('useReports must be used within a ReportsProvider');
  }
  return ctx;
}
