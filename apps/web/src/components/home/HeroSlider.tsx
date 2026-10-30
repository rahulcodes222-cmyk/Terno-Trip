'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

/* ── Slide data ─────────────────────────────────────────────────────────── */
const SLIDES = [
  {
    video:  'https://videos.pexels.com/video-files/3571264/3571264-uhd_2560_1440_30fps.mp4',
    poster: 'https://images.unsplash.com/photo-1544922404-f97e0e1e3462?w=1400&q=80',
    line1:  'Discover the',
    line2:  'Soul of India',
    sub:    'From snow-capped Himalayas to golden beaches of Goa — explore Incredible India with our curated tour packages.',
  },
  {
    video:  'https://videos.pexels.com/video-files/1918465/1918465-uhd_2560_1440_30fps.mp4',
    poster: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=1400&q=80',
    line1:  'Sun, Sand &',
    line2:  'Serenity Awaits',
    sub:    "Feel the golden shores of Goa and drift into India's beach paradise with hand-crafted packages.",
  },
  {
    video:  'https://videos.pexels.com/video-files/2169880/2169880-uhd_2560_1440_30fps.mp4',
    poster: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1400&q=80',
    line1:  'Land of Royals',
    line2:  '& Heritage',
    sub:    'Walk through majestic forts, royal palaces and the eternal symbol of love across incredible India.',
  },
];

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  /* Auto-advance every 6s */
  useEffect(() => {
    const t = setInterval(() => setCurrent((p) => (p + 1) % SLIDES.length), 6000);
    return () => clearInterval(t);
  }, []);

  /* Play active video, pause others */
  useEffect(() => {
    videoRefs.current.forEach((v, i) => {
      if (!v) return;
      if (i === current) { v.currentTime = 0; v.play().catch(() => {}); }
      else v.pause();
    });
  }, [current]);

  return (
    /*
     * Outer wrapper — light gray page bg, horizontal padding to create the
     * "card with margins on sides" look exactly like the screenshot.
     */
    <section className="bg-[#F5F7FA] px-4 pb-6 pt-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-container">
        {/*
         * Inner dark card — rounded corners, overflow hidden, exact like screenshot.
         * Height ~420px on desktop, auto on mobile.
         */}
        <div
          className="relative overflow-hidden rounded-2xl"
          style={{ height: '420px' }}
        >
          {/* ── Slides ───────────────────────────────────────── */}
          {SLIDES.map((slide, idx) => (
            <div
              key={idx}
              className="absolute inset-0 transition-opacity duration-1000"
              style={{ opacity: idx === current ? 1 : 0, zIndex: idx === current ? 1 : 0 }}
            >
              <video
                ref={(el) => { videoRefs.current[idx] = el; }}
                src={slide.video}
                poster={slide.poster}
                muted loop playsInline
                preload={idx === 0 ? 'auto' : 'none'}
                className="absolute inset-0 h-full w-full object-cover"
              />
              {/* Dark overlay — navy/dark from the screenshot */}
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(10,20,40,0.85) 0%, rgba(10,20,40,0.5) 60%, rgba(0,0,0,0.15) 100%)' }} />
            </div>
          ))}

          {/* ── Foreground content ───────────────────────────── */}
          <div className="relative flex h-full flex-col justify-center px-8 pb-10 pt-6 sm:px-10 lg:px-14" style={{ zIndex: 10 }}>

            {/* "INDIA DOMESTIC TOURS ONLY" pill — exact from screenshot */}
            <div className="mb-5 inline-flex w-fit items-center gap-1.5 rounded-full border border-white/30 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-white backdrop-blur-sm">
              🚌 India Domestic Tours Only
            </div>

            {/* Headline — line1 white, line2 orange exactly like screenshot */}
            <h1 className="mb-3 text-3xl font-extrabold leading-tight text-white sm:text-4xl lg:text-5xl">
              {SLIDES[current].line1}{' '}
              <br />
              <span style={{ color: '#FF8C00' }}>{SLIDES[current].line2}</span>
            </h1>

            {/* Subtext */}
            <p className="mb-6 max-w-md text-sm leading-relaxed text-gray-300 sm:text-base">
              {SLIDES[current].sub}
            </p>

            {/* Two CTA buttons — exact like screenshot */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Primary: orange filled — "Explore Packages" */}
              <Link
                href="/trips"
                className="flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-bold text-white shadow-lg transition-colors"
                style={{ backgroundColor: '#FF6B00' }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#E65100')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FF6B00')}
              >
                🚌 Explore Packages
              </Link>
              {/* Secondary: outline white — "Talk to an Expert" */}
              <Link
                href="/trips"
                className="flex items-center gap-2 rounded-lg border border-white/60 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
              >
                Talk to an Expert ↗
              </Link>
            </div>

            {/* Dot indicators — bottom left */}
            <div className="absolute bottom-5 left-8 flex items-center gap-2 sm:left-10 lg:left-14">
              {SLIDES.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrent(idx)}
                  aria-label={`Slide ${idx + 1}`}
                  className="rounded-full transition-all duration-300"
                  style={{
                    height: '6px',
                    width: idx === current ? '28px' : '6px',
                    backgroundColor: idx === current ? '#FF6B00' : 'rgba(255,255,255,0.4)',
                  }}
                />
              ))}
            </div>

            {/* Slide counter — bottom right */}
            <div className="absolute bottom-5 right-6 text-xs font-semibold tracking-wide text-white/60">
              {current + 1} / {SLIDES.length}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
