import React, { useState, useEffect } from 'react';
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

  const images = trip.images && trip.images.length ? trip.images : [trip.coverImage];
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % images.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [images]);

  return (
    <Link
      href={`/trips/${trip.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-card hover:shadow-card-hover transition-shadow"
    >
      {/* ── Image with right-to-left slide + fade ───────────────────── */}
      <div className="relative overflow-hidden" style={{ height: '210px' }}>
        {images.map((img, i) => (
          <img
            key={i}
            src={img}
            alt={trip.title}
            className="absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ease-in-out group-hover:scale-105 shrink-0"
            loading="lazy"
            style={{
              opacity: i === currentIdx ? 1 : 0,
            }}
          />
        ))}
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
        <p
          className="mb-1 text-[11px] font-extrabold uppercase tracking-widest"
          style={{ color: '#FF6B00' }}
        >
          {trip.destination.toUpperCase()}
        </p>

        <h3 className="mb-1.5 text-base font-bold leading-snug text-gray-900 group-hover:text-[#FF6B00] transition-colors line-clamp-2">
          {trip.title}
        </h3>

        <p className="mb-3 text-xs leading-relaxed text-gray-500 line-clamp-2 flex-1">
          {trip.shortDescription ?? trip.description}
        </p>

        <div className="mb-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
          <span>◷ {trip.duration} Days / {trip.nights} Nights</span>
          <span className="font-bold" style={{ color: '#FF6B00' }}>
            {formatCurrency(trip.pricePerPerson)}/person
          </span>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          {variant === 'upcoming' ? (
            <span className="text-xs text-gray-500">👥 {trip.availableSeats} seats left</span>
          ) : (
            <span className="text-xs text-gray-500">
              ⭐ {trip.ratingsAverage.toFixed(1)} · {trip.ratingsQuantity} travellers
            </span>
          )}

          <span className="text-xs font-bold transition-colors" style={{ color: '#FF6B00' }}>
            {variant === 'upcoming' ? 'Book Now ↗' : 'Read story ↗'}
          </span>
        </div>
      </div>
    </Link>
  );
}
