import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';
import type { ITrip } from '@/types';

interface TripCardUpcomingProps {
  trip: ITrip;
  variant: 'upcoming' | 'completed';
}

function getMonthYear(dateStr: string | undefined): string {
  if (!dateStr) return 'TBA';
  try {
    return new Date(dateStr)
      .toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
      .toUpperCase();
  } catch {
    return 'TBA';
  }
}

export default function TripCardUpcoming({ trip, variant }: TripCardUpcomingProps) {
  const monthYear = getMonthYear(trip.startDates[0]);
  const bannerLabel = variant === 'upcoming'
    ? `UPCOMING · ${monthYear}`
    : `COMPLETED · ${monthYear}`;

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white transition-shadow hover:shadow-lg sm:flex-row">
      {/* Left — image */}
      <div className="relative h-48 w-full shrink-0 sm:h-auto sm:w-64">
        <Image
          src={trip.coverImage}
          alt={trip.title}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, 256px"
        />
        {/* Banner pill */}
        <div className="absolute left-3 top-3">
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-bold text-white ${
              variant === 'upcoming' ? 'bg-primary' : 'bg-gray-600'
            }`}
          >
            {bannerLabel}
          </span>
        </div>
      </div>

      {/* Right — content */}
      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-primary">
            {trip.destination}
          </p>
          <h3 className="mb-1 text-lg font-bold text-gray-900 line-clamp-1">{trip.title}</h3>
          <p className="text-sm text-gray-500 line-clamp-2">{trip.shortDescription}</p>
        </div>

        <div className="mt-4">
          <div className="mb-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
            <span>⏱ {trip.duration} Days / {trip.nights} Nights</span>
            {variant === 'upcoming' && (
              <span>👥 {trip.availableSeats} seats left</span>
            )}
            {variant === 'completed' && (
              <span>⭐ {trip.ratingsAverage.toFixed(1)} · {trip.ratingsQuantity} travellers</span>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-xl font-bold text-primary">
                {formatCurrency(trip.pricePerPerson)}
              </span>
              {variant === 'upcoming' && (
                <span className="ml-1 text-xs text-gray-400">/ person</span>
              )}
            </div>

            {variant === 'upcoming' ? (
              <Link
                href={`/trips/${trip.slug}`}
                className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-700 transition-colors"
              >
                Book Now ↗
              </Link>
            ) : (
              <Link
                href={`/trips/${trip.slug}`}
                className="text-sm font-semibold text-gray-500 hover:text-primary transition-colors"
              >
                Read story ↗
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
