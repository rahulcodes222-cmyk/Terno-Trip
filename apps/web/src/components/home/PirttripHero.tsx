'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Search, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export interface CategoryItem {
  id: string;
  name: string;
  image: string;
  backImage: string;
  ribbonColor: string;
}

export const CATEGORIES: CategoryItem[] = [
  {
    id: 'backpackers',
    name: 'BACKPACKERS',
    image: 'https://images.unsplash.com/photo-1527631746610-bca00a040d60?w=400&q=80',
    backImage: 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=400&q=80',
    ribbonColor: 'bg-gradient-to-r from-amber-700 to-amber-900 border-amber-600',
  },
  {
    id: 'beaches',
    name: 'BEACHES',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=80',
    backImage: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=400&q=80',
    ribbonColor: 'bg-gradient-to-r from-teal-600 to-cyan-800 border-teal-500',
  },
  {
    id: 'heritage',
    name: 'HERITAGE',
    image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=400&q=80',
    backImage: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=400&q=80',
    ribbonColor: 'bg-gradient-to-r from-indigo-700 to-purple-900 border-indigo-600',
  },
  {
    id: 'hiking',
    name: 'HIKING',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&q=80',
    backImage: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=400&q=80',
    ribbonColor: 'bg-gradient-to-r from-blue-600 to-sky-800 border-blue-500',
  },
  {
    id: 'adventure',
    name: 'ADVENTURE',
    image: 'https://images.unsplash.com/photo-1533240332313-0db49b459ad6?w=400&q=80',
    backImage: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=400&q=80',
    ribbonColor: 'bg-gradient-to-r from-emerald-600 to-green-800 border-emerald-500',
  },
  {
    id: 'wildlife',
    name: 'WILDLIFE',
    image: 'https://images.unsplash.com/photo-1534188753412-3e26d0d618d6?w=400&q=80',
    backImage: 'https://images.unsplash.com/photo-1561731216-c3a4d99437d5?w=400&q=80',
    ribbonColor: 'bg-gradient-to-r from-lime-700 to-green-900 border-lime-600',
  },
  {
    id: 'spiritual',
    name: 'SPIRITUAL',
    image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&q=80',
    backImage: 'https://images.unsplash.com/photo-1588096344356-9b5a03e6807e?w=400&q=80',
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

  // 3D Flip state for each category circle
  const [flippedMap, setFlippedMap] = useState<Record<string, boolean>>({});

  // Auto flip categories sequentially at intervals
  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      const currentCat = CATEGORIES[index % CATEGORIES.length];
      setFlippedMap((prev) => ({
        ...prev,
        [currentCat.id]: !prev[currentCat.id],
      }));
      index++;
    }, 2400);

    return () => clearInterval(interval);
  }, []);

  const toggleFlip = (id: string, force?: boolean) => {
    setFlippedMap((prev) => ({
      ...prev,
      [id]: force !== undefined ? force : !prev[id],
    }));
  };

  const scrollBadges = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const offset = direction === 'left' ? -220 : 220;
      carouselRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  const handleCategoryClick = (catId: string) => {
    // Also toggle flip on click
    toggleFlip(catId);
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
        <div className="absolute inset-0 bg-gradient-to-b from-[#14181F]/70 via-[#14181F]/45 to-[#14181F]/95" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 pt-12 pb-20 sm:px-6 lg:px-8">
        {/* ── Top Hero Headline ──────────────────────────────── */}
        <div className="text-center mb-8 sm:mb-10">
          <h1 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl md:text-5xl drop-shadow-md">
            Connecting <span className="text-[#FFA300]">Travelers</span> to Trip <span className="text-[#FFA300]">Curators</span>
          </h1>
          <p className="mt-3 text-xs sm:text-sm font-semibold tracking-widest text-gray-200 uppercase opacity-95">
            Discover &nbsp;|&nbsp; Compare &nbsp;|&nbsp; Decide &nbsp;|&nbsp; Travel
          </p>
        </div>

        {/* ── Floating Category Badges Row (3D Flip Animated) ─ */}
        {/* Perched right at the top perimeter of the white search card */}
        <div className="relative -mb-9 sm:-mb-11 z-20 max-w-5xl mx-auto px-2">
          {/* Scroll arrow Left */}
          <button
            type="button"
            onClick={() => scrollBadges('left')}
            className="absolute -left-2 sm:-left-4 top-1/2 -translate-y-1/2 z-30 flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-white shadow-xl text-gray-800 hover:bg-[#FFA300] hover:text-white transition-colors border border-gray-200"
            aria-label="Previous categories"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          {/* Carousel Track */}
          <div
            ref={carouselRef}
            className="flex items-end justify-start md:justify-center gap-3 sm:gap-4 overflow-x-auto scrollbar-none py-2 px-6 scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory.toLowerCase() === cat.id.toLowerCase();
              const isFlipped = !!flippedMap[cat.id];

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategoryClick(cat.id)}
                  onMouseEnter={() => toggleFlip(cat.id, true)}
                  onMouseLeave={() => toggleFlip(cat.id, false)}
                  className={`group relative flex flex-col items-center shrink-0 transition-transform duration-300 hover:-translate-y-1.5 focus:outline-none ${
                    isSelected ? 'scale-105' : 'opacity-95 hover:opacity-100'
                  }`}
                >
                  {/* Circular Image Container with 3D Flip */}
                  <div className="relative h-20 w-20 sm:h-24 sm:w-24 [perspective:1000px]">
                    <div
                      className={`relative h-full w-full rounded-full transition-transform duration-700 [transform-style:preserve-3d] shadow-lg border-[3.5px] ${
                        isSelected
                          ? 'border-[#FFA300] ring-4 ring-[#FFA300]/40'
                          : 'border-white group-hover:border-[#FFA300]'
                      } ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}
                    >
                      {/* Front Face */}
                      <div className="absolute inset-0 h-full w-full rounded-full overflow-hidden [backface-visibility:hidden]">
                        <img
                          src={cat.image}
                          alt={cat.name}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                      </div>

                      {/* Back Face (Flip Side) */}
                      <div className="absolute inset-0 h-full w-full rounded-full overflow-hidden [backface-visibility:hidden] [transform:rotateY(180deg)]">
                        <img
                          src={cat.backImage}
                          alt={`${cat.name} alternate`}
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/15 group-hover:bg-transparent transition-colors" />
                      </div>
                    </div>
                  </div>

                  {/* Ribbon Banner at bottom of circle */}
                  <div
                    className={`-mt-3.5 z-20 px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider text-white border uppercase shadow-md select-none transition-transform group-hover:scale-105 ${
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
            className="absolute -right-2 sm:-right-4 top-1/2 -translate-y-1/2 z-30 flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-white shadow-xl text-gray-800 hover:bg-[#FFA300] hover:text-white transition-colors border border-gray-200"
            aria-label="Next categories"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* ── White Search Card (Exact Match to Screenshot 2) ─── */}
        <div className="relative rounded-3xl bg-white p-5 sm:p-7 pt-12 sm:pt-14 shadow-2xl border border-gray-100 max-w-5xl mx-auto z-10">
          {/* Row 1: Radios (Any, Domestic) + Pet Friendly Checkbox + All / Women Pill Group */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-3">
            {/* Left: Radios + Pet Friendly */}
            <div className="flex items-center gap-5 sm:gap-6 text-xs font-semibold text-gray-700">
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

            {/* Right: All / Women/Girls Only Pill Group */}
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
          </div>

          {/* Row 2: Search Input Box + No. of Travellers Box (Seamless Compartment) */}
          <div className="mb-4 rounded-2xl border border-gray-200/90 bg-white p-1 flex flex-col md:flex-row items-stretch shadow-sm divide-y md:divide-y-0 md:divide-x divide-gray-200">
            {/* Left Compartment: Don't Think Much, Just Go! */}
            <div className="flex-1 flex items-center gap-3.5 px-4 py-3 focus-within:ring-2 focus-within:ring-[#FFA300]/20 rounded-xl transition-all">
              <Search className="h-6 w-6 text-[#FFA300] shrink-0" />
              <div className="flex-1 min-w-0 text-left">
                <p className="text-xs font-bold text-gray-900 leading-tight">
                  Don&apos;t Think Much, Just Go!
                </p>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
                  placeholder="Where do you want to go?"
                  className="w-full bg-transparent text-sm text-gray-800 placeholder-gray-400 focus:outline-none mt-0.5"
                />
              </div>
            </div>

            {/* Right Compartment: No. of Travellers */}
            <div
              className="relative md:w-64 flex items-center gap-3.5 px-4 py-3 cursor-pointer select-none hover:bg-gray-50/70 rounded-xl transition-all"
              onClick={() => setShowTravellerDropdown(!showTravellerDropdown)}
            >
              <Users className="h-6 w-6 text-[#FFA300] shrink-0" />
              <div className="flex-1 min-w-0 text-left">
                <p className="text-xs font-bold text-gray-900 leading-tight">No. of Travellers</p>
                <p className="text-sm text-gray-400 mt-0.5">
                  {travellers > 1 ? `${travellers} Travellers` : 'Add No.'}
                </p>
              </div>

              {/* Travellers dropdown popup */}
              {showTravellerDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowTravellerDropdown(false);
                    }}
                  />
                  <div className="absolute left-0 right-0 top-full z-50 mt-2 rounded-xl border border-gray-100 bg-white p-3 shadow-2xl">
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
          </div>

          {/* Row 3: 3 Trip Type Cards (Standard, Exclusive, Luxury as in Screenshot 2) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Standard Group Trips */}
            <button
              type="button"
              onClick={() => {
                setSelectedTripType('standard');
                handleSearchSubmit();
              }}
              className={`rounded-2xl border p-3.5 text-left transition-all ${
                selectedTripType === 'standard'
                  ? 'border-[#FFA300] bg-amber-50/40 shadow-sm ring-1 ring-[#FFA300]'
                  : 'border-amber-300/80 bg-white hover:border-[#FFA300]'
              }`}
            >
              <p className="text-xs sm:text-sm font-bold text-gray-900 leading-tight">Standard Group Trips</p>
              <p className="text-[11px] text-gray-500 mt-1 leading-snug">
                For budget-friendly &amp; fixed itineraries
              </p>
            </button>

            {/* Exclusive Group Trips */}
            <button
              type="button"
              onClick={() => {
                setSelectedTripType('exclusive');
                handleSearchSubmit();
              }}
              className={`rounded-2xl border p-3.5 text-left transition-all ${
                selectedTripType === 'exclusive'
                  ? 'border-[#FFA300] bg-amber-50/40 shadow-sm ring-1 ring-[#FFA300]'
                  : 'border-amber-300/80 bg-white hover:border-[#FFA300]'
              }`}
            >
              <p className="text-xs sm:text-sm font-bold text-gray-900 leading-tight">Exclusive Group Trips</p>
              <p className="text-[11px] text-gray-500 mt-1 leading-snug">
                Limited seat curated seats designed for selective.
              </p>
            </button>

            {/* Luxury Group Trips */}
            <button
              type="button"
              onClick={() => {
                setSelectedTripType('luxury');
                handleSearchSubmit();
              }}
              className={`rounded-2xl border p-3.5 text-left transition-all ${
                selectedTripType === 'luxury'
                  ? 'border-[#FFA300] bg-amber-50/40 shadow-sm ring-1 ring-[#FFA300]'
                  : 'border-amber-300/80 bg-white hover:border-[#FFA300]'
              }`}
            >
              <p className="text-xs sm:text-sm font-bold text-gray-900 leading-tight">Luxury Group Trips</p>
              <p className="text-[11px] text-gray-500 mt-1 leading-snug">
                Premium High comfort experience.
              </p>
            </button>
          </div>

          {/* Mobile-only Search Button */}
          <div className="mt-3 block md:hidden">
            <button
              type="button"
              onClick={() => handleSearchSubmit()}
              className="w-full rounded-full py-3 text-center font-extrabold text-sm text-gray-950 shadow-md transition-all active:scale-95 hover:brightness-105"
              style={{ backgroundColor: '#FFA300' }}
            >
              Search
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
