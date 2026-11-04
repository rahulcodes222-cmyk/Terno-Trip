'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MapPin, Clock, Users, Star, AlertTriangle, Calendar } from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import TripImageGallery from '@/components/trips/TripImageGallery';
import ItineraryAccordion from '@/components/trips/ItineraryAccordion';
import InclusionsExclusions from '@/components/trips/InclusionsExclusions';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Button from '@/components/ui/Button';
import { useTrip } from '@/hooks/useTrips';
import { useAuth } from '@/contexts/AuthContext';
import { saveBookingIntent } from '@/lib/session-storage';
import { formatCurrency, formatDate, getDifficultyColor, getCategoryIcon } from '@/lib/utils';

export default function TripDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const { data: trip, isLoading, error } = useTrip(slug);
  const [selectedDate, setSelectedDate] = useState('');
  const [travellers, setTravellers] = useState(1);

  // Debug log
  React.useEffect(() => {
    if (trip) {
      console.log('Trip loaded:', {
        title: trip.title,
        price: trip.pricePerPerson,
        itinerary: trip.itinerary?.length ?? 0,
        startDates: trip.startDates?.length ?? 0,
      });
    }
  }, [trip]);

  if (isLoading) return <PageLayout><LoadingSpinner fullPage /></PageLayout>;
  if (error || !trip) {
    return (
      <PageLayout>
        <div className="flex min-h-[60vh] flex-col items-center justify-center text-center px-4">
          <p className="text-gray-500">Trip not found.</p>
          <Button variant="primary" className="mt-4" onClick={() => router.push('/trips')}>
            Browse All Trips
          </Button>
        </div>
      </PageLayout>
    );
  }

  const effectivePrice = (trip.discountPrice && trip.discountPrice > 0) 
    ? trip.discountPrice 
    : (trip.pricePerPerson && trip.pricePerPerson > 0) 
    ? trip.pricePerPerson 
    : 1000;
  const displayPrice = effectivePrice;
  const taxes = Math.round(displayPrice * travellers * 0.05);
  const total = displayPrice * travellers + taxes;

  // Get available seats for selected date
  const getSeatsForDate = (date: string): number => {
    if (!date) return 0;
    const byDateSeats = trip.seatsByStartDate?.find(
      (s) => new Date(s.startDate).toISOString().split('T')[0] === new Date(date).toISOString().split('T')[0]
    );
    return byDateSeats ? byDateSeats.availableSeats : trip.availableSeats;
  };

  const seats = getSeatsForDate(selectedDate);
  const isSoldOut: boolean = selectedDate !== '' && seats === 0;
  const isLowStock: boolean = selectedDate !== '' && seats > 0 && seats <= 5;

  // Format departure time
  const formatDepartureTime = (time?: string): string => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const handleBookNow = () => {
    if (!selectedDate) {
      alert('Please select a departure date');
      return;
    }

    // Check available seats for selected date
    const availableSeats = getSeatsForDate(selectedDate);
    
    // Check if travellers exceed available seats
    if (travellers > availableSeats) {
      alert(`Only ${availableSeats} seat${availableSeats !== 1 ? 's' : ''} available for selected date. Please reduce number of travellers.`);
      return;
    }

    // Check if travellers exceed max group size
    if (travellers > trip.maxGroupSize) {
      alert(`Maximum ${trip.maxGroupSize} traveller${trip.maxGroupSize !== 1 ? 's' : ''} allowed per booking.`);
      return;
    }

    if (!isAuthenticated) {
      saveBookingIntent({
        tripId: trip._id,
        tripSlug: trip.slug,
        departureDate: selectedDate,
        travellersCount: travellers,
      });
      router.push(`/auth/login?returnUrl=${encodeURIComponent(`/trips/${slug}`)}`);
      return;
    }

    router.push(
      `/checkout?tripSlug=${trip.slug}&date=${selectedDate}&travellers=${travellers}`
    );
  };

  return (
    <PageLayout>
      <div className="mx-auto max-w-container px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Main Content */}
          <div className="flex-1 min-w-0 space-y-8">
            {/* Gallery */}
            <TripImageGallery
              images={[trip.coverImage, ...(trip.images ?? [])]}
              title={trip.title}
            />

            {/* Header */}
            <div>
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary">
                  {getCategoryIcon(trip.category)} {trip.category}
                </span>
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${getDifficultyColor(trip.difficulty)}`}>
                  {trip.difficulty}
                </span>
              </div>
              <h1 className="mb-2 text-2xl font-extrabold text-gray-900 sm:text-3xl">
                {trip.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" /> {trip.destination}, {trip.country}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" /> {trip.duration} Days / {trip.nights} Nights
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" /> Max {trip.maxGroupSize} people
                </span>
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  {trip.ratingsAverage.toFixed(1)} ({trip.ratingsQuantity} reviews)
                </span>
              </div>
            </div>

            {/* Description */}
            <section>
              <h2 className="mb-3 text-lg font-bold text-gray-900">About This Trip</h2>
              <p className="text-sm leading-relaxed text-gray-600">{trip.description}</p>
            </section>

            {/* Highlights */}
            {(trip.highlights ?? []).length > 0 && (
              <section>
                <h2 className="mb-3 text-lg font-bold text-gray-900">Trip Highlights</h2>
                <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {(trip.highlights ?? []).map((h, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-primary">✓</span> {h}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Itinerary */}
            <section>
              <h2 className="mb-4 text-lg font-bold text-gray-900">Day-by-Day Itinerary</h2>
              <ItineraryAccordion itinerary={trip.itinerary ?? []} />
            </section>

            {/* Inclusions / Exclusions */}
            <section>
              <h2 className="mb-4 text-lg font-bold text-gray-900">What&apos;s Included</h2>
              <InclusionsExclusions inclusions={trip.inclusions ?? []} exclusions={trip.exclusions ?? []} />
            </section>

            {/* Cancellation Policy */}
            <section className="rounded-xl border border-amber-100 bg-amber-50 p-4">
              <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-amber-800">
                <AlertTriangle className="h-4 w-4" /> Cancellation Policy
              </h2>
              <p className="text-sm text-amber-700">{trip.cancellationPolicy}</p>
            </section>
          </div>

          {/* Booking Sidebar */}
          <aside className="lg:w-80 xl:w-96">
            <div className="sticky top-24 rounded-2xl border border-gray-100 bg-white p-6 shadow-lg">
              {/* Price */}
              <div className="mb-5 border-b pb-5">
                {trip.discountPrice && trip.discountPrice > 0 ? (
                  <div>
                    <span className="text-sm text-gray-400 line-through">
                      {formatCurrency(trip.pricePerPerson || 1000)}
                    </span>
                    <div className="text-3xl font-extrabold text-primary">
                      {formatCurrency(trip.discountPrice)}
                    </div>
                  </div>
                ) : (
                  <div className="text-3xl font-extrabold text-primary">
                    {formatCurrency(displayPrice)}
                  </div>
                )}
                <p className="text-xs text-gray-400">per person</p>
                {trip.departureTime && (
                  <p className="mt-2 text-xs text-gray-600">
                    <Clock className="mr-1 inline h-3 w-3" /> Departs at {formatDepartureTime(trip.departureTime)}
                  </p>
                )}
                {isSoldOut && (
                  <p className="mt-1 text-xs font-semibold text-red-600">
                    Sold out for this date — please select another date
                  </p>
                )}
                {isLowStock && (
                  <p className="mt-1 text-xs font-semibold text-orange-500">
                    Only {seats} seat{seats !== 1 ? 's' : ''} left!
                  </p>
                )}
                {!isSoldOut && !isLowStock && selectedDate && (
                  <p className="mt-1 text-xs text-green-600">{seats} seats available</p>
                )}
                {!selectedDate && (
                  <p className="mt-1 text-xs text-gray-400">Select a date to check availability</p>
                )}
              </div>

              {/* Date Picker */}
              <div className="mb-4">
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  <Calendar className="mr-1 inline h-4 w-4" /> Departure Date
                </label>
                <select
                  value={selectedDate}
                  onChange={(e) => {
                    const newDate = e.target.value;
                    setSelectedDate(newDate);
                    
                    // Reset travellers or adjust if they exceed available seats
                    if (newDate) {
                      const availableSeats = getSeatsForDate(newDate);
                      if (travellers > availableSeats) {
                        // Show alert if travellers exceed available seats
                        if (travellers > 1 && availableSeats > 0) {
                          alert(`Only ${availableSeats} seat${availableSeats !== 1 ? 's' : ''} available for selected date. Adjusting travellers to ${availableSeats}.`);
                        }
                        setTravellers(Math.min(availableSeats, trip.maxGroupSize));
                      }
                    }
                  }}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="">Select a date</option>
                  {(trip.startDates ?? []).map((d) => {
                    const seatsForDate = getSeatsForDate(d);
                    const isSoldOutDate = seatsForDate === 0;
                    return (
                      <option 
                        key={d} 
                        value={d} 
                        disabled={isSoldOutDate}
                        className={isSoldOutDate ? 'text-gray-400' : ''}
                      >
                        {formatDate(d)} {isSoldOutDate ? '— Sold out' : `(${seatsForDate} seats)`}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Travellers */}
              <div className="mb-5">
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  <Users className="mr-1 inline h-4 w-4" /> Travellers
                </label>
                <div className="flex items-center gap-3 rounded-lg border border-gray-300 p-2">
                  <button
                    onClick={() => setTravellers(Math.max(1, travellers - 1))}
                    disabled={travellers <= 1}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    −
                  </button>
                  <span className="flex-1 text-center text-sm font-medium">{travellers}</span>
                  <button
                    onClick={() => {
                      // Get available seats for selected date
                      const availableSeats = getSeatsForDate(selectedDate);
                      // Limit by both maxGroupSize AND available seats
                      const maxAllowed = Math.min(trip.maxGroupSize, availableSeats);
                      setTravellers(Math.min(maxAllowed, travellers + 1));
                    }}
                    disabled={!selectedDate || travellers >= Math.min(trip.maxGroupSize, getSeatsForDate(selectedDate))}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    +
                  </button>
                </div>
                {selectedDate ? (
                  <div className="mt-1">
                    <p className="text-xs text-gray-500">
                      Maximum: {Math.min(trip.maxGroupSize, getSeatsForDate(selectedDate))} traveller(s) allowed
                      {getSeatsForDate(selectedDate) === 1 ? " (only 1 seat available)" : ""}
                    </p>
                    {travellers > getSeatsForDate(selectedDate) && (
                      <p className="mt-1 text-xs font-semibold text-red-600">
                        ⚠️ Exceeds available seats! Only {getSeatsForDate(selectedDate)} seat{getSeatsForDate(selectedDate) !== 1 ? 's' : ''} left.
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="mt-1 text-xs text-gray-400">Select a date first</p>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="mb-5 space-y-2 rounded-xl bg-gray-50 p-4 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>{formatCurrency(displayPrice)} × {travellers}</span>
                  <span>{formatCurrency(displayPrice * travellers)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Taxes & Fees (5%)</span>
                  <span>{formatCurrency(taxes)}</span>
                </div>
                <div className="flex justify-between border-t pt-2 font-bold text-gray-900">
                  <span>Total</span>
                  <span className="text-primary">{formatCurrency(total)}</span>
                </div>
              </div>

              <Button
                variant="primary"
                size="lg"
                className="w-full disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleBookNow}
                disabled={isSoldOut || !selectedDate || travellers > getSeatsForDate(selectedDate) || travellers > trip.maxGroupSize}
              >
                Book Now
                {(!selectedDate || travellers > getSeatsForDate(selectedDate) || travellers > trip.maxGroupSize) && !isSoldOut ? 
                  " (Check travellers)" : ""}
              </Button>
              <p className="mt-2 text-center text-xs text-gray-400">
                No charges until payment step
              </p>
            </div>
          </aside>
        </div>

        {/* Mobile sticky bar */}
        <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-gray-100 bg-white p-4 shadow-2xl lg:hidden">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-bold text-primary">{formatCurrency(total)}</div>
              <div className="text-xs text-gray-400">for {travellers} person{travellers !== 1 ? 's' : ''}</div>
            </div>
            <Button variant="primary" size="lg" onClick={handleBookNow} 
              disabled={isSoldOut || !selectedDate || travellers > getSeatsForDate(selectedDate) || travellers > trip.maxGroupSize}>
              Book Now
              {(!selectedDate || travellers > getSeatsForDate(selectedDate) || travellers > trip.maxGroupSize) && !isSoldOut ? 
                " (Check travellers)" : ""}
            </Button>
          </div>
        </div>
        <div className="h-20 lg:hidden" />
      </div>
    </PageLayout>
  );
}
