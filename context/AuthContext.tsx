import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import {
  apiSignIn,
  apiSignUp,
  apiGoogleAuth,
  apiUpdateName,
  apiChangePassword,
  setUnauthorizedHandler,
} from '../services/api';

export interface User {
  name: string;
  email: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Web-only persistence using localStorage. No AsyncStorage/SecureStore is installed,
// so native cold-starts remain unauthenticated until one of those is added.
const STORAGE_KEY = 'vibe.auth.session';

interface PersistedSession {
  user: User;
  token: string;
}

const hasLocalStorage =
  Platform.OS === 'web' && typeof globalThis !== 'undefined' && typeof (globalThis as any).localStorage !== 'undefined';

function loadSession(): PersistedSession | null {
  if (!hasLocalStorage) return null;
  try {
    const raw = (globalThis as any).localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.user?.email || !parsed?.token) return null;
    return parsed as PersistedSession;
  } catch {
    return null;
  }
}

function saveSession(session: PersistedSession | null) {
  if (!hasLocalStorage) return;
  try {
    const ls = (globalThis as any).localStorage;
    if (session) ls.setItem(STORAGE_KEY, JSON.stringify(session));
    else ls.removeItem(STORAGE_KEY);
  } catch {
    // private-mode / quota — ignore
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const initial = loadSession();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!initial);
  const [user, setUser] = useState<User | null>(initial?.user ?? null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Keep profile edits persisted across refresh on web.
  useEffect(() => {
    if (!hasLocalStorage || !isAuthenticated || !user) return;
    const current = loadSession();
    if (current && current.user.email === user.email) {
      saveSession({ user, token: current.token });
    }
  }, [user, isAuthenticated]);

  // If any API call returns 401 (token expired / revoked), force sign-out so
  // the gates in /index.tsx and /search.tsx redirect to /auth on the next render.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      saveSession(null);
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
