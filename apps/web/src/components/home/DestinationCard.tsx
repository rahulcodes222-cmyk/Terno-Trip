import React from 'react';

interface DestinationCardProps {
  image: string;
  name: string;
  subtitle: string;
  badge?: 'Popular' | 'Trending' | 'Top Rated';
}

const BADGE: Record<string, { label: string; color: string }> = {
  Popular:    { label: 'POPULAR',   color: '#FF6B00' },
  Trending:   { label: 'TRENDING',  color: '#0066FF' },
  'Top Rated':{ label: 'TOP RATED', color: '#00A651' },
};

export default function DestinationCard({ image, name, subtitle, badge }: DestinationCardProps) {
  const b = badge ? BADGE[badge] : null;

  return (
    /* height 220px — bigger cards as requested */
    <div className="group relative overflow-hidden rounded-xl" style={{ height: '220px' }}>
      <img
        src={image}
        alt={name}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
      />

      {/* Dark gradient bottom overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />

      {/* Badge — top right, exact from screenshot */}
      {b && (
        <span
          className="absolute right-2.5 top-2.5 rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white"
          style={{ backgroundColor: b.color }}
        >
          {b.label}
        </span>
      )}

      {/* Name + subtitle — bottom left */}
      <div className="absolute bottom-0 left-0 right-0 p-3">
        <p className="text-sm font-bold leading-tight text-white">{name}</p>
        <p className="mt-0.5 text-[11px] text-gray-300">{subtitle}</p>
      </div>
    </div>
  );
}
