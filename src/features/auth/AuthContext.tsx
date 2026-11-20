import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService, Session, User } from '../../api/auth';

export type ExamType = 'academic' | 'core';
export type ExamProfile = { exam: ExamType; target: number; examWhen: number };

type Stored = { onboarded: boolean; session: Session | null; profile: ExamProfile | null };
type AuthState = Stored & {
  ready: boolean;
  user: User | null;
  completeOnboarding: () => void;
  signIn: (session: Session) => void;
  completeSetup: (profile: ExamProfile) => void;
  signOut: () => Promise<void>;
};

/**
 * Demo persistence only. When real tokens arrive, keep the token in
 * expo-secure-store and only non-sensitive flags in AsyncStorage.
 */
const KEY = 'aigma.auth.v1';
const empty: Stored = { onboarded: false, session: null, profile: null };

const Ctx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<Stored>(empty);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then(raw => { if (raw) setState({ ...empty, ...JSON.parse(raw) }); })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  const update = useCallback((patch: Partial<Stored>) => {
    setState(prev => {
      const next = { ...prev, ...patch };
      AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const value = useMemo<AuthState>(() => ({
    ...state,
    ready,
    user: state.session?.user ?? null,
    completeOnboarding: () => update({ onboarded: true }),
    signIn: session => update({ session, onboarded: true }),
    completeSetup: profile => update({ profile }),
    signOut: async () => { await authService.logout(); update({ session: null }); },
  }), [state, ready, update]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

export const isValidEmail = (v: string) => /^\S+@\S+\.\S+$/.test(v);

/** 0–4: length ≥ 8, uppercase, digit, symbol. */
export const passwordScore = (v: string) =>
  Number(v.length >= 8) + Number(/[A-Z]/.test(v)) + Number(/\d/.test(v)) + Number(/[^A-Za-z0-9]/.test(v));
