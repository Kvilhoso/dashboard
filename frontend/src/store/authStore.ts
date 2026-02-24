import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Plan = 'entry' | 'pro' | 'dynamic' | 'unlimited' | null;

export interface User {
  id: string;
  name: string;
  email: string;
  plan: Plan;
}

export interface OnboardingAnswers {
  capital?: string;
  experience?: string;
  goal?: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  onboarding: OnboardingAnswers | null;
  setToken: (token: string) => void;
  setUser: (user: User) => void;
  setOnboarding: (answers: OnboardingAnswers) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
  hasActivePlan: () => boolean;
  hasCompletedOnboarding: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      onboarding: null,
      setToken: token => set({ token }),
      setUser: user => set({ user }),
      setOnboarding: answers => set({ onboarding: answers }),
      logout: () => set({ token: null, user: null, onboarding: null }),
      isAuthenticated: () => !!get().token,
      hasActivePlan: () => !!get().user?.plan,
      hasCompletedOnboarding: () => !!get().onboarding,
    }),
    {
      name: 'auth-storage',
      partialize: state => ({
        token: process.env.NODE_ENV === 'production' ? state.token : null,
        user: process.env.NODE_ENV === 'production' ? state.user : null,
        onboarding: state.onboarding,
      }),
    },
  ),
);
