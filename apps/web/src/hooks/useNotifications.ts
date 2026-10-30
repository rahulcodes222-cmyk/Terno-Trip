import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import type { INotification, ApiResponse, PaginatedResponse } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

export function useNotifications(page = 1) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['notifications', page],
    queryFn: async () => {
      const res = await apiClient.get<PaginatedResponse<INotification>>(
        '/api/v1/notifications',
        { params: { page, limit: 20 } }
      );
      return res.data;
    },
    enabled: isAuthenticated,
  });
}

export function useUnreadCount() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<{ count: number }>>(
        '/api/v1/notifications/unread-count'
      );
      return res.data.data?.count ?? 0;
    },
    enabled: isAuthenticated,   // ← only run when logged in
    refetchInterval: 30_000,
  });
}

export function useMarkRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.patch(`/api/v1/notifications/${id}/read`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useMarkAllRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await apiClient.patch('/api/v1/notifications/read-all');
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}
