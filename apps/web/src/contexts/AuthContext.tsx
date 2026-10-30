'use client';

import React, { createContext, useContext, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import type { IUser, ApiResponse } from '@/types';

interface AuthContextValue {
  user: IUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refetch: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const qc = useQueryClient();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      try {
        const res = await apiClient.get('/api/v1/auth/me');
        // Response shape: { data: { user: {...} } } OR { data: { _id, role, ... } }
        const payload = res.data?.data;
        const u = payload?.user ?? payload;
        if (!u || !u._id) return null;
        // Backend returns a single "name" field — split into firstName/lastName
        const parts = ((u.name as string) ?? '').trim().split(' ');
        return {
          ...u,
          firstName: parts[0] ?? '',
          lastName: parts.slice(1).join(' ') ?? '',
        } as IUser;
      } catch {
        return null;
      }
    },
    staleTime: 5 * 60_000,
    retry: false,
  });

  const login = useCallback(async (email: string, password: string) => {
    await apiClient.post('/api/v1/auth/login', { email, password });
    await qc.invalidateQueries({ queryKey: ['auth', 'me'] });
  }, [qc]);

  const register = useCallback(async (formData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) => {
    // Auth-service stores a single "name" field — combine firstName + lastName
    await apiClient.post('/api/v1/auth/register', {
      name: `${formData.firstName} ${formData.lastName}`.trim(),
      email: formData.email,
      password: formData.password,
    });
    await qc.invalidateQueries({ queryKey: ['auth', 'me'] });
  }, [qc]);

  const logout = useCallback(async () => {
    try {
      await apiClient.post('/api/v1/auth/logout');
    } finally {
      qc.setQueryData(['auth', 'me'], null);
      await qc.invalidateQueries({ queryKey: ['auth', 'me'] });
    }
  }, [qc]);

  const user = data ?? null;

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refetch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
