'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

const SLIDES = [
  {
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920',
    headline: 'Discover the Soul of India',
    sub: 'From snow-capped Himalayas to golden beaches of Goa — explore Incredible India with our curated tour packages.',
  },
  {
    image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=1920',
    headline: 'Sun, Sand & Serenity',
    sub: 'Feel the golden shores of Goa and drift into India\'s beach paradise with hand-crafted packages.',
  },
  {
    image: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1920',
    headline: 'Land of Royals & Heritage',
    sub: 'Walk through majestic forts, royal palaces and the eternal symbol of love across incredible India.',
  },
];

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative overflow-hidden" style={{ minHeight: '90vh' }}>
      {/* Slides */}
      {SLIDES.map((slide, idx) => (
        <div
          key={idx}
          className="absolute inset-0 transition-opacity duration-1000"
          style={{ opacity: idx === current ? 1 : 0 }}
        >
          {/* Background image */}
          <img
            src={slide.image}
            alt={slide.headline}
            className="absolute inset-0 h-full w-full object-cover"
          />
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/55" />
        </div>
      ))}

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center" style={{ minHeight: '90vh' }}>
        <div className="mx-auto max-w-4xl px-4 text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
            🇮🇳 India Domestic Tours Only
          </div>

          {/* Headline */}
          <h1 className="mb-4 text-4xl font-extrabold leading-tight text-white sm:text-5xl lg:text-7xl">
            {SLIDES[current].headline}
          </h1>

          {/* Subtext */}
          <p className="mx-auto mb-8 max-w-2xl text-base text-gray-200 sm:text-lg">
            {SLIDES[current].sub}
          </p>

          {/* CTA */}
          <Link
            href="/trips"
            className="inline-block rounded-xl bg-primary px-8 py-3.5 text-sm font-bold text-white shadow-lg hover:bg-primary-600 transition-colors"
          >
            Explore Trips ↗
          </Link>
        </div>

        {/* Bottom dot indicators */}
        <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 gap-2">
          {SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                idx === current ? 'w-8 bg-primary' : 'w-2.5 bg-white/50'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

        {/* Slide counter */}
        <div className="absolute bottom-8 right-6 text-sm font-medium text-white/70">
          {current + 1} / {SLIDES.length}
        </div>
      </div>
    </section>
  );
}
