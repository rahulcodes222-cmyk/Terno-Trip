import apiClient from '@/lib/api-client';
import type { ITrip, IBooking, ApiResponse, PaginatedResponse } from '@/types';

export async function adminCreateTrip(data: Partial<ITrip>): Promise<ITrip> {
  const res = await apiClient.post<ApiResponse<ITrip>>('/api/v1/admin/trips', data);
  return res.data.data;
}

export async function adminUpdateTrip(id: string, data: Partial<ITrip>): Promise<ITrip> {
  const res = await apiClient.put<ApiResponse<ITrip>>(`/api/v1/admin/trips/${id}`, data);
  return res.data.data;
}

export async function adminDeleteTrip(id: string): Promise<void> {
  await apiClient.delete(`/api/v1/admin/trips/${id}`);
}

export async function adminGetAllBookings(params: {
  page: number;
  limit: number;
}): Promise<PaginatedResponse<IBooking>> {
  const res = await apiClient.get<PaginatedResponse<IBooking>>(
    '/api/v1/bookings/admin',
    { params }
  );
  return res.data;
}

export async function adminGetStats(): Promise<{
  totalTrips: number;
  totalBookings: number;
  totalRevenue: number;
  activeTrips: number;
}> {
  try {
    const res = await apiClient.get<ApiResponse<{
      totalTrips: number;
      totalBookings: number;
      totalRevenue: number;
      activeTrips: number;
    }>>('/api/v1/admin/stats');
    return res.data.data;
  } catch {
    return { totalTrips: 0, totalBookings: 0, totalRevenue: 0, activeTrips: 0 };
  }
}
