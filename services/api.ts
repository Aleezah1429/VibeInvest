import { Platform } from 'react-native';
import type {
  AnalysisDetail,
  AnalysisSummary,
  StartupQuery,
} from './types';

function defaultBaseUrl(): string {
  // Android emulator can't reach the host's localhost — it's 10.0.2.2 instead.
  if (Platform.OS === 'android') return 'http://10.0.2.2:8000';
  return 'http://127.0.0.1:8000';
}

export const API_BASE_URL =
  (process.env.EXPO_PUBLIC_API_BASE_URL as string | undefined) || defaultBaseUrl();

// Mirrors STORAGE_KEY in context/AuthContext.tsx. Kept inline to avoid a
// circular import (AuthContext imports from this file).
const AUTH_STORAGE_KEY = 'vibe.auth.session';

function readAuthToken(): string | null {
  if (Platform.OS !== 'web') return null;
  const ls = (globalThis as any)?.localStorage;
  if (!ls) return null;
  try {
    const raw = ls.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return typeof parsed?.token === 'string' ? parsed.token : null;
  } catch {
    return null;
  }
}

// Exposed so screens that build URLs by hand (PDF download / share) can
// attach the token without re-reading localStorage themselves.
export function getAuthToken(): string | null {
  return readAuthToken();
}

let onUnauthorized: (() => void) | null = null;
export function setUnauthorizedHandler(fn: (() => void) | null) {
  onUnauthorized = fn;
}

function authHeaders(): Record<string, string> {
  const token = readAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
      ...(init?.headers || {}),
    },
    ...init,
  });
  if (res.status === 401) {
    onUnauthorized?.();
  }
  if (!res.ok) {
    let detail = '';
    try {
      detail = await res.text();
    } catch {
      // ignore
    }
    throw new Error(`HTTP ${res.status} ${res.statusText}: ${detail}`);
  }
  return (await res.json()) as T;
}

export function createAnalysis(
  query: StartupQuery & { file?: { uri: string; name: string; type: string } | null }
): Promise<AnalysisDetail> {
  const formData = new FormData();
  formData.append('name', query.name);
  if (query.intent) formData.append('intent', query.intent);
  if (query.sector) formData.append('sector', query.sector);
  if (query.stage) formData.append('stage', query.stage);
  if (query.funding) formData.append('funding', query.funding);
  if (query.context) formData.append('context', query.context);

  if (query.file) {
    formData.append('file', {
      uri: query.file.uri,
      name: query.file.name,
      type: query.file.type || 'application/pdf',
    } as any);
  }

  return fetch(`${API_BASE_URL}/api/analyses`, {
    method: 'POST',
    body: formData,
    headers: { ...authHeaders() },
  }).then(async (res) => {
    if (res.status === 401) onUnauthorized?.();
    if (!res.ok) {
      let detail = '';
      try {
        detail = await res.text();
      } catch {
        // ignore
      }
      throw new Error(`HTTP ${res.status} ${res.statusText}: ${detail}`);
    }
    return res.json() as Promise<AnalysisDetail>;
  });
}


export function getAnalysis(id: string): Promise<AnalysisDetail> {
  return http<AnalysisDetail>(`/api/analyses/${id}`);
}

export function listAnalyses(limit = 10): Promise<AnalysisSummary[]> {
  return http<AnalysisSummary[]>(`/api/analyses?limit=${limit}`);
}

export type DashboardVerdict =
  | 'INVEST'
  | 'WATCH'
  | 'PASS'
  | 'ACQUIRE'
  | 'PIVOT'
  | 'ITERATE';

export interface RecentAnalysisItem {
  id: string;
  name: string;
  score: number;
  verdict: DashboardVerdict;
  finished_at: string;
  breakdowns: { label: string; val: number }[];
}

export function getRecentAnalyses(limit = 10): Promise<RecentAnalysisItem[]> {
  return http<RecentAnalysisItem[]>(`/api/analyses/recent?limit=${limit}`);
}

export interface PollOptions {
  intervalMs?: number;
  timeoutMs?: number;
  onUpdate?: (a: AnalysisDetail) => void;
  signal?: AbortSignal;
}

/** Polls until status is completed/failed, or timeout fires. */
export async function pollAnalysis(
  id: string,
  opts: PollOptions = {},
): Promise<AnalysisDetail> {
  const interval = opts.intervalMs ?? 2000;
  const timeout = opts.timeoutMs ?? 240_000;
  const start = Date.now();
  while (true) {
    if (opts.signal?.aborted) throw new Error('aborted');
    const a = await getAnalysis(id);
    opts.onUpdate?.(a);
    if (a.status === 'completed' || a.status === 'failed') return a;
    if (Date.now() - start > timeout) throw new Error('analysis timed out');
    await new Promise((r) => setTimeout(r, interval));
  }
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: AuthUser;
}

export function apiSignUp(name: string, email: string, password: string): Promise<TokenResponse> {
  return http<TokenResponse>('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
}

export function apiSignIn(email: string, password: string): Promise<TokenResponse> {
  return http<TokenResponse>('/api/auth/signin', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function apiGoogleAuth(
  idToken: string,
  name?: string,
  email?: string,
  googleId?: string
): Promise<TokenResponse> {
  return http<TokenResponse>('/api/auth/google', {
    method: 'POST',
    body: JSON.stringify({
      id_token: idToken,
      name,
      email,
      google_id: googleId,
    }),
  });
}
