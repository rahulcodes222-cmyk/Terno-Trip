'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import TripCard from '@/components/trips/TripCard';
import type { ITrip } from '@/types';

interface TripCarouselProps {
  trips: ITrip[];
  variant: 'upcoming' | 'completed';
}

const CARD_W = 360;
const GAP = 24;

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

  // Auto-scroll when not hovering
  useEffect(() => {
    if (isHovered || total <= 1) return;
    const t = setInterval(next, 5000);
    return () => clearInterval(t);
  }, [isHovered, next, total]);

  if (!trips.length) return null;

  return (
    <div
      className="relative w-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* ── Scroll track ───────────────────────────────────────── */}
      <div
        ref={trackRef}
        className="flex gap-6 overflow-x-auto scroll-smooth pb-4 px-1 scrollbar-none"
        style={{ scrollSnapType: 'x mandatory', scrollbarWidth: 'none' }}
      >
        {trips.map((trip) => (
          <div
            key={trip._id}
            className="w-[300px] sm:w-[350px] md:w-[360px] shrink-0"
            style={{ scrollSnapAlign: 'start' }}
          >
            <TripCard trip={trip} variant={variant} />
          </div>
        ))}
      </div>

      {/* ── Navigation arrows ──────────────────────────────────── */}
      {total > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            className="absolute -left-3 sm:-left-5 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-xl border border-gray-200 text-gray-800 hover:bg-[#FFA300] hover:text-white transition-all active:scale-90"
            aria-label="Previous trip"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={next}
            className="absolute -right-3 sm:-right-5 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-xl border border-gray-200 text-gray-800 hover:bg-[#FFA300] hover:text-white transition-all active:scale-90"
            aria-label="Next trip"
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
              type="button"
              onClick={() => scrollTo(i)}
              className="rounded-full transition-all duration-300"
              style={{
                height: '6px',
                width: i === current ? '24px' : '6px',
                backgroundColor: i === current ? '#FFA300' : '#D1D5DB',
              }}
              aria-label={`Go to trip ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
