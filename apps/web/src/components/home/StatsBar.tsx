import React from 'react';

const STATS = [
  { icon: '🏆', value: '500+',     label: 'Happy Travellers' },
  { icon: '📍', value: '25+',      label: 'Indian Destinations' },
  { icon: '⭐', value: '4.9 / 5',  label: 'Average Rating' },
  { icon: '🛡️', value: '100%',     label: 'Safe & Trusted' },
  { icon: '💳', value: 'Easy EMI', label: 'Available' },
];

export default function StatsBar() {
  return (
    <section className="bg-[#0A0A0A] py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-5">
          {STATS.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center text-center">
              <span className="mb-1 text-2xl">{stat.icon}</span>
              <span className="text-lg font-bold text-white">{stat.value}</span>
              <span className="text-xs text-gray-400">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
