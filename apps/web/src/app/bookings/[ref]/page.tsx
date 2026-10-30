'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, Calendar, Users, MapPin, CreditCard } from 'lucide-react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import PageLayout from '@/components/layout/PageLayout';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useBooking, useCancelBooking } from '@/hooks/useBookings';
import { formatDate, formatCurrency } from '@/lib/utils';

export default function BookingDetailPage() {
  return (
    <ProtectedRoute>
      <BookingDetailContent />
    </ProtectedRoute>
  );
}

function BookingDetailContent() {
  const { ref } = useParams<{ ref: string }>();
  const router = useRouter();
  const { data: booking, isLoading } = useBooking(ref);
  const cancelBooking = useCancelBooking();
  const [showCancel, setShowCancel] = useState(false);

  if (isLoading) return <PageLayout><LoadingSpinner fullPage /></PageLayout>;
  if (!booking) {
    return (
      <PageLayout>
        <div className="p-8 text-center">
          <p className="text-gray-500">Booking not found.</p>
          <Button variant="primary" className="mt-4" onClick={() => router.push('/bookings')}>
            My Bookings
          </Button>
        </div>
      </PageLayout>
    );
  }

  const handleCancel = async () => {
    await cancelBooking.mutateAsync(booking._id);
    setShowCancel(false);
    router.push('/bookings');
  };

  return (
    <PageLayout>
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Back */}
        <button
          onClick={() => router.push('/bookings')}
          className="mb-6 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4" /> Back to My Bookings
        </button>

        {/* Header */}
        <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{booking.tripSnapshot.title}</h1>
            <p className="mt-1 font-mono text-sm text-gray-500">{booking.bookingRef}</p>
          </div>
          <Badge status={booking.status} />
        </div>

        {/* Trip Image */}
        <div className="relative mb-6 h-48 overflow-hidden rounded-2xl">
          <Image
            src={booking.tripSnapshot.coverImage}
            alt={booking.tripSnapshot.title}
            fill
            className="object-cover"
            sizes="100vw"
          />
        </div>

        {/* Info Grid */}
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { icon: <MapPin className="h-4 w-4" />, label: 'Destination', value: booking.tripSnapshot.destination },
            { icon: <Calendar className="h-4 w-4" />, label: 'Departure', value: formatDate(booking.departureDate) },
            { icon: <Users className="h-4 w-4" />, label: 'Travellers', value: String(booking.travellersCount) },
            { icon: <CreditCard className="h-4 w-4" />, label: 'Payment', value: booking.paymentStatus },
          ].map((item) => (
            <div key={item.label} className="rounded-xl bg-gray-50 p-3">
              <div className="mb-1 flex items-center gap-1 text-xs text-gray-400">
                {item.icon} {item.label}
              </div>
              <div className="text-sm font-semibold text-gray-900">{item.value}</div>
            </div>
          ))}
        </div>

        {/* Travellers */}
        <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-semibold text-gray-900">Traveller Information</h2>
          <div className="space-y-3">
            {booking.travellers.map((t, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {t.firstName} {t.lastName}
                  </p>
                  <p className="text-xs text-gray-500">Age: {t.age}</p>
                </div>
                <span className="text-xs text-gray-400">Traveller {i + 1}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Price Summary */}
        <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-semibold text-gray-900">Payment Summary</h2>
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Base amount</span>
            <span>{formatCurrency(booking.tripSnapshot.pricePerPerson * booking.travellersCount)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold text-gray-900 border-t pt-3">
            <span>Total Paid</span>
            <span className="text-primary">{formatCurrency(booking.totalAmount)}</span>
          </div>
        </div>

        {/* Contact */}
        <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="mb-3 font-semibold text-gray-900">Contact Details</h2>
          <p className="text-sm text-gray-600">{booking.contactEmail}</p>
          <p className="text-sm text-gray-600">{booking.contactPhone}</p>
        </div>

        {/* Actions */}
        {(booking.status === 'Pending' || booking.status === 'Confirmed') && (
          <Button
            variant="danger"
            className="w-full"
            onClick={() => setShowCancel(true)}
          >
            Cancel Booking
          </Button>
        )}
      </div>

      <Modal isOpen={showCancel} onClose={() => setShowCancel(false)} title="Cancel Booking" size="sm">
        <p className="mb-6 text-sm text-gray-600">
          Cancel booking <span className="font-mono font-medium">{booking.bookingRef}</span>? This cannot be undone.
        </p>
        <div className="flex gap-3">
          <Button variant="ghost" className="flex-1" onClick={() => setShowCancel(false)}>Keep It</Button>
          <Button variant="danger" className="flex-1" loading={cancelBooking.isPending} onClick={handleCancel}>
            Yes, Cancel
          </Button>
        </div>
      </Modal>
    </PageLayout>
  );
}
