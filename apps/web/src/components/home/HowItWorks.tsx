// 'How it works' section – exact copy of pirttrip.com layout
// Uses Tailwind for full responsiveness

'use client';

import React from 'react';
import { Search, MapPin, CheckCircle } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      id: 1,
      title: 'Discover Trips',
      description: 'Browse curated group trips, filter by destination, style or special needs.',
      icon: <Search className="h-6 w-6 text-[#FFA300]" />,
    },
    {
      id: 2,
      title: 'Compare Curators',
      description: 'Read reviews, see itineraries and pricing, then pick your perfect guide.',
      icon: <MapPin className="h-6 w-6 text-[#FFA300]" />,
    },
    {
      id: 3,
      title: 'Book & Travel',
      description: 'Confirm your seat, pay securely and get ready for an unforgettable adventure.',
      icon: <CheckCircle className="h-6 w-6 text-[#FFA300]" />,
    },
  ];

  return (
    <section className="bg-[#F5F7FA] py-12 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="mb-2 text-2xl font-extrabold text-gray-900 sm:text-3xl" style={{ color: '#FF6B00' }}>How it works?</h2>
        <p className="mb-8 text-sm text-gray-500">Three simple steps to find, compare and book your perfect group trip.</p>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          {steps.map((step) => (
            <div key={step.id} className="flex flex-col items-center rounded-2xl bg-white p-6 shadow-card">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#FFA300]/10">
                {step.icon}
              </div>
              <h3 className="mb-2 text-lg font-bold text-gray-900">{step.title}</h3>
              <p className="text-sm text-gray-500">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
