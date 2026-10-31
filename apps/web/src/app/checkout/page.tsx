'use client';

import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MapPin, Clock, Users, AlertTriangle } from 'lucide-react';
import Image from 'next/image';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import PageLayout from '@/components/layout/PageLayout';
import PaymentModal from '@/components/checkout/PaymentModal';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useTrip } from '@/hooks/useTrips';
import { useCreateBooking } from '@/hooks/useBookings';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency, formatDate } from '@/lib/utils';

const travellerSchema = z.object({
  firstName: z.string().min(2, 'Required'),
  lastName: z.string().min(2, 'Required'),
  age: z.coerce.number().min(1, 'Required').max(120, 'Invalid age'),
});

const checkoutSchema = z.object({
  travellers: z.array(travellerSchema),
  contactEmail: z.string().email('Valid email required'),
  // Strip spaces/dashes before validation so +91 98765 43210 works
  contactPhone: z
    .string()
    .min(10, 'Valid phone required')
    .transform((v) => v.replace(/[\s\-()]/g, '')),
  specialRequests: z.string().optional(),
  agreePolicy: z.boolean().refine((v) => v, 'You must acknowledge the cancellation policy'),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  return (
    <ProtectedRoute>
      <CheckoutContent />
    </ProtectedRoute>
  );
}

function CheckoutContent() {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const tripSlug = searchParams.get('tripSlug') ?? '';
  const departureDate = searchParams.get('date') ?? '';
  const travellersCount = Number(searchParams.get('travellers') ?? '1');

  const { data: trip, isLoading } = useTrip(tripSlug);
  const createBooking = useCreateBooking();

  const [paymentOpen, setPaymentOpen] = useState(false);
  const [createdBookingRef, setCreatedBookingRef] = useState('');
  const [createdAmount, setCreatedAmount] = useState(0);
  const [bookingError, setBookingError] = useState('');

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      travellers: Array.from({ length: travellersCount }, () => ({
        firstName: '',
        lastName: '',
        age: undefined as unknown as number,
      })),
      contactEmail: user?.email ?? '',
      contactPhone: '',
      agreePolicy: false,
    },
  });

  const { fields } = useFieldArray({ control, name: 'travellers' });

  if (isLoading) return <PageLayout><LoadingSpinner fullPage /></PageLayout>;
  if (!trip) {
    return <PageLayout><p className="p-8 text-center text-gray-500">Trip not found.</p></PageLayout>;
  }

  const effectivePrice = trip.discountPrice ?? trip.pricePerPerson;
  const taxes = Math.round(effectivePrice * travellersCount * 0.05);
  const total = effectivePrice * travellersCount + taxes;

  const onSubmit = async (data: CheckoutForm) => {
    setBookingError('');
    try {
      // Server requires full ISO 8601 datetime — convert YYYY-MM-DD from URL
      const departureDateISO = departureDate.includes('T')
        ? departureDate
        : new Date(departureDate + 'T00:00:00.000Z').toISOString();

      const booking = await createBooking.mutateAsync({
        tripId: trip._id,
        departureDate: departureDateISO,
        travellers: data.travellers.map((t) => ({
          firstName: t.firstName,
          lastName: t.lastName,
          age: Number(t.age), // ensure number type for server z.number()
        })),
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone, // already stripped of spaces by zod transform
        specialRequests: data.specialRequests,
      });
      setCreatedBookingRef(booking.bookingRef);
      setCreatedAmount(booking.totalAmount);
      setPaymentOpen(true);
    } catch (err: unknown) {
      setBookingError(
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Failed to create booking. Please try again.'
      );
    }
  };

  return (
    <PageLayout>
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Checkout</h1>

        <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
          {/* Form */}
          <div className="flex-1">
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              {bookingError && (
                <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                  {bookingError}
                </div>
              )}

              {/* Travellers */}
              <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <h2 className="mb-4 flex items-center gap-2 font-semibold text-gray-900">
                  <Users className="h-5 w-5 text-[#FF6B00]" /> Traveller Details
                </h2>
                {fields.map((field, i) => (
                  <div key={field.id} className="mb-4 rounded-xl bg-gray-50 p-4">
                    <p className="mb-3 text-sm font-medium text-gray-600">
                      Traveller {i + 1}
                    </p>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                      <Input
                        label="First Name"
                        placeholder="Rahul"
                        error={errors.travellers?.[i]?.firstName?.message}
                        {...register(`travellers.${i}.firstName`)}
                      />
                      <Input
                        label="Last Name"
                        placeholder="Sharma"
                        error={errors.travellers?.[i]?.lastName?.message}
                        {...register(`travellers.${i}.lastName`)}
                      />
                      <Input
                        label="Age"
                        type="number"
                        placeholder="25"
                        error={errors.travellers?.[i]?.age?.message}
                        {...register(`travellers.${i}.age`)}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Contact */}
              <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <h2 className="mb-4 font-semibold text-gray-900">Contact Information</h2>
                <div className="space-y-4">
                  <Input
                    label="Email"
                    type="email"
                    placeholder="you@example.com"
                    error={errors.contactEmail?.message}
                    {...register('contactEmail')}
                  />
                  <Input
                    label="Phone Number"
                    type="tel"
                    placeholder="+919876543210"
                    error={errors.contactPhone?.message}
                    {...register('contactPhone')}
                  />
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Special Requests (optional)
                    </label>
                    <textarea
                      placeholder="Any dietary requirements, accessibility needs..."
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#FF6B00] focus:outline-none focus:ring-1 focus:ring-[#FF6B00]"
                      rows={3}
                      {...register('specialRequests')}
                    />
                  </div>
                </div>
              </div>

              {/* Policy Ack */}
              <div className="mb-6 rounded-xl border border-amber-100 bg-amber-50 p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                  <div>
                    <p className="mb-2 text-sm font-medium text-amber-800">Cancellation Policy</p>
                    <p className="text-xs text-amber-700">{trip.cancellationPolicy}</p>
                    <label className="mt-3 flex items-start gap-2 cursor-pointer text-sm">
                      <input
                        type="checkbox"
                        className="mt-0.5 accent-[#FF6B00]"
                        {...register('agreePolicy')}
                      />
                      <span className="text-amber-800">
                        I have read and agree to the cancellation policy
                      </span>
                    </label>
                    {errors.agreePolicy && (
                      <p className="mt-1 text-xs text-red-600">{errors.agreePolicy.message}</p>
                    )}
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={isSubmitting}
                className="w-full"
              >
                Continue to Payment — {formatCurrency(total)}
              </Button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:w-80 xl:w-96">
            <div className="sticky top-24 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h2 className="mb-4 font-semibold text-gray-900">Order Summary</h2>

              <div className="relative mb-4 h-36 overflow-hidden rounded-xl">
                <Image src={trip.coverImage} alt={trip.title} fill className="object-cover" sizes="384px" />
              </div>

              <h3 className="mb-1 font-semibold text-gray-900">{trip.title}</h3>
              <div className="mb-4 space-y-1 text-xs text-gray-500">
                <div className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {trip.destination}</div>
                <div className="flex items-center gap-1"><Clock className="h-3 w-3" /> {trip.duration} Days</div>
                <div className="flex items-center gap-1"><Users className="h-3 w-3" /> {travellersCount} Traveller{travellersCount > 1 ? 's' : ''}</div>
                <div>Departure: {formatDate(departureDate)}</div>
              </div>

              <div className="space-y-2 border-t pt-4 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>{formatCurrency(effectivePrice)} × {travellersCount}</span>
                  <span>{formatCurrency(effectivePrice * travellersCount)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>GST (5%)</span>
                  <span>{formatCurrency(taxes)}</span>
                </div>
                <div className="flex justify-between border-t pt-2 font-bold text-gray-900">
                  <span>Total</span>
                  <span className="text-[#FF6B00]">{formatCurrency(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {createdBookingRef && (
        <PaymentModal
          isOpen={paymentOpen}
          onClose={() => setPaymentOpen(false)}
          bookingRef={createdBookingRef}
          tripTitle={trip.title}
          amount={createdAmount}
        />
      )}
    </PageLayout>
  );
}
