import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import {
  apiSignIn,
  apiSignUp,
  apiGoogleAuth,
  apiUpdateName,
  apiChangePassword,
  setUnauthorizedHandler,
  setAuthToken,
} from '../services/api';

export interface User {
  name: string;
  email: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  // True only on native while the persisted session is being read from
  // AsyncStorage on cold start. Auth gates should wait on this before
  // redirecting to /auth so a logged-in user isn't bounced out (ERR-006).
  isBootstrapping: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Session persistence. Web uses localStorage synchronously (so the very first
// render is already authenticated, no flash). Native (iOS/Android/APK) has no
// localStorage, so it persists to AsyncStorage and hydrates asynchronously on
// cold start — see the bootstrap effect below (ERR-006).
const STORAGE_KEY = 'vibe.auth.session';

interface PersistedSession {
  user: User;
  token: string;
}

const hasLocalStorage =
  Platform.OS === 'web' && typeof globalThis !== 'undefined' && typeof (globalThis as any).localStorage !== 'undefined';

function parseSession(raw: string | null): PersistedSession | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed?.user?.email || !parsed?.token) return null;
    return parsed as PersistedSession;
  } catch {
    return null;
  }
}

// Synchronous web-only read, used to seed the initial render on web.
function loadSession(): PersistedSession | null {
  if (!hasLocalStorage) return null;
  return parseSession((globalThis as any).localStorage.getItem(STORAGE_KEY));
}

// Async read used on native cold start.
async function loadSessionAsync(): Promise<PersistedSession | null> {
  if (hasLocalStorage) return loadSession();
  try {
    return parseSession(await AsyncStorage.getItem(STORAGE_KEY));
  } catch {
    return null;
  }
}

function saveSession(session: PersistedSession | null) {
  if (hasLocalStorage) {
    try {
      const ls = (globalThis as any).localStorage;
      if (session) ls.setItem(STORAGE_KEY, JSON.stringify(session));
      else ls.removeItem(STORAGE_KEY);
    } catch {
      // private-mode / quota — ignore
    }
    return;
  }
  // Native: AsyncStorage is async; fire-and-forget so callers stay synchronous.
  if (session) {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(session)).catch(() => {});
  } else {
    AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const initial = loadSession();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!initial);
  const [user, setUser] = useState<User | null>(initial?.user ?? null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  // Web is seeded synchronously above, so it's never bootstrapping. Native has
  // to read AsyncStorage first, so it starts true until hydration completes.
  const [isBootstrapping, setIsBootstrapping] = useState<boolean>(!hasLocalStorage);
  // The token persisted on native, surfaced so profile edits can re-save it
  // without re-reading AsyncStorage (web reads it back from localStorage).
  const [sessionToken, setSessionToken] = useState<string | null>(initial?.token ?? null);

  // Keep profile edits persisted across refresh/restart.
  useEffect(() => {
    if (!isAuthenticated || !user) return;
    if (hasLocalStorage) {
      const current = loadSession();
      if (current && current.user.email === user.email) {
        saveSession({ user, token: current.token });
      }
    } else if (sessionToken) {
      saveSession({ user, token: sessionToken });
    }
  }, [user, isAuthenticated, sessionToken]);

  // Native cold-start: hydrate the persisted session from AsyncStorage, push the
  // token to the request layer, then clear the bootstrapping flag (ERR-006).
  useEffect(() => {
    if (hasLocalStorage) return; // web already seeded synchronously
    let cancelled = false;
    (async () => {
      const persisted = await loadSessionAsync();
      if (cancelled) return;
      if (persisted) {
        setAuthToken(persisted.token);
        setSessionToken(persisted.token);
        setUser(persisted.user);
        setIsAuthenticated(true);
      }
      setIsBootstrapping(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // If any API call returns 401 (token expired / revoked), force sign-out so
  // the gates in /index.tsx and /search.tsx redirect to /auth on the next render.
  useEffect(() => {
    // Seed the request-layer token from any persisted web session.
    const persisted = loadSession();
    if (persisted?.token) setAuthToken(persisted.token);

    setUnauthorizedHandler(() => {
      saveSession(null);
      setAuthToken(null);
      setSessionToken(null);
      setIsAuthenticated(false);
      setUser(null);
    });
    return () => setUnauthorizedHandler(null);
  }, []);

  const triggerHaptic = async (type: 'success' | 'warning' | 'error' | 'light') => {
    try {
      if (type === 'success') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else if (type === 'warning') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      } else if (type === 'error') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } else {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (e) {
      // Haptics not available on this platform/simulator, fail silently
    }
  };

  const getErrorMessage = (err: any): string => {
    const rawMessage = err?.message || '';
    try {
      const jsonStart = rawMessage.indexOf('{');
      if (jsonStart !== -1) {
        const jsonStr = rawMessage.substring(jsonStart);
        const parsed = JSON.parse(jsonStr);
        if (parsed && parsed.detail) {
          return parsed.detail;
        }
      }
    } catch (e) {
      // Ignore parsing errors and fall back
    }
    
    // Clean up generic HTTP wrapper
    if (rawMessage.includes('HTTP 401') || rawMessage.includes('Incorrect password')) {
      return 'Incorrect password. Please check your credentials.';
    }
    if (rawMessage.includes('HTTP 404') || rawMessage.includes('No account found')) {
      return 'No account found with this email. Please sign up.';
    }
    if (rawMessage.includes('Failed to fetch') || rawMessage.includes('Network request failed')) {
      return 'Cannot connect to backend server. Make sure the FastAPI app is running.';
    }
    return rawMessage.split(':').pop()?.trim() || rawMessage;
  };

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    await triggerHaptic('light');
    
    try {
      const res = await apiSignIn(email, password);
      const nextUser = { name: res.user.name, email: res.user.email };
      saveSession({ user: nextUser, token: res.access_token });
      setAuthToken(res.access_token);
      setSessionToken(res.access_token);
      setIsAuthenticated(true);
      setUser(nextUser);
      setIsLoading(false);
      await triggerHaptic('success');
    } catch (err: any) {
      setIsLoading(false);
      await triggerHaptic('error');
      throw new Error(getErrorMessage(err));
    }
  };

  const signUp = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    await triggerHaptic('light');

    try {
      const res = await apiSignUp(name, email, password);
      const nextUser = { name: res.user.name, email: res.user.email };
      saveSession({ user: nextUser, token: res.access_token });
      setAuthToken(res.access_token);
      setSessionToken(res.access_token);
      setIsAuthenticated(true);
      setUser(nextUser);
      setIsLoading(false);
      await triggerHaptic('success');
    } catch (err: any) {
      setIsLoading(false);
      await triggerHaptic('error');
      throw new Error(getErrorMessage(err));
    }
  };

  const signInWithGoogle = async () => {
    setIsLoading(true);
    await triggerHaptic('light');

    try {
      // Simulate launching Google sign-in and getting profile token
      const mockIdToken = `mock-google-token-${Date.now()}`;
      const res = await apiGoogleAuth(
        mockIdToken,
        'Google Investor',
        'google.investor@gmail.com',
        'mock-google-id-123456'
      );

      const nextUser = { name: res.user.name, email: res.user.email };
      saveSession({ user: nextUser, token: res.access_token });
      setAuthToken(res.access_token);
      setSessionToken(res.access_token);
      setIsAuthenticated(true);
      setUser(nextUser);
      setIsLoading(false);
      await triggerHaptic('success');
    } catch (err: any) {
      setIsLoading(false);
      await triggerHaptic('error');
      throw new Error(getErrorMessage(err));
    }
  };

  const signOut = async () => {
    await triggerHaptic('light');
    saveSession(null);
    setAuthToken(null);
    setSessionToken(null);
    setIsAuthenticated(false);
    setUser(null);
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (updates.name === undefined) return;
    setIsLoading(true);
    try {
      const updated = await apiUpdateName(updates.name);
      const nextUser: User = { name: updated.name, email: updated.email };
      setUser(nextUser);
      setIsLoading(false);
    } catch (err: any) {
      setIsLoading(false);
      throw new Error(getErrorMessage(err));
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    setIsLoading(true);
    try {
      await apiChangePassword(currentPassword, newPassword);
      setIsLoading(false);
    } catch (err: any) {
      setIsLoading(false);
      throw new Error(getErrorMessage(err));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        isLoading,
        isBootstrapping,
        signIn,
        signUp,
        signInWithGoogle,
        signOut,
        updateProfile,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
