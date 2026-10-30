import React from 'react';

const STATS = [
  { emoji: '🏆', value: '500+',     label: 'Happy Travellers',    color: '#FFB800' },
  { emoji: '📍', value: '25+',      label: 'Indian Destinations', color: '#FF4B4B' },
  { emoji: '⭐', value: '4.9 / 5',  label: 'Average Rating',      color: '#FFB800' },
  { emoji: '🛡️', value: '100%',     label: 'Safe & Trusted',      color: '#2563EB' },
  { emoji: '💳', value: 'Easy EMI', label: 'Available',           color: '#16A34A' },
];

export default function StatsBar() {
  return (
    /* White bg, border, shadow — matches screenshot perfectly */
    <section className="bg-[#F5F7FA] px-4 sm:px-6">
      <div className="mx-auto max-w-container">
        <div className="rounded-2xl border border-gray-200 bg-white shadow-stats">
          <div className="grid grid-cols-2 sm:grid-cols-5 divide-x divide-y sm:divide-y-0 divide-gray-100">
            {STATS.map((s, i) => (
              <div
                key={s.label}
                className={`flex flex-col items-center justify-center py-5 px-4 text-center ${
                  i === 4 ? 'col-span-2 sm:col-span-1' : ''
                }`}
              >
                <span className="mb-1.5 text-2xl">{s.emoji}</span>
                <span className="text-lg font-extrabold text-gray-900">{s.value}</span>
                <span className="text-xs text-gray-500 mt-0.5">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
