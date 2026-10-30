import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import type { ITrip, ApiResponse, PaginatedResponse, TripsFilter } from '@/types';

export function useTrips(filters?: TripsFilter) {
  return useQuery({
    queryKey: ['trips', filters],
    queryFn: async () => {
      const res = await apiClient.get<PaginatedResponse<ITrip>>('/api/v1/trips', {
        params: filters,
      });
      return res.data;
    },
  });
}

export function useTrip(slug: string) {
  return useQuery({
    queryKey: ['trip', slug],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<ITrip>>(`/api/v1/trips/${slug}`);
      return res.data.data;
    },
    enabled: !!slug,
  });
}

export function useFeaturedTrips() {
  return useQuery({
    queryKey: ['trips', 'featured'],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<ITrip[]>>('/api/v1/trips/featured');
      return res.data.data ?? [];
    },
    staleTime: 5 * 60_000,
  });
}

export function useTrendingTrips() {
  return useQuery({
    queryKey: ['trips', 'trending'],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<ITrip[]>>('/api/v1/trips/trending');
      return res.data.data ?? [];
    },
    staleTime: 5 * 60_000,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ['trips', 'categories'],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<string[]>>('/api/v1/trips/categories');
      return res.data.data ?? [];
    },
    staleTime: 10 * 60_000,
  });
}
