import { useMutation, useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import type { IPayment, ApiResponse } from '@/types';

interface CreateOrderPayload {
  bookingRef: string;
  amount: number;
  currency?: string;
}

interface CreateOrderResult {
  paymentRef: string;
  orderId: string;
  amount: number;
  currency: string;
}

interface ProcessPaymentResult {
  paymentRef: string;
  status: string;
  bookingRef?: string;
}

export function useCreateOrder() {
  return useMutation({
    mutationFn: async (data: CreateOrderPayload) => {
      const res = await apiClient.post<ApiResponse<CreateOrderResult>>(
        '/api/v1/payments/orders',
        data
      );
      return res.data.data;
    },
  });
}

export function useProcessPayment() {
  return useMutation({
    mutationFn: async ({
      paymentRef,
      scenario = 'success',
    }: {
      paymentRef: string;
      scenario?: 'success' | 'failure' | 'pending' | 'timeout';
    }) => {
      const res = await apiClient.post<ApiResponse<ProcessPaymentResult>>(
        `/api/v1/payments/orders/${paymentRef}/process`,
        { scenario }
      );
      return res.data.data;
    },
  });
}

export function usePaymentStatus(paymentRef: string) {
  return useQuery({
    queryKey: ['payment', paymentRef],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<IPayment>>(
        `/api/v1/payments/orders/${paymentRef}`
      );
      return res.data.data;
    },
    enabled: !!paymentRef,
  });
}
