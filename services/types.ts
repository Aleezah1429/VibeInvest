// Mirror of backend/app/schemas.py — keep these in sync.

export type FindingType = 'positive' | 'negative' | 'warning' | 'neutral';
export type ChangeType = FindingType;
export type Verdict = 'INVEST' | 'WATCH' | 'REJECT' | 'ACQUIRE';
export type AnalysisStatus = 'queued' | 'running' | 'completed' | 'failed';

export interface Finding {
  text: string;
  type: FindingType;
}

export interface AgentReport {
  id: number;
  name: string;
  role: string;
  badge: string;
  body: string;
  findings: Finding[];
}

export interface Dimension {
  name: string;
  score: number;
}

export interface Metric {
  label: string;
  value: string;
  change: string;
  change_type: ChangeType;
}

export interface ReportData {
  startup_name: string;
  intent?: string | null;
  tags: string[];
  score: number;
  verdict: Verdict;
  verdict_sub?: string | null;
  dimensions: Dimension[];
  metrics: Metric[];
  agent_reports: AgentReport[];
}

export interface AgentProgress {
  agent_id: number;
  agent_name: string;
  status: string;
  badge?: string | null;
  started_at?: string | null;
  completed_at?: string | null;
}

export interface AnalysisSummary {
  id: string;
  startup_name: string;
  intent?: string | null;
  status: AnalysisStatus;
  score?: number | null;
  verdict?: Verdict | null;
  created_at: string;
  completed_at?: string | null;
}

export interface AnalysisDetail extends AnalysisSummary {
  sector?: string | null;
  stage?: string | null;
  funding?: string | null;
  context?: string | null;
  error?: string | null;
  report?: ReportData | null;
  progress: AgentProgress[];
}

export interface StartupQuery {
  name: string;
  intent?: string;
  sector?: string;
  stage?: string;
  funding?: string;
  context?: string;
}

// Color helpers — keep UI styling decisions centralized.
export const findingColor = (t: FindingType): string => {
  switch (t) {
    case 'positive':
      return '#22c55e';
    case 'negative':
      return '#ef4444';
    case 'warning':
      return '#f59e0b';
    default:
      return 'rgba(255,255,255,0.4)';
  }
};
