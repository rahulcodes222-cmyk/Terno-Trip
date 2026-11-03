'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Review {
  stars: number;
  text: string;
  initials: string;
  name: string;
  meta: string;
}

interface ReviewCarouselProps {
  reviews: Review[];
}

const CARD_W = 340;
const GAP    = 20;

export default function ReviewCarousel({ reviews }: ReviewCarouselProps) {
  const trackRef     = useRef<HTMLDivElement>(null);
  const [current, setCurrent]     = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const total = reviews.length;

  const scrollTo = useCallback((idx: number) => {
    const clamped = Math.max(0, Math.min(idx, total - 1));
    setCurrent(clamped);
    trackRef.current?.scrollTo({ left: clamped * (CARD_W + GAP), behavior: 'smooth' });
  }, [total]);

  const next = useCallback(() => scrollTo(current === total - 1 ? 0 : current + 1), [current, scrollTo, total]);
  const prev = useCallback(() => scrollTo(current === 0 ? total - 1 : current - 1), [current, scrollTo, total]);

  useEffect(() => {
    if (isHovered || total <= 1) return;
    const t = setInterval(next, 3500);
    return () => clearInterval(t);
  }, [isHovered, next, total]);

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Track */}
      <div
        ref={trackRef}
        className="flex gap-5 overflow-x-hidden pb-2"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {reviews.map((r, i) => (
          <div
            key={i}
            className="shrink-0 rounded-xl border border-gray-200 bg-white p-5 shadow-card"
            style={{ width: `${CARD_W}px`, scrollSnapAlign: 'start' }}
          >
            {/* Stars */}
            <div className="mb-3 flex gap-0.5">
              {Array.from({ length: 5 }).map((_, j) => (
                <span key={j} className={`text-base ${j < r.stars ? 'text-[#FF6B00]' : 'text-gray-200'}`}>★</span>
              ))}
            </div>
            {/* Quote */}
            <p className="mb-4 text-sm leading-relaxed text-gray-600 italic flex-1">{r.text}</p>
            {/* Author */}
            <div className="flex items-center gap-3 mt-auto">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#FF6B00] text-xs font-bold text-white">
                {r.initials}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{r.name}</p>
                <p className="text-xs text-gray-500">{r.meta}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Arrows */}
      {total > 1 && (
        <>
          <button onClick={prev} aria-label="Previous review"
            className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-md border border-gray-200 text-gray-600 hover:text-[#FF6B00] hover:border-[#FF6B00] transition-colors">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button onClick={next} aria-label="Next review"
            className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-md border border-gray-200 text-gray-600 hover:text-[#FF6B00] hover:border-[#FF6B00] transition-colors">
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      {/* Dots */}
      {total > 1 && (
        <div className="mt-4 flex items-center justify-center gap-1.5">
          {reviews.map((_, i) => (
            <button key={i} onClick={() => scrollTo(i)} aria-label={`Review ${i + 1}`}
              className="rounded-full transition-all duration-300"
              style={{ height: '6px', width: i === current ? '24px' : '6px',
                backgroundColor: i === current ? '#FF6B00' : '#D1D5DB' }} />
          ))}
        </div>
      )}
    </div>
  );
}
