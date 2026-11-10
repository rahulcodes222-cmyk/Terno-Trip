'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Search, MapPin, Check, Star, Send, Smile } from 'lucide-react';

/* ── HOT AIR BALLOON (Orange & White Striped as in Pirttrip) ──────── */
function HotAirBalloon({ className = '' }: { className?: string }) {
  return (
    <div className={`relative select-none pointer-events-none ${className}`}>
      <svg
        viewBox="0 0 100 135"
        className="h-full w-full drop-shadow-lg"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="balloonGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#EA580C" />
            <stop offset="100%" stopColor="#C2410C" />
          </linearGradient>
          <linearGradient id="whiteStripeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#F3F4F6" />
          </linearGradient>
        </defs>

        {/* Envelope Base (Orange) */}
        <path
          d="M 50 8 C 22 8 12 32 16 62 C 20 86 38 102 44 108 L 56 108 C 62 102 80 86 84 62 C 88 32 78 8 50 8 Z"
          fill="url(#balloonGradient)"
        />

        {/* White Stripes Left & Right */}
        <path
          d="M 50 8 C 36 8 30 32 34 62 C 38 86 46 104 47 108 L 53 108 C 54 104 62 86 66 62 C 70 32 64 8 50 8 Z"
          fill="url(#whiteStripeGrad)"
        />

        {/* Center Orange Stripe */}
        <path
          d="M 50 8 C 45 8 43 32 45 62 C 47 86 49.5 104 50 108 L 50 108 C 50.5 104 53 86 55 62 C 57 32 55 8 50 8 Z"
          fill="#FF6B00"
        />

        {/* Ropes to Basket */}
        <line x1="44" y1="108" x2="42" y2="120" stroke="#78350F" strokeWidth="1.5" />
        <line x1="48" y1="108" x2="45" y2="120" stroke="#78350F" strokeWidth="1.5" />
        <line x1="52" y1="108" x2="55" y2="120" stroke="#78350F" strokeWidth="1.5" />
        <line x1="56" y1="108" x2="58" y2="120" stroke="#78350F" strokeWidth="1.5" />

        {/* Wicker Basket */}
        <rect x="41" y="119" width="18" height="12" rx="2" fill="#B45309" stroke="#78350F" strokeWidth="1" />
        <line x1="41" y1="123" x2="59" y2="123" stroke="#92400E" strokeWidth="1" />
        <line x1="41" y1="127" x2="59" y2="127" stroke="#92400E" strokeWidth="1" />
      </svg>
    </div>
  );
}

/* ── REUSABLE STEP COMPONENTS ─────────────────────────────────────── */

function Step1Content() {
  return (
    <div className="relative flex items-center gap-2 sm:gap-4">
      {/* Outline 1 in background */}
      <span
        className="absolute -left-8 -top-12 text-8xl sm:text-9xl font-black text-transparent select-none font-sans pointer-events-none"
        style={{ WebkitTextStroke: '2.5px rgba(251, 146, 60, 0.35)' }}
      >
        1
      </span>

      {/* Character (Magnifying Glass) */}
      <div className="flex flex-col items-center shrink-0 z-10">
        <div className="relative h-28 w-16 sm:h-32 sm:w-20">
          <svg viewBox="0 0 100 160" className="h-full w-full">
            <circle cx="70" cy="35" r="14" fill="#93C5FD" stroke="#1E3A8A" strokeWidth="4" />
            <line x1="60" y1="45" x2="48" y2="58" stroke="#374151" strokeWidth="5" strokeLinecap="round" />
            <circle cx="50" cy="28" r="12" fill="#FBCFE8" />
            <path d="M40 22 C40 12, 60 12, 60 22 Z" fill="#1F2937" />
            <path d="M36 40 L64 40 L60 85 L40 85 Z" fill="#FF6B00" />
            <path d="M64 42 Q75 50 68 38" stroke="#FF6B00" strokeWidth="6" strokeLinecap="round" fill="none" />
            <path d="M36 42 Q28 55 35 65" stroke="#FF6B00" strokeWidth="6" strokeLinecap="round" fill="none" />
            <path d="M40 85 L40 145 L48 145 L49 98 L51 98 L52 145 L60 145 L60 85 Z" fill="#374151" />
            <rect x="36" y="145" width="14" height="6" rx="3" fill="#D97706" />
            <rect x="52" y="145" width="14" height="6" rx="3" fill="#D97706" />
          </svg>
        </div>
      </div>

      {/* Card: Explore Trips */}
      <div className="w-48 sm:w-56 rounded-2xl border border-gray-100 bg-white p-3.5 shadow-xl text-left z-10">
        <p className="text-xs font-black text-gray-900 mb-2">Explore Trips</p>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg overflow-hidden bg-amber-100 shrink-0">
              <img src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=100&q=80" alt="" className="h-full w-full object-cover" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-800">Ladakh</p>
              <div className="h-1.5 w-16 bg-gray-200 rounded-full mt-1" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg overflow-hidden bg-blue-100 shrink-0">
              <img src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=100&q=80" alt="" className="h-full w-full object-cover" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-800">Manali</p>
              <div className="h-1.5 w-14 bg-gray-200 rounded-full mt-1" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg overflow-hidden bg-green-100 shrink-0">
              <img src="https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=100&q=80" alt="" className="h-full w-full object-cover" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-800">Goa</p>
              <div className="h-1.5 w-18 bg-gray-200 rounded-full mt-1" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Step2Content() {
  return (
    <div className="relative flex items-center gap-2 sm:gap-4">
      {/* Outline 2 in background */}
      <span
        className="absolute -left-8 -top-12 text-8xl sm:text-9xl font-black text-transparent select-none font-sans pointer-events-none"
        style={{ WebkitTextStroke: '2.5px rgba(251, 146, 60, 0.35)' }}
      >
        2
      </span>

      {/* Character (Girl in Green Pointing) */}
      <div className="flex flex-col items-center shrink-0 z-10">
        <div className="relative h-28 w-16 sm:h-32 sm:w-20">
          <svg viewBox="0 0 100 160" className="h-full w-full">
            <path d="M38 18 C38 8, 62 8, 62 18 L64 36 L36 36 Z" fill="#1F2937" />
            <circle cx="50" cy="24" r="10" fill="#FED7AA" />
            <path d="M38 34 L62 34 L58 75 L42 75 Z" fill="#10B981" />
            <path d="M62 36 Q75 42 82 38" stroke="#10B981" strokeWidth="5" strokeLinecap="round" fill="none" />
            <path d="M38 38 Q28 48 36 56" stroke="#10B981" strokeWidth="5" strokeLinecap="round" fill="none" />
            <path d="M42 75 L42 140 L48 140 L49 90 L51 90 L52 140 L58 140 L58 75 Z" fill="#1E293B" />
            <rect x="38" y="140" width="12" height="5" rx="2.5" fill="#10B981" />
            <rect x="52" y="140" width="12" height="5" rx="2.5" fill="#10B981" />
          </svg>
        </div>
      </div>

      {/* Card: Compare Trips */}
      <div className="w-48 sm:w-56 rounded-2xl border border-gray-100 bg-white p-3.5 shadow-xl text-left z-10">
        <p className="text-xs font-black text-gray-900 mb-2">Compare Trips</p>
        <div className="space-y-2">
          <div className="rounded-xl border border-gray-100 p-2 bg-gray-50/50">
            <div className="h-1.5 w-24 bg-gray-300 rounded-full" />
            <div className="mt-2 flex items-center justify-between">
              <span className="text-[10px] font-bold text-amber-500">★★★★☆ 4.8</span>
              <span className="rounded-full bg-[#FF6B00] px-2 py-0.5 text-[9px] font-bold text-white">Compare</span>
            </div>
          </div>

          <div className="rounded-xl border border-emerald-100 p-2 bg-emerald-50/30">
            <div className="h-1.5 w-20 bg-gray-300 rounded-full" />
            <div className="mt-2 flex items-center justify-between">
              <span className="text-[10px] font-bold text-emerald-600">★★★★★ 5.0</span>
              <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-[9px] font-bold text-white">Verified</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Step3Content() {
  return (
    <div className="relative flex items-center gap-2 sm:gap-4">
      {/* Outline 3 in background */}
      <span
        className="absolute -left-8 -top-12 text-8xl sm:text-9xl font-black text-transparent select-none font-sans pointer-events-none"
        style={{ WebkitTextStroke: '2.5px rgba(251, 146, 60, 0.35)' }}
      >
        3
      </span>

      {/* Character (Guy in Orange Coat Pointing) */}
      <div className="flex flex-col items-center shrink-0 z-10">
        <div className="relative h-28 w-16 sm:h-32 sm:w-20">
          <svg viewBox="0 0 100 160" className="h-full w-full">
            <circle cx="50" cy="24" r="10" fill="#FED7AA" />
            <path d="M42 26 C42 34, 58 34, 58 26 Z" fill="#1F2937" />
            <path d="M36 36 L64 36 L62 80 L38 80 Z" fill="#EA580C" />
            <path d="M64 38 Q78 46 84 40" stroke="#EA580C" strokeWidth="5" strokeLinecap="round" fill="none" />
            <path d="M38 80 L38 145 L46 145 L49 95 L51 95 L54 145 L62 145 L62 80 Z" fill="#2563EB" />
            <rect x="34" y="145" width="14" height="6" rx="3" fill="#1F2937" />
            <rect x="52" y="145" width="14" height="6" rx="3" fill="#1F2937" />
          </svg>
        </div>
      </div>

      {/* Card: Curator Profile (WanderVista Travels) */}
      <div className="w-48 sm:w-56 rounded-2xl border border-gray-100 bg-white overflow-hidden shadow-xl text-center z-10">
        <div className="bg-[#86EFAC] pt-4 pb-3 flex justify-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 shadow border-2 border-white text-sm font-black text-emerald-800 overflow-hidden">
            <svg viewBox="0 0 40 40" className="h-full w-full">
              <circle cx="20" cy="14" r="7" fill="#F59E0B" />
              <path d="M10 34 C10 24 30 24 30 34 Z" fill="#10B981" />
            </svg>
          </div>
        </div>
        <div className="p-3">
          <p className="text-xs font-black text-gray-900 leading-tight">WanderVista Travels</p>
          <p className="text-[10px] text-gray-400 mt-0.5">Profile</p>
          <div className="flex items-center justify-center gap-1.5 my-2">
            <span className="h-3 w-3 rounded-full bg-blue-500 text-white flex items-center justify-center text-[7px] font-black">
              ✓
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-gray-200" />
            <span className="h-1.5 w-1.5 rounded-full bg-gray-200" />
            <span className="h-1.5 w-1.5 rounded-full bg-gray-200" />
          </div>
          <button
            type="button"
            className="w-full rounded-full bg-[#FF6B00] py-1 text-[11px] font-bold text-white shadow-sm hover:bg-[#e05e00] transition-colors"
          >
            Profile
          </button>
        </div>
      </div>
    </div>
  );
}

function Step4Content() {
  return (
    <div className="relative flex items-center gap-2 sm:gap-4">
      {/* Outline 4 in background */}
      <span
        className="absolute -left-8 -top-12 text-8xl sm:text-9xl font-black text-transparent select-none font-sans pointer-events-none"
        style={{ WebkitTextStroke: '2.5px rgba(251, 146, 60, 0.35)' }}
      >
        4
      </span>

      {/* Character (Girl with Tablet) */}
      <div className="flex flex-col items-center shrink-0 z-10">
        <div className="relative h-28 w-16 sm:h-32 sm:w-20">
          <svg viewBox="0 0 100 160" className="h-full w-full">
            <circle cx="50" cy="24" r="10" fill="#FED7AA" />
            <path d="M38 16 C38 8, 62 8, 62 16 L64 36 L36 36 Z" fill="#1F2937" />
            <path d="M38 34 L62 34 L58 75 L42 75 Z" fill="#10B981" />
            <rect x="55" y="44" width="16" height="20" rx="2" fill="#374151" />
            <rect x="57" y="46" width="12" height="16" rx="1" fill="#93C5FD" />
            <path d="M42 75 L42 140 L48 140 L49 90 L51 90 L52 140 L58 140 L58 75 Z" fill="#1E293B" />
            <rect x="38" y="140" width="12" height="5" rx="2.5" fill="#10B981" />
            <rect x="52" y="140" width="12" height="5" rx="2.5" fill="#10B981" />
          </svg>
        </div>
      </div>

      {/* Card: Send Inquiry */}
      <div className="w-48 sm:w-56 rounded-2xl border border-gray-100 bg-white p-3.5 shadow-xl text-left z-10">
        <p className="text-xs font-black text-gray-900 mb-1">Send Inquiry</p>
        <p className="text-[10px] text-gray-400 mb-2">&apos;Aarohi Sharma&apos;</p>
        <div className="space-y-1.5 mb-3">
          <div className="h-1.5 w-full bg-gray-200 rounded-full" />
          <div className="h-1.5 w-5/6 bg-gray-200 rounded-full" />
          <div className="h-1.5 w-2/3 bg-gray-200 rounded-full" />
        </div>
        <button
          type="button"
          className="w-full rounded-full bg-[#FF6B00] py-1.5 text-center text-[11px] font-bold text-white shadow-sm hover:bg-[#e05e00] transition-colors"
        >
          Send Inquiry
        </button>
      </div>
    </div>
  );
}

function Step5Content() {
  return (
    <div className="relative flex items-center gap-2 sm:gap-4">
      {/* Outline 5 in background */}
      <span
        className="absolute -left-8 -top-12 text-8xl sm:text-9xl font-black text-transparent select-none font-sans pointer-events-none"
        style={{ WebkitTextStroke: '2.5px rgba(251, 146, 60, 0.35)' }}
      >
        5
      </span>

      {/* Character (Guy with Chat Bubble) */}
      <div className="flex flex-col items-center shrink-0 z-10">
        <div className="relative h-28 w-16 sm:h-32 sm:w-20">
          <svg viewBox="0 0 100 160" className="h-full w-full">
            <circle cx="50" cy="24" r="10" fill="#FED7AA" />
            <path d="M42 16 C42 8, 58 8, 58 16 L60 30 L40 30 Z" fill="#1F2937" />
            <path d="M38 34 L62 34 L60 80 L40 80 Z" fill="#22C55E" />
            <path d="M40 80 L40 145 L48 145 L49 95 L51 95 L52 145 L60 145 L60 80 Z" fill="#2563EB" />
            <rect x="58" y="14" width="22" height="14" rx="4" fill="#3B82F6" />
            <circle cx="64" cy="21" r="1.5" fill="#FFFFFF" />
            <circle cx="69" cy="21" r="1.5" fill="#FFFFFF" />
            <circle cx="74" cy="21" r="1.5" fill="#FFFFFF" />
          </svg>
        </div>
      </div>

      {/* Card: Chat Window */}
      <div className="w-52 sm:w-60 rounded-2xl border border-gray-100 bg-white p-3 shadow-xl text-left z-10">
        <div className="flex items-center gap-1.5 border-b border-gray-100 pb-2 mb-2">
          <span className="text-gray-400 text-xs font-bold">&lt;</span>
          <div className="h-5 w-5 rounded-full bg-amber-200 flex items-center justify-center text-[9px] font-black">
            TC
          </div>
          <p className="text-[11px] font-bold text-gray-900">WanderVista Travels</p>
        </div>

        <div className="space-y-2 mb-2">
          <div className="flex justify-end">
            <span className="rounded-xl rounded-tr-none bg-blue-500 px-2.5 py-1 text-[10px] text-white">
              Hey what about customize trips kashmir to leha?
            </span>
          </div>
          <div className="flex justify-start items-center gap-1">
            <span className="rounded-xl rounded-tl-none bg-gray-100 px-2.5 py-1 text-[10px] text-gray-800">
              Hey hi, we are in!
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-[10px] text-gray-400">
          <span className="flex-1 truncate">Type a message...</span>
          <Smile className="h-3.5 w-3.5 text-gray-400" />
          <Send className="h-3.5 w-3.5 text-blue-500" />
        </div>
      </div>
    </div>
  );
}

function Step6Content() {
  return (
    <div className="relative flex items-center gap-2 sm:gap-4">
      {/* Outline 6 in background */}
      <span
        className="absolute -left-8 -top-12 text-8xl sm:text-9xl font-black text-transparent select-none font-sans pointer-events-none"
        style={{ WebkitTextStroke: '2.5px rgba(251, 146, 60, 0.35)' }}
      >
        6
      </span>

      {/* Card: Trip Confirmed */}
      <div className="w-48 sm:w-56 rounded-2xl border border-gray-100 bg-white p-3.5 shadow-xl text-left z-10">
        <p className="text-xs font-black text-gray-900 mb-1">Trip Confirmed</p>
        <div className="space-y-1.5 my-2">
          <div className="h-1.5 w-full bg-gray-200 rounded-full" />
          <div className="h-1.5 w-4/5 bg-gray-200 rounded-full" />
        </div>
        <button
          type="button"
          className="w-full rounded-full bg-[#FF6B00] py-1.5 text-center text-[11px] font-bold text-white shadow-sm flex items-center justify-center gap-1 hover:bg-[#e05e00] transition-colors"
        >
          <Check className="h-3 w-3" /> Trip Confirmed
        </button>
      </div>

      {/* Character (Girl Waving with Trolley Suitcase) */}
      <div className="flex flex-col items-center shrink-0 z-10">
        <div className="relative h-28 w-16 sm:h-32 sm:w-20">
          <svg viewBox="0 0 100 160" className="h-full w-full">
            <circle cx="50" cy="24" r="10" fill="#FED7AA" />
            <path d="M38 16 C38 8, 62 8, 62 16 L64 36 L36 36 Z" fill="#1F2937" />
            <path d="M38 34 L62 34 L60 75 L40 75 Z" fill="#FF6B00" />
            <path d="M62 36 Q74 24 78 16" stroke="#FF6B00" strokeWidth="5" strokeLinecap="round" fill="none" />
            <path d="M38 38 L30 65" stroke="#FF6B00" strokeWidth="5" strokeLinecap="round" fill="none" />
            <rect x="18" y="75" width="16" height="32" rx="3" fill="#10B981" />
            <line x1="26" y1="65" x2="26" y2="75" stroke="#374151" strokeWidth="3" />
            <circle cx="21" cy="110" r="2" fill="#1F2937" />
            <circle cx="31" cy="110" r="2" fill="#1F2937" />
            <path d="M40 75 L40 140 L46 140 L49 90 L51 90 L54 140 L60 140 L60 75 Z" fill="#2563EB" />
          </svg>
        </div>
      </div>
    </div>
  );
}

/* ── MAIN COMPONENT (RESPONSIVE: MOBILE + DESKTOP) ────────────────── */

export default function HowItWorks() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mobilePathRef = useRef<SVGPathElement>(null);
  const desktopPathRef = useRef<SVGPathElement>(null);

  const [scrollProgress, setScrollProgress] = useState(0.1);
  const [mobilePathLength, setMobilePathLength] = useState(1800);
  const [desktopPathLength, setDesktopPathLength] = useState(2200);

  useEffect(() => {
    if (mobilePathRef.current) {
      const len = mobilePathRef.current.getTotalLength();
      if (len > 0) setMobilePathLength(len);
    }
    if (desktopPathRef.current) {
      const len = desktopPathRef.current.getTotalLength();
      if (len > 0) setDesktopPathLength(len);
    }

    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Start when top of section reaches 85% of window height
      const start = windowHeight * 0.85;
      // Complete 100% when user has scrolled ~45% of the section height
      // This ensures 100% progress (full path drawn to Step 6) while the section is fully in view!
      const travelDistance = Math.max(260, rect.height * 0.45);
      const scrolled = start - rect.top;
      const progress = Math.max(0.02, Math.min(1, scrolled / travelDistance));
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative w-full overflow-hidden bg-[#FAF8F5] py-14 sm:py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        {/* Top Header */}
        <div className="mb-10 sm:mb-12 flex flex-col items-center justify-center">
          <p className="text-[11px] sm:text-xs text-gray-400 mb-1 hidden sm:block">
            TernoTrip is where great journeys find the right people.
          </p>
          <p className="text-xs sm:text-sm font-bold tracking-wide text-[#FF6B00]">
            How It Works for Travelers?
          </p>
          <div className="mt-1 flex items-center justify-center gap-2">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">
              Your next journey starts with one search.
            </h2>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════════
            1. MOBILE VIEW (Vertical Zigzag Path — REVEALS AS LINE REACHES)
           ════════════════════════════════════════════════════════════════ */}
        <div className="relative min-h-[1750px] w-full block lg:hidden">
          {/* Mobile SVG Scroll Path */}
          <svg
            className="absolute inset-0 h-full w-full pointer-events-none z-0"
            viewBox="0 0 400 1750"
            fill="none"
            preserveAspectRatio="none"
          >
            <path
              d="M 260 130 C 260 280, 140 280, 140 430 C 140 580, 260 580, 260 730 C 260 880, 140 880, 140 1030 C 140 1180, 260 1180, 260 1330 C 260 1480, 140 1480, 140 1630"
              stroke="#E5E0D8"
              strokeWidth="24"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.4"
            />
            <path
              ref={mobilePathRef}
              d="M 260 130 C 260 280, 140 280, 140 430 C 140 580, 260 580, 260 730 C 260 880, 140 880, 140 1030 C 140 1180, 260 1180, 260 1330 C 260 1480, 140 1480, 140 1630"
              stroke="#FFFFFF"
              strokeWidth="22"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={mobilePathLength}
              strokeDashoffset={mobilePathLength * (1 - scrollProgress)}
              className="transition-[stroke-dashoffset] duration-150 ease-out"
              style={{ filter: 'drop-shadow(0px 3px 6px rgba(0,0,0,0.06))' }}
            />
          </svg>

          {/* Mobile Steps (Only reveal when white line arrives at that point) */}
          <div
            className={`absolute top-0 right-2 z-10 transition-all duration-700 ${
              scrollProgress >= 0.05
                ? 'opacity-100 scale-100 translate-y-0'
                : 'opacity-0 scale-90 translate-y-6 pointer-events-none'
            }`}
          >
            <Step1Content />
          </div>
          <div
            className={`absolute top-[310px] left-2 z-10 transition-all duration-700 ${
              scrollProgress >= 0.20
                ? 'opacity-100 scale-100 translate-y-0'
                : 'opacity-0 scale-90 translate-y-6 pointer-events-none'
            }`}
          >
            <Step2Content />
          </div>
          <div
            className={`absolute top-[610px] right-2 z-10 transition-all duration-700 ${
              scrollProgress >= 0.38
                ? 'opacity-100 scale-100 translate-y-0'
                : 'opacity-0 scale-90 translate-y-6 pointer-events-none'
            }`}
          >
            <Step3Content />
          </div>
          <div
            className={`absolute top-[920px] left-2 z-10 transition-all duration-700 ${
              scrollProgress >= 0.55
                ? 'opacity-100 scale-100 translate-y-0'
                : 'opacity-0 scale-90 translate-y-6 pointer-events-none'
            }`}
          >
            <Step4Content />
          </div>
          <div
            className={`absolute top-[1220px] right-2 z-10 transition-all duration-700 ${
              scrollProgress >= 0.72
                ? 'opacity-100 scale-100 translate-y-0'
                : 'opacity-0 scale-90 translate-y-6 pointer-events-none'
            }`}
          >
            <Step5Content />
          </div>
          <div
            className={`absolute top-[1520px] left-2 z-10 transition-all duration-700 ${
              scrollProgress >= 0.88
                ? 'opacity-100 scale-100 translate-y-0'
                : 'opacity-0 scale-90 translate-y-6 pointer-events-none'
            }`}
          >
            <Step6Content />
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════════
            2. DESKTOP VIEW (2-ROW ORTHOGONAL ROAD CIRCUIT WITH BALLOON)
               Task 2: ONLY reveal each card when white line reaches that point!
           ════════════════════════════════════════════════════════════════ */}
        <div className="relative min-h-[500px] w-full hidden lg:block">
          <svg
            className="absolute inset-0 h-full w-full pointer-events-none z-0"
            viewBox="0 0 1200 520"
            fill="none"
            preserveAspectRatio="none"
          >
            {/* Background Faint Track */}
            <path
              d="M 120 120 L 1030 120 Q 1060 120 1060 150 L 1060 380 Q 1060 410 1030 410 L 120 410"
              stroke="#EFEBE4"
              strokeWidth="28"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Foreground Solid White Animated Road */}
            <path
              ref={desktopPathRef}
              d="M 120 120 L 1030 120 Q 1060 120 1060 150 L 1060 380 Q 1060 410 1030 410 L 120 410"
              stroke="#FFFFFF"
              strokeWidth="24"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={desktopPathLength}
              strokeDashoffset={desktopPathLength * (1 - scrollProgress)}
              className="transition-[stroke-dashoffset] duration-150 ease-out"
              style={{ filter: 'drop-shadow(0px 4px 10px rgba(0,0,0,0.08))' }}
            />
          </svg>

          {/* Realistic Hot Air Balloon Floating between Step 2 and Step 3 */}
          <div
            className={`absolute -top-3 left-[66%] -translate-x-1/2 z-20 pointer-events-none transition-all duration-700 ${
              scrollProgress >= 0.32
                ? 'opacity-100 scale-100'
                : 'opacity-0 scale-75'
            }`}
            style={{
              animation: 'floatBalloon 4s ease-in-out infinite alternate',
            }}
          >
            <HotAirBalloon className="h-20 w-16" />
          </div>

          <style jsx>{`
            @keyframes floatBalloon {
              0% {
                transform: translateY(0px) rotate(-2deg);
              }
              50% {
                transform: translateY(-12px) rotate(2deg);
              }
              100% {
                transform: translateY(0px) rotate(-2deg);
              }
            }
          `}</style>

          {/* ── ROW 1 (Steps 1, 2, 3 Left to Right) ─────────────────── */}
          {/* Step 1: Left — reveals when white line starts */}
          <div
            className={`absolute top-0 left-6 z-10 transition-all duration-700 ${
              scrollProgress >= 0.05
                ? 'opacity-100 scale-100 translate-y-0'
                : 'opacity-0 scale-90 translate-y-6 pointer-events-none'
            }`}
          >
            <Step1Content />
          </div>

          {/* Step 2: Center — reveals when line reaches center of row 1 */}
          <div
            className={`absolute top-0 left-1/2 -translate-x-1/2 z-10 transition-all duration-700 ${
              scrollProgress >= 0.20
                ? 'opacity-100 scale-100 translate-y-0'
                : 'opacity-0 scale-90 translate-y-6 pointer-events-none'
            }`}
          >
            <Step2Content />
          </div>

          {/* Step 3: Right — reveals when line reaches right side of row 1 */}
          <div
            className={`absolute top-0 right-14 z-10 transition-all duration-700 ${
              scrollProgress >= 0.38
                ? 'opacity-100 scale-100 translate-y-0'
                : 'opacity-0 scale-90 translate-y-6 pointer-events-none'
            }`}
          >
            <Step3Content />
          </div>

          {/* ── ROW 2 (Steps 4, 5, 6 Right to Left) ─────────────────── */}
          {/* Step 4: Right (Under Step 3) — reveals when line drops vertically to row 2 */}
          <div
            className={`absolute top-[290px] right-14 z-10 transition-all duration-700 ${
              scrollProgress >= 0.54
                ? 'opacity-100 scale-100 translate-y-0'
                : 'opacity-0 scale-90 translate-y-6 pointer-events-none'
            }`}
          >
            <Step4Content />
          </div>

          {/* Step 5: Center (Under Step 2) — reveals when line reaches center of row 2 */}
          <div
            className={`absolute top-[290px] left-1/2 -translate-x-1/2 z-10 transition-all duration-700 ${
              scrollProgress >= 0.72
                ? 'opacity-100 scale-100 translate-y-0'
                : 'opacity-0 scale-90 translate-y-6 pointer-events-none'
            }`}
          >
            <Step5Content />
          </div>

          {/* Step 6: Left (Under Step 1) — reveals when line reaches the end at Step 6 */}
          <div
            className={`absolute top-[290px] left-6 z-10 transition-all duration-700 ${
              scrollProgress >= 0.88
                ? 'opacity-100 scale-100 translate-y-0'
                : 'opacity-0 scale-90 translate-y-6 pointer-events-none'
            }`}
          >
            <Step6Content />
          </div>
        </div>

        {/* ── Bottom Collaborations Section with India Map ── */}
        <div className="mt-8 pt-8 border-t border-gray-200/50">
          <CollaborationsSection />
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   COLLABORATIONS SECTION — Exact Match with Real India Map Image
   Left: Text + 3 buttons | Right: India Map Image from Screenshot
   ═══════════════════════════════════════════════════════════════════ */
function CollaborationsSection() {
  return (
    <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12 text-left">
      {/* ── Left: Text + Buttons ── */}
      <div className="flex-shrink-0 w-full lg:w-[390px]">
        <p className="text-sm font-bold tracking-wide text-[#FF6B00]">Our Collaborations</p>
        <h3 className="mt-2 text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight tracking-tight">
          TernoTrip is built on<br />meaningful<br />partnerships.
        </h3>
        <p className="mt-4 text-sm text-gray-500 leading-relaxed">
          We&apos;re proud to collaborate with travel businesses, expedition leaders
          and adventure communities across India to help travelers discover
          experiences they won&apos;t find anywhere else.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            className="rounded-full border-2 border-gray-900 px-5 py-2.5 text-sm font-semibold text-gray-900 hover:bg-gray-900 hover:text-white transition-colors"
          >
            Join us today
          </button>
          <button
            type="button"
            className="flex items-center gap-2 rounded-full bg-[#FF6B00] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#e05e00] transition-colors shadow-md"
          >
            All Partners
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <div className="mt-3">
          <button
            type="button"
            className="flex items-center gap-2 rounded-full border-2 border-[#FF6B00] px-5 py-2.5 text-sm font-semibold text-[#FF6B00] hover:bg-orange-50 transition-colors"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#FF6B00]">
              <svg className="h-3 w-3 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
            Watch the Explainer
          </button>
        </div>
      </div>

      {/* ── Right: Exact India Map Image Uploaded by User ── */}
      <div className="flex-1 relative flex items-center justify-center min-w-0 w-full">
        <div className="relative w-full max-w-[530px] flex justify-center">
          <img
            src="/india-map.png"
            alt="India Collaborations Map"
            className="w-full h-auto object-contain select-none drop-shadow-md"
          />

          {/* Floating Tooltip Card matching the screenshot (Triphelp / Paschim Medinipur) */}
          <div className="absolute top-[38%] right-[22%] z-10 transition-transform duration-300 hover:scale-105 pointer-events-auto">
            <div className="relative rounded-xl bg-[#1E2D3D] px-3.5 py-1.5 shadow-2xl text-center">
              <p className="text-[10px] font-bold text-white tracking-wide">Triphelp</p>
              <p className="text-[8px] font-bold text-[#FB923C] tracking-wider uppercase mt-0.5">
                PASCHIM MEDINIPUR
              </p>
              <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-6 border-t-[#1E2D3D]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
