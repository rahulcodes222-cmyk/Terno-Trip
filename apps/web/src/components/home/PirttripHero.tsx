'use client';

import React, { useState, useRef } from 'react';
import { Search, Users, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';

export interface CategoryItem {
  id: string;
  name: string;
  image: string;
  ribbonColor: string;
}

export const CATEGORIES: CategoryItem[] = [
  {
    id: 'backpackers',
    name: 'BACKPACKERS',
    image: 'https://images.unsplash.com/photo-1527631746610-bca00a040d60?w=400&q=80',
    ribbonColor: 'bg-gradient-to-r from-amber-700 to-amber-900 border-amber-600',
  },
  {
    id: 'beaches',
    name: 'BEACHES',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=80',
    ribbonColor: 'bg-gradient-to-r from-teal-600 to-cyan-800 border-teal-500',
  },
  {
    id: 'heritage',
    name: 'HERITAGE',
    image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=400&q=80',
    ribbonColor: 'bg-gradient-to-r from-indigo-700 to-purple-900 border-indigo-600',
  },
  {
    id: 'hiking',
    name: 'HIKING',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&q=80',
    ribbonColor: 'bg-gradient-to-r from-blue-600 to-sky-800 border-blue-500',
  },
  {
    id: 'adventure',
    name: 'ADVENTURE',
    image: 'https://images.unsplash.com/photo-1533240332313-0db49b459ad6?w=400&q=80',
    ribbonColor: 'bg-gradient-to-r from-emerald-600 to-green-800 border-emerald-500',
  },
  {
    id: 'wildlife',
    name: 'WILDLIFE',
    image: 'https://images.unsplash.com/photo-1534188753412-3e26d0d618d6?w=400&q=80',
    ribbonColor: 'bg-gradient-to-r from-lime-700 to-green-900 border-lime-600',
  },
  {
    id: 'spiritual',
    name: 'SPIRITUAL',
    image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&q=80',
    ribbonColor: 'bg-gradient-to-r from-teal-700 to-emerald-950 border-teal-600',
  },
];

interface PirttripHeroProps {
  onSearch?: (params: { query?: string; category?: string; travellers?: number; tripType?: string }) => void;
  selectedCategory?: string;
  onSelectCategory?: (category: string) => void;
}

export default function PirttripHero({
  onSearch,
  selectedCategory = 'all',
  onSelectCategory,
}: PirttripHeroProps) {
  const router = useRouter();
  const carouselRef = useRef<HTMLDivElement>(null);

  // Form states
  const [destinationScope, setDestinationScope] = useState<'any' | 'domestic'>('any');
  const [petFriendly, setPetFriendly] = useState(false);
  const [audience, setAudience] = useState<'all' | 'women'>('all');
  const [query, setQuery] = useState('');
  const [travellers, setTravellers] = useState(1);
  const [selectedTripType, setSelectedTripType] = useState<string>('standard');
  const [showTravellerDropdown, setShowTravellerDropdown] = useState(false);

  const scrollBadges = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const offset = direction === 'left' ? -220 : 220;
      carouselRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  const handleCategoryClick = (catId: string) => {
    if (onSelectCategory) {
      onSelectCategory(catId === selectedCategory ? 'all' : catId);
    }
    const target = document.getElementById('curated-trips');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (onSearch) {
      onSearch({
        query: query.trim() || undefined,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        travellers,
        tripType: selectedTripType,
      });
    }
    const target = document.getElementById('curated-trips');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    } else {
      router.push(`/trips?query=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className="relative w-full bg-[#14181F] overflow-hidden">
      {/* ── Background Landscape Image ───────────────────────── */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1920&q=80"
          alt="Panoramic Mountains"
          className="h-full w-full object-cover object-center"
        />
        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#14181F]/70 via-[#14181F]/40 to-[#14181F]/90" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 pt-12 pb-16 sm:px-6 lg:px-8">
        {/* ── Top Hero Headline ──────────────────────────────── */}
        <div className="text-center mb-10 sm:mb-14">
          <h1 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl md:text-5xl drop-shadow-md">
            Connecting <span className="text-[#FFA300]">Travelers</span> to Trip <span className="text-[#FFA300]">Curators</span>
          </h1>
          <p className="mt-3 text-sm font-medium tracking-widest text-gray-200 uppercase sm:text-base opacity-95">
            Discover &nbsp;|&nbsp; Compare &nbsp;|&nbsp; Decide &nbsp;|&nbsp; Travel
          </p>
        </div>

        {/* ── Floating Category Badges Row ───────────────────── */}
        <div className="relative mb-2">
          {/* Scroll arrow Left */}
          <button
            type="button"
            onClick={() => scrollBadges('left')}
            className="absolute -left-3 top-1/2 -translate-y-1/2 z-20 flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-white shadow-lg text-gray-800 hover:bg-[#FFA300] hover:text-white transition-colors"
            aria-label="Previous categories"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          {/* Carousel Track */}
          <div
            ref={carouselRef}
            className="flex items-end justify-start sm:justify-center gap-3 sm:gap-4 overflow-x-auto scrollbar-none py-4 px-2 scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory.toLowerCase() === cat.id.toLowerCase();
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategoryClick(cat.id)}
                  className={`group relative flex flex-col items-center shrink-0 transition-transform duration-200 hover:-translate-y-1.5 focus:outline-none ${
                    isSelected ? 'scale-105' : 'opacity-90 hover:opacity-100'
                  }`}
                >
                  {/* Circular Image Container */}
                  <div
                    className={`relative h-20 w-20 sm:h-24 sm:w-24 rounded-full overflow-hidden border-[3px] shadow-md transition-all ${
                      isSelected
                        ? 'border-[#FFA300] ring-4 ring-[#FFA300]/40'
                        : 'border-white/90 group-hover:border-[#FFA300]'
                    }`}
                  >
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                  </div>

                  {/* Ribbon Banner at bottom of circle */}
                  <div
                    className={`-mt-3.5 z-10 px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider text-white border uppercase shadow-md ${
                      cat.ribbonColor
                    }`}
                  >
                    {cat.name}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Scroll arrow Right */}
          <button
            type="button"
            onClick={() => scrollBadges('right')}
            className="absolute -right-3 top-1/2 -translate-y-1/2 z-20 flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-white shadow-lg text-gray-800 hover:bg-[#FFA300] hover:text-white transition-colors"
            aria-label="Next categories"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Down Chevron Indicator from mobile screenshot */}
        <div className="flex justify-center -mt-1 mb-4">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm shadow">
            <ChevronDown className="h-4 w-4" />
          </div>
        </div>

        {/* ── White Search Card (Exact Mobile & Desktop Match) ──────────────── */}
        <div className="relative rounded-3xl bg-white p-4 sm:p-7 shadow-2xl border border-gray-100 max-w-4xl mx-auto">
          {/* Row 1: Radios (Any, Domestic — No International) */}
          <div className="mb-4 flex items-center gap-6 border-b border-gray-100 pb-3 text-xs font-semibold text-gray-700">
            <label className="flex items-center gap-2 cursor-pointer hover:text-[#FFA300]">
              <input
                type="radio"
                name="destScope"
                checked={destinationScope === 'any'}
                onChange={() => setDestinationScope('any')}
                className="accent-[#FFA300] h-4 w-4"
              />
              <span className="text-gray-900 font-bold">Any</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer hover:text-[#FFA300]">
              <input
                type="radio"
                name="destScope"
                checked={destinationScope === 'domestic'}
                onChange={() => setDestinationScope('domestic')}
                className="accent-[#FFA300] h-4 w-4"
              />
              <span className="text-gray-700 font-medium">Domestic</span>
            </label>
          </div>

          {/* Row 2: All / Women/Girls Only + Pet Friendly Checkbox */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            {/* Left audience pill group */}
            <div className="flex items-center rounded-full bg-gray-100/90 p-0.5 border border-gray-200/50">
              <button
                type="button"
                onClick={() => setAudience('all')}
                className={`rounded-full px-3.5 py-1 text-xs font-bold transition-colors ${
                  audience === 'all'
                    ? 'bg-[#FFA300] text-gray-950 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setAudience('women')}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                  audience === 'women'
                    ? 'bg-[#FFA300] text-gray-950 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Women/Girls Only
              </button>
            </div>

            {/* Right: Pet Friendly Checkbox */}
            <label className="flex items-center gap-2 cursor-pointer hover:text-[#FFA300] text-xs font-semibold text-gray-700 select-none">
              <input
                type="checkbox"
                checked={petFriendly}
                onChange={(e) => setPetFriendly(e.target.checked)}
                className="accent-[#FFA300] h-4 w-4 rounded border-gray-300"
              />
              <span>Pet Friendly</span>
            </label>
          </div>

          {/* Row 3: Destination Input Box */}
          <div className="mb-3 rounded-2xl border border-gray-200 bg-white p-3.5 transition-all focus-within:border-[#FFA300] focus-within:ring-2 focus-within:ring-[#FFA300]/20">
            <p className="text-xs font-bold text-gray-900 leading-tight">Don&apos;t Think Much, Just Go!</p>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
              placeholder="Where do you want to go?"
              className="w-full bg-transparent text-sm text-gray-800 placeholder-gray-400 focus:outline-none mt-1"
            />
          </div>

          {/* Row 4: Travellers Selector Box */}
          <div
            className="relative mb-4 rounded-2xl border border-gray-200 bg-white p-3.5 cursor-pointer select-none transition-all hover:border-[#FFA300]"
            onClick={() => setShowTravellerDropdown(!showTravellerDropdown)}
          >
            <p className="text-xs font-bold text-gray-900 leading-tight">No. Of Travellers</p>
            <p className="text-sm text-gray-500 mt-1">
              {travellers > 1 ? `${travellers} Travellers` : 'Add No.'}
            </p>

            {/* Travellers dropdown */}
            {showTravellerDropdown && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowTravellerDropdown(false);
                  }}
                />
                <div className="absolute left-0 right-0 top-full z-30 mt-2 rounded-xl border border-gray-100 bg-white p-2.5 shadow-xl">
                  <p className="mb-2 px-1 text-xs font-bold text-gray-500 uppercase">Select Travellers</p>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[1, 2, 3, 4, 5, 6, 8, 10].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setTravellers(num);
                          setShowTravellerDropdown(false);
                        }}
                        className={`rounded-lg py-1.5 text-xs font-bold transition-colors ${
                          travellers === num
                            ? 'bg-[#FFA300] text-gray-950 font-black'
                            : 'bg-gray-50 hover:bg-gray-100 text-gray-800'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Row 5: 3 Trip Type Pills in One Row (Mobile exact from screenshot) */}
          <div className="mb-4 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedTripType('standard')}
              className={`flex-1 rounded-full border py-1.5 px-2 text-center text-xs font-bold transition-all ${
                selectedTripType === 'standard'
                  ? 'border-[#FFA300] bg-amber-50 text-gray-950 font-black ring-1 ring-[#FFA300]'
                  : 'border-amber-300/80 bg-white text-gray-700 hover:border-[#FFA300]'
              }`}
            >
              Standard
            </button>
            <button
              type="button"
              onClick={() => setSelectedTripType('exclusive')}
              className={`flex-1 rounded-full border py-1.5 px-2 text-center text-xs font-bold transition-all ${
                selectedTripType === 'exclusive'
                  ? 'border-[#FFA300] bg-amber-50 text-gray-950 font-black ring-1 ring-[#FFA300]'
                  : 'border-amber-300/80 bg-white text-gray-700 hover:border-[#FFA300]'
              }`}
            >
              Exclusive
            </button>
            <button
              type="button"
              onClick={() => setSelectedTripType('luxury')}
              className={`flex-1 rounded-full border py-1.5 px-2 text-center text-xs font-bold transition-all ${
                selectedTripType === 'luxury'
                  ? 'border-[#FFA300] bg-amber-50 text-gray-950 font-black ring-1 ring-[#FFA300]'
                  : 'border-amber-300/80 bg-white text-gray-700 hover:border-[#FFA300]'
              }`}
            >
              Luxury
            </button>
          </div>

          {/* Row 6: Full Width Golden Search Button from screenshot */}
          <button
            type="button"
            onClick={() => handleSearchSubmit()}
            className="w-full rounded-full py-3.5 text-center font-extrabold text-sm text-gray-950 shadow-md transition-all active:scale-95 hover:brightness-105"
            style={{ backgroundColor: '#FFA300' }}
          >
            Search
          </button>
        </div>
      </div>
    </div>
  );
}