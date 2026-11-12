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

interface AuthContextValue {
  user: SessionUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (args: LoginArgs) => Promise<SessionUser>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

async function fetchMe(): Promise<SessionUser | null> {
  try {
    const { user } = await api<{ user: SessionUser }>('/auth/me');
    return user;
  } catch (err) {
    if (err instanceof ApiClientError && err.status === 401) return null;
    throw err;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: fetchMe,
    staleTime: 60_000,
  });

  const login = useCallback(
    async (args: LoginArgs) => {
      const { user } = await api<{ user: SessionUser }>('/auth/login', { method: 'POST', body: args });
      qc.setQueryData(['me'], user);
      return user;
    },
    [qc],
  );

  const logout = useCallback(async () => {
    await api('/auth/logout', { method: 'POST' });
    qc.setQueryData(['me'], null);
    qc.clear();
  }, [qc]);

  const refresh = useCallback(async () => {
    await qc.invalidateQueries({ queryKey: ['me'] });
  }, [qc]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: data ?? null,
      isLoading,
      isAuthenticated: !!data,
      login,
      logout,
      refresh,
    }),
    [data, isLoading, login, logout, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
