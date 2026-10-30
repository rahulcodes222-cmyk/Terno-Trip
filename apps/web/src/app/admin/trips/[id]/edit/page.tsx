'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, CheckCircle } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { adminUpdateTrip, adminGetTripById } from '@/lib/admin-api';
import TripForm from '@/components/admin/TripForm';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import type { ITrip } from '@/types';

interface Props { params: { id: string } }

export default function EditTripPage({ params }: Props) {
  const router      = useRouter();
  const qc          = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError]   = useState('');
  const [saved, setSaved]               = useState(false);

  const { data: trip, isLoading, isError } = useQuery<ITrip>({
    queryKey: ['admin', 'trip', params.id],
    queryFn:  () => adminGetTripById(params.id),
    retry: false,
  });

  const handleSubmit = async (data: Partial<ITrip>) => {
    setIsSubmitting(true);
    setServerError('');
    try {
      await adminUpdateTrip(params.id, data);
      qc.invalidateQueries({ queryKey: ['trips'] });
      qc.invalidateQueries({ queryKey: ['admin', 'trip', params.id] });
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        router.push('/admin/trips');
      }, 1500);
    } catch (err) {
      const e = err as { response?: { data?: { message?: string } }; message?: string };
      setServerError(e.response?.data?.message ?? e.message ?? 'Failed to update trip.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  );

  if (isError || !trip) return (
    <div className="p-8">
      <EmptyState
        icon="🔍"
        title="Trip not found"
        message="This trip may have been deleted or the ID is invalid."
        action={{ label: 'Back to Trips', onClick: () => router.push('/admin/trips') }}
      />
    </div>
  );

  return (
    <div className="p-6 md:p-8">

      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <Link
          href="/admin/trips"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <ChevronLeft className="h-4 w-4" /> Trips
        </Link>
        <div className="flex items-center gap-3">
          <img
            src={trip.coverImage || 'https://picsum.photos/seed/trip/60/40'}
            alt={trip.title}
            className="h-9 w-12 rounded-lg object-cover"
          />
          <div>
            <h1 className="text-xl font-bold text-gray-900">Edit Trip</h1>
            <p className="text-xs text-gray-400">{trip.title} · {trip.destination}</p>
          </div>
        </div>

        {saved && (
          <div className="ml-auto flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-sm font-medium text-green-700">
            <CheckCircle className="h-4 w-4" /> Saved! Redirecting…
          </div>
        )}
      </div>

      {/* Form card */}
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <TripForm
          defaultValues={trip}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          serverError={serverError}
          submitLabel={isSubmitting ? 'Saving…' : 'Save Changes'}
        />
      </div>
    </div>
  );
}
