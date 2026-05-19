import React, { createContext, useContext, useState, useEffect } from 'react';
import * as Haptics from 'expo-haptics';

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

  // Mock registered users in-memory for testing
  const [registeredUsers, setRegisteredUsers] = useState<Record<string, { name: string; password: string }>>({
    'investor@vibeinvest.com': { name: 'Ali Rizvi', password: 'password123' },
  });

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

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    await triggerHaptic('light');
    
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1200));

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = registeredUsers[normalizedEmail];

    if (existingUser && existingUser.password === password) {
      setIsAuthenticated(true);
      setUser({ name: existingUser.name, email: normalizedEmail });
      setIsLoading(false);
      await triggerHaptic('success');
    } else {
      setIsLoading(false);
      await triggerHaptic('error');
      if (existingUser) {
        throw new Error('Incorrect password. Please try again.');
      } else {
        throw new Error('No account found with this email. Please sign up.');
      }
    }
  };

  const signUp = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    await triggerHaptic('light');

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const normalizedEmail = email.toLowerCase().trim();
    
    if (registeredUsers[normalizedEmail]) {
      setIsLoading(false);
      await triggerHaptic('warning');
      throw new Error('An account with this email already exists.');
    }

    // Register user in memory
    setRegisteredUsers((prev) => ({
      ...prev,
      [normalizedEmail]: { name: name.trim(), password },
    }));

    setIsAuthenticated(true);
    setUser({ name: name.trim(), email: normalizedEmail });
    setIsLoading(false);
    await triggerHaptic('success');
  };

  const signInWithGoogle = async () => {
    setIsLoading(true);
    await triggerHaptic('light');

    // Simulate OAuth Web Browser redirection flow
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsAuthenticated(true);
    setUser({ name: 'Google Investor', email: 'google.investor@gmail.com' });
    setIsLoading(false);
    await triggerHaptic('success');
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
