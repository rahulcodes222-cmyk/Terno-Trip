import React from 'react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';
import type { ITrip } from '@/types';

interface Props {
  trip: ITrip;
  variant: 'upcoming' | 'completed';
}

function getMonthYear(d?: string) {
  if (!d) return 'TBA';
  try {
    return new Date(d)
      .toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
      .toUpperCase();
  } catch { return 'TBA'; }
}

export default function TripCardUpcoming({ trip, variant }: Props) {
  const monthYear  = getMonthYear(trip.startDates[0]);
  const badgeText  = variant === 'upcoming'
    ? `UPCOMING · ${monthYear}`
    : `COMPLETED · ${monthYear}`;

  return (
    <Link
      href={`/trips/${trip.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-card hover:shadow-card-hover transition-shadow"
    >
      {/* ── Image ─────────────────────────────────────────────── */}
      <div className="relative overflow-hidden" style={{ height: '210px' }}>
        <img
          src={trip.coverImage}
          alt={trip.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        {/* Upcoming/Completed badge — top left, orange pill */}
        <span
          className="absolute left-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-bold text-white"
          style={{ backgroundColor: variant === 'upcoming' ? '#FF6B00' : '#6B7280' }}
        >
          {badgeText}
        </span>
      </div>

      {/* ── Content ───────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col p-4">
        {/* State in orange — "HIMACHAL PRADESH" */}
        <p
          className="mb-1 text-[11px] font-extrabold uppercase tracking-widest"
          style={{ color: '#FF6B00' }}
        >
          {trip.destination.toUpperCase()}
        </p>

        {/* Trip title — bold, large */}
        <h3 className="mb-1.5 text-base font-bold leading-snug text-gray-900 group-hover:text-[#FF6B00] transition-colors line-clamp-2">
          {trip.title}
        </h3>

        {/* Short description */}
        <p className="mb-3 text-xs leading-relaxed text-gray-500 line-clamp-2 flex-1">
          {trip.shortDescription ?? trip.description}
        </p>

        {/* Duration + Price row */}
        <div className="mb-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
          <span>◷ {trip.duration} Days / {trip.nights} Nights</span>
          <span
            className="font-bold"
            style={{ color: '#FF6B00' }}
          >
            {formatCurrency(trip.pricePerPerson)}/person
          </span>
        </div>

        {/* Seats + Book Now row */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          {variant === 'upcoming' ? (
            <span className="text-xs text-gray-500">👥 {trip.availableSeats} seats left</span>
          ) : (
            <span className="text-xs text-gray-500">
              ⭐ {trip.ratingsAverage.toFixed(1)} · {trip.ratingsQuantity} travellers
            </span>
          )}

          <span
            className="text-xs font-bold transition-colors"
            style={{ color: '#FF6B00' }}
          >
            {variant === 'upcoming' ? 'Book Now ↗' : 'Read story ↗'}
          </span>
        </div>
      </div>
    </Link>
  );
}
