'use client';

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, RefreshCw } from 'lucide-react';
import { adminGetAllBookings } from '@/lib/admin-api';
import Badge from '@/components/ui/Badge';
import Pagination from '@/components/ui/Pagination';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import type { IBooking } from '@/types';

type StatusTab = 'All' | 'Pending' | 'Confirmed' | 'Cancelled' | 'Refunded';
const TABS: StatusTab[] = ['All', 'Confirmed', 'Pending', 'Cancelled', 'Refunded'];

const STATUS_COLORS: Record<string, string> = {
  Confirmed: 'bg-green-100 text-green-700',
  Pending:   'bg-yellow-100 text-yellow-700',
  Cancelled: 'bg-red-100 text-red-700',
  Refunded:  'bg-gray-100 text-gray-600',
};

const PAYMENT_COLORS: Record<string, string> = {
  Paid:     'bg-green-100 text-green-700',
  Pending:  'bg-yellow-100 text-yellow-700',
  Failed:   'bg-red-100 text-red-700',
  Refunded: 'bg-gray-100 text-gray-600',
};

export default function AdminBookingsPage() {
  const [page, setPage]             = useState(1);
  const [tab, setTab]               = useState<StatusTab>('All');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch]           = useState('');

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'bookings', page, tab, search],
    queryFn: () => adminGetAllBookings({
      page,
      limit: 20,
      status: tab === 'All' ? undefined : tab,
      search: search || undefined,
    }),
    retry: 1,
  });

  const bookings: IBooking[] = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <div className="p-6 md:p-8">

      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Bookings</h1>
          <p className="mt-1 text-sm text-gray-500">
            {pagination ? `${pagination.total} total booking${pagination.total !== 1 ? 's' : ''}` : 'All customer bookings'}
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      {/* Search + Tabs */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Search */}
        <div className="flex flex-1 items-center gap-2 rounded-xl bg-white px-4 py-2.5 shadow-sm">
          <Search className="h-4 w-4 shrink-0 text-gray-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by booking ref, email, or trip name..."
            className="flex-1 bg-transparent text-sm placeholder:text-gray-400 focus:outline-none"
          />
        </div>

        {/* Status Tabs */}
        <div className="flex gap-1 rounded-xl bg-gray-100 p-1 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setPage(1); }}
              className={cn(
                'shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap',
                tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Error state */}
      {isError && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          ❌ Failed to load bookings. Make sure you are logged in as admin.
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-xl bg-white shadow-sm">
        {isLoading ? (
          <div className="flex justify-center py-16"><LoadingSpinner /></div>
        ) : bookings.length === 0 ? (
          <EmptyState icon="📋" title="No bookings found" message={search ? `No results for "${search}"` : 'No bookings in this category yet.'} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-100 bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">#</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Booking Ref</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Trip</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Departure</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Travellers</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Payment</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Booked On</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {bookings.map((b, idx) => (
                  <tr key={b._id} className="hover:bg-gray-50 transition-colors">
                    {/* Row number */}
                    <td className="px-4 py-3 text-xs text-gray-400">
                      {((page - 1) * 20) + idx + 1}
                    </td>

                    {/* Booking ref */}
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs font-semibold text-gray-700 bg-gray-100 px-2 py-0.5 rounded">
                        {b.bookingRef}
                      </span>
                    </td>

                    {/* Customer */}
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-900">{b.contactEmail}</p>
                      {b.travellers?.[0] && (
                        <p className="text-xs text-gray-400">
                          {b.travellers[0].firstName} {b.travellers[0].lastName}
                        </p>
                      )}
                    </td>

                    {/* Trip */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {b.tripSnapshot?.coverImage && (
                          <img
                            src={b.tripSnapshot.coverImage}
                            alt={b.tripSnapshot.title}
                            className="h-8 w-10 shrink-0 rounded object-cover"
                          />
                        )}
                        <div>
                          <p className="font-medium text-gray-900 line-clamp-1 max-w-[160px]">
                            {b.tripSnapshot?.title ?? '—'}
                          </p>
                          <p className="text-xs text-gray-400">{b.tripSnapshot?.destination ?? ''}</p>
                        </div>
                      </div>
                    </td>

                    {/* Departure */}
                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                      {b.departureDate ? formatDate(b.departureDate) : '—'}
                    </td>

                    {/* Travellers */}
                    <td className="px-4 py-3 text-center text-sm text-gray-600">
                      {b.travellersCount ?? b.travellers?.length ?? '—'}
                    </td>

                    {/* Amount */}
                    <td className="px-4 py-3 font-semibold whitespace-nowrap" style={{ color: '#FF6B00' }}>
                      {formatCurrency(b.totalAmount)}
                    </td>

                    {/* Booking status */}
                    <td className="px-4 py-3">
                      <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-semibold', STATUS_COLORS[b.status] ?? 'bg-gray-100 text-gray-600')}>
                        {b.status}
                      </span>
                    </td>

                    {/* Payment status */}
                    <td className="px-4 py-3">
                      <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-semibold', PAYMENT_COLORS[b.paymentStatus] ?? 'bg-gray-100 text-gray-600')}>
                        {b.paymentStatus}
                      </span>
                    </td>

                    {/* Created at */}
                    <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
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
