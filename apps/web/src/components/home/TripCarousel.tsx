'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { ITrip } from '@/types';

interface TripCarouselProps {
  trips: ITrip[];
  variant: 'upcoming' | 'completed';
}

function getMonthYear(d?: string) {
  if (!d) return 'TBA';
  try {
    return new Date(d).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }).toUpperCase();
  } catch { return 'TBA'; }
}

// Card width + gap (px) — matches CSS below
const CARD_W = 320;
const GAP = 20;

// ── Individual trip card with image slideshow ────────────────────────────────
function TripCard({ trip, variant }: { trip: ITrip; variant: 'upcoming' | 'completed' }) {
  const monthYear = getMonthYear(trip.startDates[0]);
  const badgeText = variant === 'upcoming'
    ? `UPCOMING · ${monthYear}`
    : `COMPLETED · ${monthYear}`;

  const baseImages = trip.images && trip.images.length ? trip.images : [trip.coverImage];
  // Duplicate first image at end for seamless infinite right-to-left loop
  const images = [...baseImages, baseImages[0]];
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    if (baseImages.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIdx((prev) => {
        const next = prev + 1;
        if (next >= images.length) return 0;
        return next;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [baseImages, images]);

  return (
    <Link
      key={trip._id}
      href={`/trips/${trip.slug}`}
      className="group flex shrink-0 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-card hover:shadow-card-hover transition-shadow"
      style={{ width: `${CARD_W}px`, scrollSnapAlign: 'start' }}
    >
      {/* Image */}
      <div className="relative overflow-hidden" style={{ height: '200px' }}>
        {images.map((img, i) => (
          <img
            key={i}
            src={img}
            alt={trip.title}
            className="absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ease-in-out group-hover:scale-105"
            loading="lazy"
            style={{
              opacity: i === currentIdx ? 1 : 0,
            }}
          />
        ))}
        <span
          className="absolute left-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-bold text-white"
          style={{ backgroundColor: variant === 'upcoming' ? '#FF6B00' : '#6B7280' }}
        >
          {badgeText}
        </span>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        <p className="mb-0.5 text-[11px] font-extrabold uppercase tracking-widest" style={{ color: '#FF6B00' }}>
          {trip.destination.toUpperCase()}
        </p>
        <h3 className="mb-1.5 text-sm font-bold leading-snug text-gray-900 group-hover:text-[#FF6B00] transition-colors line-clamp-2">
          {trip.title}
        </h3>
        <p className="mb-3 text-xs leading-relaxed text-gray-500 line-clamp-2 flex-1">
          {trip.shortDescription ?? trip.description}
        </p>
        <div className="mb-2 text-xs text-gray-500">
          ◷ {trip.duration} Days / {trip.nights} Nights
        </div>
        <div className="flex items-center justify-between border-t border-gray-100 pt-2">
          <div>
            <span className="text-base font-extrabold text-gray-900">
              {formatCurrency(trip.pricePerPerson)}
            </span>
            {variant === 'upcoming' && (
              <span className="ml-1 text-xs text-gray-400">/person</span>
            )}
          </div>
          <span className="text-xs font-bold" style={{ color: '#FF6B00' }}>
            {variant === 'upcoming' ? 'Book Now ↗' : 'Read story ↗'}
          </span>
        </div>
        {variant === 'upcoming' && (
          <p className="mt-1 text-xs text-gray-400">👥 {trip.availableSeats} seats left</p>
        )}
        {variant === 'completed' && (
          <p className="mt-1 text-xs text-gray-400">⭐ {trip.ratingsAverage.toFixed(1)} · {trip.ratingsQuantity} travellers</p>
        )}
      </div>
    </Link>
  );
}

export default function TripCarousel({ trips, variant }: TripCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const total = trips.length;

  const scrollTo = useCallback((idx: number) => {
    const clamped = Math.max(0, Math.min(idx, total - 1));
    setCurrent(clamped);
    if (trackRef.current) {
      trackRef.current.scrollTo({
        left: clamped * (CARD_W + GAP),
        behavior: 'smooth',
      });
    }
  }, [total]);

  const next = useCallback(() => scrollTo(current === total - 1 ? 0 : current + 1), [current, scrollTo, total]);
  const prev = useCallback(() => scrollTo(current === 0 ? total - 1 : current - 1), [current, scrollTo, total]);

  // Auto-advance every 3s (right to left)
  useEffect(() => {
    if (isHovered || total <= 1) return;
    const t = setInterval(next, 3000);
    return () => clearInterval(t);
  }, [isHovered, next, total]);

  if (!trips.length) return null;

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* ── Scroll track ───────────────────────────────────────── */}
      <div
        ref={trackRef}
        className="flex gap-5 overflow-x-hidden scroll-smooth pb-2"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {trips.map((trip) => (
          <TripCard key={trip._id} trip={trip} variant={variant} />
        ))}
      </div>

      {/* ── Navigation arrows ──────────────────────────────────── */}
      {total > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-md border border-gray-200 text-gray-600 hover:text-[#FF6B00] hover:border-[#FF6B00] transition-colors"
            aria-label="Previous"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={next}
            className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-md border border-gray-200 text-gray-600 hover:text-[#FF6B00] hover:border-[#FF6B00] transition-colors"
            aria-label="Next"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      {/* ── Dot indicators ─────────────────────────────────────── */}
      {total > 1 && (
        <div className="mt-4 flex items-center justify-center gap-1.5">
          {trips.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollTo(i)}
              className="rounded-full transition-all duration-300"
              style={{
                height: '6px',
                width: i === current ? '24px' : '6px',
                backgroundColor: i === current ? '#FF6B00' : '#D1D5DB',
              }}
              aria-label={`Go to trip ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
