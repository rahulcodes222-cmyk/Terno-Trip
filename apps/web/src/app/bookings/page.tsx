'use client';

import React, { useState } from 'react';
import PageLayout from '@/components/layout/PageLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import BookingCard from '@/components/bookings/BookingCard';
import Pagination from '@/components/ui/Pagination';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { useMyBookings, useCancelBooking } from '@/hooks/useBookings';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

type Tab = 'All' | 'Upcoming' | 'Confirmed' | 'Cancelled';
const TABS: Tab[] = ['All', 'Upcoming', 'Confirmed', 'Cancelled'];

export default function BookingsPage() {
  return (
    <ProtectedRoute>
      <BookingsContent />
    </ProtectedRoute>
  );
}

function BookingsContent() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [tab, setTab] = useState<Tab>('All');
  const [cancelId, setCancelId] = useState<string | null>(null);

  const { data, isLoading } = useMyBookings(page);
  const cancelBooking = useCancelBooking();

  const bookings = data?.data ?? [];
  const pagination = data?.pagination;

  const filtered = bookings.filter((b) => {
    if (tab === 'All') return true;
    if (tab === 'Upcoming') return b.status === 'Pending' || b.status === 'Confirmed';
    if (tab === 'Confirmed') return b.status === 'Confirmed';
    if (tab === 'Cancelled') return b.status === 'Cancelled';
    return true;
  });

  const handleCancel = async () => {
    if (!cancelId) return;
    await cancelBooking.mutateAsync(cancelId);
    setCancelId(null);
  };

  return (
    <PageLayout>
      {/* Header */}
      <div className="bg-[#0A0A0A] py-10">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-[#FF6B00]">My Account</p>
          <h1 className="text-3xl font-extrabold text-white">My Bookings</h1>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Tabs */}
        <div className="mb-6 flex gap-1 overflow-x-auto rounded-xl bg-gray-100 p-1">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setPage(1); }}
              className={cn(
                'shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              )}
            >
              {t}
            </button>
          ))}
        </div>

        {isLoading ? (
          <LoadingSpinner fullPage />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="🎒"
            title="No bookings yet"
            message="Book your first India trip and start exploring!"
            action={{ label: 'Browse Trips', onClick: () => router.push('/trips') }}
          />
        ) : (
          <div className="space-y-4">
            {filtered.map((b) => (
              <BookingCard key={b._id} booking={b} onCancel={(id) => setCancelId(id)} />
            ))}
          </div>
        )}

        {pagination && pagination.totalPages > 1 && (
          <div className="mt-8">
            <Pagination page={page} totalPages={pagination.totalPages} onPageChange={setPage} />
          </div>
        )}
      </div>

      <Modal isOpen={!!cancelId} onClose={() => setCancelId(null)} title="Cancel Booking" size="sm">
        <p className="mb-6 text-sm text-gray-600">
          Are you sure you want to cancel this booking? This may be subject to the cancellation policy.
        </p>
        <div className="flex gap-3">
          <Button variant="ghost" className="flex-1" onClick={() => setCancelId(null)}>Keep Booking</Button>
          <Button variant="danger" className="flex-1" loading={cancelBooking.isPending} onClick={handleCancel}>Yes, Cancel</Button>
        </div>
      </Modal>
    </PageLayout>
  );
}
