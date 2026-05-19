import React, { createContext, useContext, useState } from 'react';
import * as Haptics from 'expo-haptics';
import { apiSignIn, apiSignUp, apiGoogleAuth } from '../services/api';

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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

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
      setIsAuthenticated(true);
      setUser({ name: res.user.name, email: res.user.email });
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
      setIsAuthenticated(true);
      setUser({ name: res.user.name, email: res.user.email });
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
      
      setIsAuthenticated(true);
      setUser({ name: res.user.name, email: res.user.email });
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
    setIsAuthenticated(false);
    setUser(null);
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
