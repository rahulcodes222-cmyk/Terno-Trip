'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { adminUpdateTrip, adminGetTripById } from '@/lib/admin-api';
import TripForm from '@/components/admin/TripForm';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import type { ITrip } from '@/types';

function extractErrorMessage(err: unknown): string {
  if (err && typeof err === 'object') {
    const e = err as { response?: { data?: { message?: string } }; message?: string };
    return e.response?.data?.message ?? e.message ?? 'Something went wrong';
  }
  return 'Something went wrong';
}

interface EditTripPageProps {
  params: { id: string };
}

export default function EditTripPage({ params }: EditTripPageProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  // Fetch the specific trip by ID via the admin endpoint
  const { data: trip, isLoading, isError } = useQuery<ITrip>({
    queryKey: ['admin', 'trip', params.id],
    queryFn: () => adminGetTripById(params.id),
    retry: false,
  });

  const handleSubmit = async (data: Partial<ITrip>) => {
    setIsSubmitting(true);
    setServerError('');
    try {
      await adminUpdateTrip(params.id, data);
      router.push('/admin/trips');
    } catch (err) {
      setServerError(extractErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner fullPage />;
  }

  if (isError || !trip) {
    return (
      <div className="p-6 md:p-8">
        <EmptyState
          icon="🔍"
          title="Trip not found"
          action={{ label: 'Back to Trips', onClick: () => router.push('/admin/trips') }}
        />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <Link
          href="/admin/trips"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <ChevronLeft className="h-4 w-4" />
          Trips
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Trip</h1>
      </div>

      <div className="rounded-xl bg-white p-6 shadow-sm">
        <TripForm
          defaultValues={trip}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          serverError={serverError}
          submitLabel="Save Changes"
        />
      </div>
    </div>
  );
}
