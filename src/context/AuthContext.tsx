// AuthContext.tsx — session/user state sourced from GET /api/v1/auth/me.
import { createContext, useCallback, useMemo, type ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api, ApiClientError } from '@/lib/api-client';
import type { SessionUser } from '@/types/api';

interface LoginArgs {
  phone: string;
  password: string;
  mfaToken?: string;
}

export interface LoginResult {
  user: SessionUser;
  /** Admin must enrol two-factor auth before the console unlocks (ADMIN_MFA_REQUIRED). */
  mfaSetupRequired: boolean;
}

interface MeState {
  user: SessionUser;
  mfaSetupRequired: boolean;
}

interface AuthContextValue {
  user: SessionUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  mfaSetupRequired: boolean;
  login: (args: LoginArgs) => Promise<LoginResult>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  markMfaEnrolled: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

async function fetchMe(): Promise<MeState | null> {
  try {
    const res = await api<{ user: SessionUser; mfaSetupRequired?: boolean }>('/auth/me');
    return { user: res.user, mfaSetupRequired: !!res.mfaSetupRequired };
  } catch (err) {
    // 401 = no session; 403 = session exists but the account was suspended/deactivated by an
    // admin. Either way the person is signed out as far as the UI is concerned.
    if (err instanceof ApiClientError && (err.status === 401 || err.status === 403)) return null;
    throw err;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: fetchMe,
    staleTime: 60_000,
    // Re-check when the tab regains focus so an admin suspending an operator takes effect promptly.
    refetchOnWindowFocus: true,
  });

  const login = useCallback(
    async (args: LoginArgs) => {
      const res = await api<{ user: SessionUser; mfaSetupRequired?: boolean }>('/auth/login', {
        method: 'POST',
        body: args,
      });
      // Drop anything cached from a previous identity before showing the new one.
      qc.removeQueries({ predicate: (q) => q.queryKey[0] !== 'me' });
      const state: MeState = { user: res.user, mfaSetupRequired: !!res.mfaSetupRequired };
      qc.setQueryData(['me'], state);
      return state;
    },
    [qc],
  );

  const logout = useCallback(async () => {
    await api('/auth/logout', { method: 'POST' }).catch(() => undefined);
    qc.setQueryData(['me'], null);
    qc.removeQueries({ predicate: (q) => q.queryKey[0] !== 'me' });
  }, [qc]);

  const refresh = useCallback(async () => {
    await qc.invalidateQueries({ queryKey: ['me'] });
  }, [qc]);

  const markMfaEnrolled = useCallback(() => {
    qc.setQueryData<MeState | null>(['me'], (prev) =>
      prev ? { user: { ...prev.user, mfaEnabled: true }, mfaSetupRequired: false } : prev,
    );
  }, [qc]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: data?.user ?? null,
      isLoading,
      isAuthenticated: !!data?.user,
      mfaSetupRequired: !!data?.mfaSetupRequired,
      login,
      logout,
      refresh,
      markMfaEnrolled,
    }),
    [data, isLoading, login, logout, refresh, markMfaEnrolled],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
