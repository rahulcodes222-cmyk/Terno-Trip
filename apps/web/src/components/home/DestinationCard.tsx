'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface DestinationCardProps {
  images: string[];
  name: string;
  subtitle: string;
  badge?: 'Popular' | 'Trending' | 'Top Rated';
}

const BADGE: Record<string, { label: string; bg: string }> = {
  Popular:    { label: 'POPULAR',   bg: 'bg-[#FF6B00]' },
  Trending:   { label: 'TRENDING',  bg: 'bg-[#0070F3]' },
  'Top Rated':{ label: 'TOP RATED', bg: 'bg-[#00B050]' },
};

export default function DestinationCard({ images, name, subtitle, badge }: DestinationCardProps) {
  const b = badge ? BADGE[badge] : null;
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    if (!images || images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % images.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [images]);

  const activeImg = images && images.length > 0 ? images[currentIdx] : '';

  return (
    <Link
      href={`/trips?search=${encodeURIComponent(name)}`}
      className="group relative block h-48 sm:h-52 w-full overflow-hidden rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 select-none"
    >
      {/* Background Images */}
      {images && images.map((img, i) => (
        <img
          key={i}
          src={img}
          alt={name}
          className="absolute inset-0 h-full w-full object-cover transition-all duration-700 ease-in-out group-hover:scale-110"
          loading="lazy"
          style={{ opacity: i === currentIdx ? 1 : 0 }}
        />
      ))}

      {/* Deep dark gradient bottom overlay from screenshot */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent pointer-events-none" />

      {/* Badge — top right */}
      {b && (
        <div className="absolute right-3 top-3 z-10">
          <span
            className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white shadow-md ${b.bg}`}
          >
            {b.label}
          </span>
        </div>
      )}

      {/* Destination Name + Subtitle — bottom left */}
      <div className="absolute bottom-0 left-0 right-0 p-3.5 z-10 pointer-events-none">
        <p className="text-base sm:text-lg font-bold leading-tight text-white drop-shadow-sm group-hover:text-[#FFA300] transition-colors">
          {name}
        </p>
        <p className="mt-0.5 text-xs text-gray-200 line-clamp-1 drop-shadow-sm opacity-90">
          {subtitle}
        </p>
      </div>
    </Link>
  );
}
