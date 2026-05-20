import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';
import { getRecentAnalyses } from '../services/api';

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
  isLoading: boolean;
  addReport: (r: Omit<SavedReport, 'id' | 'finishedAt'> & { id?: string; finishedAt?: string }) => void;
  clearReports: () => void;
  refresh: () => Promise<void>;
}

const ReportsContext = createContext<ReportsContextType | undefined>(undefined);

export function ReportsProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [reports, setReports] = useState<SavedReport[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      setReports([]);
      return;
    }
    setIsLoading(true);
    try {
      const items = await getRecentAnalyses(20);
      setReports(
        items.map((it) => ({
          id: it.id,
          name: it.name,
          score: it.score,
          verdict: it.verdict,
          finishedAt: it.finished_at,
          breakdowns: it.breakdowns,
        })),
      );
    } catch {
      // Network/auth errors — keep whatever we already have so the dashboard
      // doesn't flash to empty on a transient failure. AuthContext's 401
      // handler will sign the user out separately if the token is invalid.
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Hydrate from the backend whenever auth state flips to authenticated; clear
  // on sign-out so the next user doesn't see the previous user's reports.
  useEffect(() => {
    if (isAuthenticated) {
      void refresh();
    } else {
      setReports([]);
    }
  }, [isAuthenticated, refresh]);

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
      isLoading,
      addReport,
      clearReports,
      refresh,
    }),
    [reports, isLoading, addReport, clearReports, refresh],
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
