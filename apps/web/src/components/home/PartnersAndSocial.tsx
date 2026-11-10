'use client';

import React, { useRef, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/* ── Partner logos data ───────────────────────────────────────────── */
const PARTNERS = [
  { id: 1, name: 'Omyash Travel Pvt Ltd', initials: 'OT', color: '#1F2937' },
  { id: 2, name: 'Gaurav Travels', initials: 'GT', color: '#374151' },
  { id: 3, name: 'The Curated Escapes Travels', initials: 'CE', color: '#4B5563' },
  { id: 4, name: 'Samarth-tour And Travels', initials: 'ST', color: '#1E3A5F' },
  { id: 5, name: 'Citi Tours India Concepts Global', initials: 'CI', color: '#7C3AED' },
  { id: 6, name: 'Kashway Tour & Travels', initials: 'KT', color: '#1F2937' },
  { id: 7, name: 'Himalayan Expeditions', initials: 'HE', color: '#065F46' },
  { id: 8, name: 'Royal Rajasthan Tours', initials: 'RR', color: '#92400E' },
  { id: 9, name: 'Kerala Backwater Journeys', initials: 'KB', color: '#0F766E' },
  { id: 10, name: 'Adventure Routes India', initials: 'AR', color: '#B45309' },
  { id: 11, name: 'Mountain Mystic Travels', initials: 'MM', color: '#1E40AF' },
  { id: 12, name: 'South India Wanderers', initials: 'SW', color: '#166534' },
];

/* ── Instagram mock posts (6 cards to showcase smooth scroll) ─────── */
const INSTA_POSTS = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&q=80',
    title: 'PERFECT\nGROUP TRIP',
    bgColor: 'from-orange-500/80 to-amber-700/80',
    caption: 'Find your tribe. Find your trip. Travel with TernoTrip across India...',
    isVideo: true,
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80',
    title: 'WHY TRAVELLERS\nCHOOSE TERNOTRIP',
    bgColor: 'from-amber-500/80 to-orange-600/80',
    caption: 'Your next adventure is closer than you think! Verified curators only...',
    isVideo: false,
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600&q=80',
    title: 'What do you\ncheck first?',
    bgColor: 'from-yellow-500/80 to-amber-600/80',
    caption: 'Before booking your next trip, check these 4 key safety details...',
    isVideo: false,
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80',
    title: 'TOP 5 SPOTS\nIN HIMACHAL',
    bgColor: 'from-blue-600/80 to-indigo-800/80',
    caption: 'Hidden valleys, snow passes and pine trails waiting for you...',
    isVideo: true,
  },
  {
    id: 5,
    image: 'https://images.unsplash.com/photo-1533240332313-0db49b459ad6?w=600&q=80',
    title: 'SOLO OR GROUP?\nDECIDE HERE',
    bgColor: 'from-emerald-600/80 to-teal-800/80',
    caption: 'Connect with fellow explorers and split costs with group trips...',
    isVideo: false,
  },
  {
    id: 6,
    image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&q=80',
    title: 'VARANASI AT\nSUNRISE 🌅',
    bgColor: 'from-purple-600/80 to-rose-700/80',
    caption: 'Spiritual journeys crafted with authentic local curators...',
    isVideo: false,
  },
];

/* ── Fake Instagram post card ─────────────────────────────────────── */
function InstaCard({ post }: { post: (typeof INSTA_POSTS)[0] }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm flex flex-col flex-shrink-0 w-64 sm:w-72 transition-all duration-300 hover:shadow-md hover:-translate-y-1">
      {/* Instagram header */}
      <div className="flex items-center justify-between px-3.5 pt-3 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center shadow-xs">
            <span className="text-[10px] font-black text-white">T</span>
          </div>
          <span className="text-xs font-bold text-gray-800 tracking-tight">terno.trip</span>
        </div>
        <span className="text-gray-400 text-sm font-bold tracking-widest cursor-pointer select-none">···</span>
      </div>

      {/* Post Image with stylized text banner */}
      <div className="relative w-full aspect-square overflow-hidden bg-gray-100">
        <img
          src={post.image}
          alt={post.title}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
        />
        <div className={`absolute inset-0 bg-gradient-to-br ${post.bgColor}`} />

        {/* Big Heading overlay */}
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <p className="text-white font-black text-xl sm:text-2xl leading-tight text-center uppercase drop-shadow-md whitespace-pre-line tracking-tight">
            {post.title}
          </p>
        </div>

        {/* Video play badge */}
        {post.isVideo && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="h-11 w-11 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center border-2 border-white/70 shadow-lg">
              <svg className="h-5 w-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Action icons row */}
      <div className="flex items-center justify-between px-3.5 pt-3 pb-1">
        <div className="flex items-center gap-3.5 text-gray-700">
          {/* Heart */}
          <button type="button" className="hover:text-red-500 transition-colors">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
          </button>
          {/* Comment */}
          <button type="button" className="hover:text-gray-950 transition-colors">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
            </svg>
          </button>
          {/* Share */}
          <button type="button" className="hover:text-gray-950 transition-colors">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </button>
        </div>
        {/* Bookmark */}
        <button type="button" className="text-gray-700 hover:text-gray-950 transition-colors">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
          </svg>
        </button>
      </div>

      {/* Caption */}
      <div className="px-3.5 pb-3.5 pt-1">
        <p className="text-xs text-gray-600 leading-snug line-clamp-2">
          <span className="font-bold text-gray-900">terno.trip</span> {post.caption}
        </p>
      </div>
    </div>
  );
}

/* ── Main Export ──────────────────────────────────────────────────── */
export default function PartnersAndSocial() {
  const socialSectionRef = useRef<HTMLDivElement>(null);
  const instaTrackRef = useRef<HTMLDivElement>(null);
  const [partnerOffset, setPartnerOffset] = useState(0);
  const isUserInteractingRef = useRef(false);

  // Auto-scroll partner logos continuously in infinite loop
  useEffect(() => {
    const totalWidth = PARTNERS.length * 220;
    let frame: number;
    let pos = 0;
    const animate = () => {
      pos = (pos + 0.6) % totalWidth;
      setPartnerOffset(pos);
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);

  // ── Task 3: Smooth Right-to-Left Auto-Scroll of Instagram Cards ──
  // Scrolls smoothly across the cards from right to left and stops at the last card!
  useEffect(() => {
    const container = instaTrackRef.current;
    const section = socialSectionRef.current;
    if (!container || !section) return;

    let animationId: number;
    let hasRun = false;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasRun) {
            hasRun = true;

            // Small initial pause so user sees cards, then scroll right-to-left
            setTimeout(() => {
              if (!container) return;
              const maxScroll = container.scrollWidth - container.clientWidth;
              if (maxScroll <= 0) return;

              let current = container.scrollLeft;
              const speed = 1.6; // smooth, comfortable scrolling speed

              const step = () => {
                // If user interacted manually, stop auto-scrolling
                if (isUserInteractingRef.current) return;

                if (current < maxScroll) {
                  current += speed;
                  container.scrollLeft = current;
                  animationId = requestAnimationFrame(step);
                } else {
                  // Stops gently at the last card!
                  container.scrollLeft = maxScroll;
                }
              };

              animationId = requestAnimationFrame(step);
            }, 600);
          }
        });
      },
      { threshold: 0.25 }
    );

    observer.observe(section);

    return () => {
      observer.disconnect();
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, []);

  const handleManualScroll = (direction: 'left' | 'right') => {
    isUserInteractingRef.current = true;
    if (instaTrackRef.current) {
      const offset = direction === 'left' ? -300 : 300;
      instaTrackRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-white pt-8 sm:pt-12">
      {/* ── 900+ Partners Bar ───────────────────────────────────── */}
      <div className="border-b border-gray-100 py-5">
        <p className="text-center text-sm font-semibold text-gray-700 mb-4">
          We have <span className="font-black text-gray-900">900+ Partners</span>
        </p>

        {/* Infinite scroll partner logos */}
        <div className="relative overflow-hidden">
          <div
            className="flex items-center gap-6 sm:gap-10"
            style={{ transform: `translateX(-${partnerOffset}px)`, width: 'max-content' }}
          >
            {[...PARTNERS, ...PARTNERS].map((partner, idx) => (
              <div
                key={`${partner.id}-${idx}`}
                className="flex items-center gap-2.5 shrink-0 select-none"
              >
                <div
                  className="h-9 w-9 sm:h-10 sm:w-10 rounded-full flex items-center justify-center text-white text-[11px] font-black shadow-sm border border-gray-200 shrink-0"
                  style={{ backgroundColor: partner.color }}
                >
                  {partner.initials}
                </div>
                <span className="text-xs sm:text-sm text-gray-700 font-medium whitespace-nowrap">
                  {partner.name}
                </span>
              </div>
            ))}
          </div>

          {/* Fade edges */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-white to-transparent z-10" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-white to-transparent z-10" />
        </div>
      </div>

      {/* ── Our Social / Instagram Section (with Right-to-Left Scroll Animation) ── */}
      <div
        ref={socialSectionRef}
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16"
      >
        <div className="flex flex-col lg:flex-row items-start gap-8 lg:gap-14">
          {/* Left: Heading + Follow CTA Banner */}
          <div className="flex-shrink-0 w-full lg:w-72">
            <p className="text-xs font-bold tracking-wider text-[#FF6B00] uppercase">
              Our Social
            </p>
            <h3 className="mt-2 text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight">
              What&apos;s new on our Instagram?
            </h3>

            {/* Travel photo collage card */}
            <div className="mt-5 relative rounded-2xl overflow-hidden h-44 w-full max-w-xs bg-gray-100 shadow-sm border border-gray-200 group">
              <img
                src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&q=80"
                alt="Travel collage"
                className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/35" />
              <div className="absolute bottom-3 left-0 right-0 flex justify-center px-3">
                <a
                  href="https://www.instagram.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full text-center rounded-full bg-[#FFA300] py-2 px-4 text-xs font-black text-gray-950 shadow-md hover:brightness-105 transition-all"
                >
                  Follow @terno.trip
                </a>
              </div>
            </div>
          </div>

          {/* Right: Instagram posts track with Auto-Scroll Animation */}
          <div className="flex-1 min-w-0 w-full">
            {/* Nav Arrows */}
            <div className="flex items-center justify-end gap-2 mb-3">
              <button
                type="button"
                onClick={() => handleManualScroll('left')}
                className="h-8 w-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-500 hover:bg-gray-50 transition-colors text-gray-700"
                aria-label="Previous posts"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => handleManualScroll('right')}
                className="h-8 w-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-500 hover:bg-gray-50 transition-colors text-gray-700"
                aria-label="Next posts"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Posts scroll track */}
            <div
              ref={instaTrackRef}
              onMouseEnter={() => {
                isUserInteractingRef.current = true;
              }}
              onTouchStart={() => {
                isUserInteractingRef.current = true;
              }}
              className="flex items-start gap-4 overflow-x-auto scrollbar-none scroll-smooth pb-3"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {INSTA_POSTS.map((post) => (
                <InstaCard key={post.id} post={post} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
