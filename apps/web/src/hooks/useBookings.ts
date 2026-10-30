import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import type { IBooking, ApiResponse, PaginatedResponse } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

export function useMyBookings(page = 1) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['bookings', 'my', page],
    queryFn: async () => {
      const res = await apiClient.get<PaginatedResponse<IBooking>>('/api/v1/bookings/my', {
        params: { page, limit: 10 },
      });
      return res.data;
    },
    enabled: isAuthenticated,
  });
}

export function useBooking(ref: string) {
  return useQuery({
    queryKey: ['booking', ref],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<IBooking>>(`/api/v1/bookings/${ref}`);
      return res.data.data;
    },
    enabled: !!ref,
  });
}

export function useCreateBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      tripId: string;
      departureDate: string;
      travellers: Array<{ firstName: string; lastName: string; age: number }>;
      contactEmail: string;
      contactPhone: string;
      specialRequests?: string;
    }) => {
      const res = await apiClient.post<ApiResponse<IBooking>>('/api/v1/bookings', data);
      return res.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}

export function useCancelBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/api/v1/bookings/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}
