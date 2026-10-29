'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle } from 'lucide-react';
import { adminGetAllBookings } from '@/lib/admin-api';
import { useMyBookings } from '@/hooks/useBookings';
import Badge from '@/components/ui/Badge';
import Pagination from '@/components/ui/Pagination';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import type { IBooking } from '@/types';

type Tab = 'All' | 'Pending' | 'Confirmed' | 'Cancelled';
const TABS: Tab[] = ['All', 'Pending', 'Confirmed', 'Cancelled'];

const LIMIT = 15;

export default function AdminBookingsPage() {
  const [page, setPage] = useState(1);
  const [tab, setTab] = useState<Tab>('All');

  // Try admin endpoint first
  const adminQuery = useQuery({
    queryKey: ['admin', 'bookings', page],
    queryFn: () => adminGetAllBookings({ page, limit: LIMIT }),
    retry: false,
  });

  // Fallback to own bookings if admin endpoint fails
  const fallbackQuery = useMyBookings(page);

  const isAdminEndpointFailed = adminQuery.isError;
  const isLoading = isAdminEndpointFailed ? fallbackQuery.isLoading : adminQuery.isLoading;

  const rawData = isAdminEndpointFailed ? fallbackQuery.data : adminQuery.data;
  const allBookings: IBooking[] = rawData?.data ?? [];
  const pagination = rawData?.pagination;

  // Client-side tab filter
  const bookings = allBookings.filter((b) => {
    if (tab === 'All') return true;
    return b.status === tab;
  });

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
        <p className="mt-1 text-sm text-gray-500">Overview of all customer bookings</p>
      </div>

      {/* Fallback banner */}
      {isAdminEndpointFailed && (
        <div className="mb-4 flex items-start gap-3 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-800">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            Showing your own bookings only — admin bookings endpoint not available.
          </span>
        </div>
      )}

      {/* Tabs */}
      <div className="mb-4 flex gap-1 overflow-x-auto rounded-xl bg-gray-100 p-1">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => {
              setTab(t);
              setPage(1);
            }}
            className={cn(
              'shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
              tab === t
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl bg-white shadow-sm">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner />
          </div>
        ) : bookings.length === 0 ? (
          <EmptyState icon="📋" title="No bookings found" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-100 bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Ref</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Email</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Trip</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Departure</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Travellers</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Total</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Payment</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {bookings.map((b) => (
                  <tr key={b._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs text-gray-600">{b.bookingRef}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{b.contactEmail}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {b.tripSnapshot?.title ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {b.departureDate ? formatDate(b.departureDate) : '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{b.travellersCount}</td>
                    <td className="px-4 py-3 text-gray-600">{formatCurrency(b.totalAmount)}</td>
                    <td className="px-4 py-3">
                      <Badge status={b.status} />
                    </td>
                    <td className="px-4 py-3">
                      <Badge status={b.paymentStatus} />
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {b.createdAt ? formatDate(b.createdAt) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="mt-6">
          <Pagination page={page} totalPages={pagination.totalPages} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
}
