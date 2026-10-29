import React from 'react';

interface DestinationCardProps {
  image: string;
  name: string;
  subtitle: string;
  badge?: 'Popular' | 'Trending' | 'Top Rated';
}

const badgeColors: Record<string, string> = {
  Popular:    'bg-primary text-white',
  Trending:   'bg-blue-500 text-white',
  'Top Rated': 'bg-green-500 text-white',
};

export default function DestinationCard({ image, name, subtitle, badge }: DestinationCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-2xl" style={{ height: '256px' }}>
      {/* Background image */}
      <img
        src={image}
        alt={name}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />

      {/* Gradient overlay */}
      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/80 to-transparent" />

      {/* Badge */}
      {badge && (
        <div className="absolute left-3 top-3">
          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${badgeColors[badge]}`}>
            {badge}
          </span>
        </div>
      )}

      {/* Bottom text */}
      <div className="absolute inset-x-0 bottom-0 p-4">
        <p className="font-bold text-white leading-tight">{name}</p>
        <p className="text-xs text-gray-300 mt-0.5">{subtitle}</p>
      </div>
    </div>
  );
}
