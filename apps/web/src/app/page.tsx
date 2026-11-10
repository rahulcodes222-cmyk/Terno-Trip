'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { useFeaturedTrips, useTrendingTrips, useTrips } from '@/hooks/useTrips';
import { useDestinations } from '@/hooks/useDestinations';
import PageLayout from '@/components/layout/PageLayout';
import PirttripHero from '@/components/home/PirttripHero';
import HowItWorks from '@/components/home/HowItWorks';
import TripCard from '@/components/trips/TripCard';
import TripCarousel from '@/components/home/TripCarousel';
import DestinationCard from '@/components/home/DestinationCard';
import BlogCard from '@/components/home/BlogCard';
import ReviewCarousel from '@/components/home/ReviewCarousel';
import StatsBar from '@/components/home/StatsBar';

const SUB_CATEGORIES = [
  { id: 'all', label: 'All Packages ✨' },
  { id: 'weekends', label: 'Weekends' },
  { id: 'backpackers', label: 'Backpackers' },
  { id: 'mountains', label: 'Mountains' },
  { id: 'beaches', label: 'Beaches' },
  { id: 'leisure', label: 'Leisure' },
  { id: 'heritage', label: 'Heritage' },
  { id: 'trekking', label: 'Trekking' },
  { id: 'hiking', label: 'Hiking' },
  { id: 'adventure', label: 'Adventure' },
  { id: 'cultural', label: 'Cultural' },
  { id: 'wildlife', label: 'Wildlife' },
];

const WHY_ITEMS = [
  { icon: '🗺️', title: 'Curated Itineraries',   desc: 'Every trip is hand-crafted by our local India travel experts for the best experience.' },
  { icon: '🚌', title: 'All-Inclusive Packages', desc: 'Transport, stays, meals & sightseeing — everything covered in one price.' },
  { icon: '👥', title: 'Small Group Tours',      desc: 'Intimate groups of 8–16 travellers for a personal and memorable experience.' },
  { icon: '📞', title: '24/7 Support',           desc: 'Our dedicated team is always on call throughout your entire journey.' },
];

const REVIEWS = [
  { stars: 5, text: '"The Ladakh trip was a dream. TernoTrip handled everything — permits, stays, transport. I just had to show up and enjoy!"', initials: 'RK', name: 'Rohit Kumar',   meta: 'Travelled to Ladakh' },
  { stars: 5, text: '"Kerala backwaters was beyond expectations. The houseboat stay and the sunset views — absolutely magical experience!"',        initials: 'PS', name: 'Priya Sharma',  meta: 'Travelled to Kerala' },
  { stars: 5, text: '"Rajasthan with TernoTrip was like stepping into a history book. The small group made it so personal and truly fun!"',         initials: 'AM', name: 'Arjun Mehta',   meta: 'Travelled to Rajasthan' },
  { stars: 5, text: '"Manali trip was breathtaking! Snow-capped peaks, warm stays, amazing food — couldn\'t have asked for a better experience."',  initials: 'VP', name: 'Vikas Patel',   meta: 'Travelled to Manali' },
  { stars: 5, text: '"Goa with TernoTrip was pure fun — beaches, local food, amazing sunsets. The group was super friendly!"',                      initials: 'SR', name: 'Sneha Rao',     meta: 'Travelled to Goa' },
  { stars: 5, text: '"Meghalaya living root bridges — surreal! TernoTrip made every detail perfect. Will definitely book again!"',                  initials: 'KJ', name: 'Kabir Joshi',   meta: 'Travelled to Meghalaya' },
];

const BLOGS = [
  {
    image: 'https://images.unsplash.com/photo-1517824806704-9040b037703b?w=600&q=80',
    tag: 'TRAVEL TIPS · 5 MIN READ',
    title: 'Best time to visit Manali & Spiti Valley',
  },
  {
    image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=600&q=80',
    tag: 'DESTINATION GUIDE · 7 MIN READ',
    title: 'Kerala in 6 days: the perfect itinerary',
  },
  {
    image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=600&q=80',
    tag: 'SLOW TRAVEL · 4 MIN READ',
    title: 'Why small-group tours are better in Rajasthan',
  },
];

export default function HomePage() {
  const { data: featuredTrips = [], isLoading: fl } = useFeaturedTrips();
  const { data: trendingTrips = [],  isLoading: tl } = useTrendingTrips();
  const { data: tripsResponse = { data: [] }, isLoading: al } = useTrips({ limit: 20, page: 1 });
  const allTrips = tripsResponse.data ?? [];
  const destinations = useDestinations();
  const now = new Date();

  // Filters from Pirttrip category bar (India focused)
  const [scope, setScope] = useState<'all' | 'popular' | 'weekend'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchLocation, setSearchLocation] = useState<string>('');

  const displayUpcoming = useMemo(() => {
    return allTrips.filter((t) => t.isActive && t.startDates.some((d) => new Date(d) >= now));
  }, [allTrips]);

  const completedTrips = useMemo(() => {
    const past = trendingTrips.filter((t) => t.startDates.length > 0 && new Date(t.startDates[0]) <= now);
    return past.length ? past : trendingTrips;
  }, [trendingTrips]);

  // Filtered packages based on pirttrip filter bar (India-only)
  const filteredPackages = useMemo(() => {
    let list = displayUpcoming.length > 0 ? displayUpcoming : allTrips;

    // Scope filter (India only)
    if (scope === 'popular') {
      list = list.filter(t => t.isFeatured || (t.ratingsAverage && t.ratingsAverage >= 4.7));
    } else if (scope === 'weekend') {
      list = list.filter(t => (t.duration && t.duration <= 3) || (t.nights && t.nights <= 2));
    }

    // Category filter
    if (selectedCategory !== 'all') {
      list = list.filter(t => {
        const cat = (t.category || '').toLowerCase();
        const title = (t.title || '').toLowerCase();
        const sel = selectedCategory.toLowerCase();
        return cat.includes(sel) || title.includes(sel);
      });
    }

    // Location search
    if (searchLocation.trim()) {
      const q = searchLocation.toLowerCase().trim();
      list = list.filter(t =>
        t.destination?.toLowerCase().includes(q) ||
        t.title?.toLowerCase().includes(q) ||
        t.country?.toLowerCase().includes(q)
      );
    }

    return list;
  }, [displayUpcoming, allTrips, scope, selectedCategory, searchLocation]);

  const isLoading = fl || tl || al;

  return (
    <PageLayout>
      {/* 1. Hero with interactive search */}
      <PirttripHero
        selectedCategory={selectedCategory}
        onSelectCategory={(cat) => setSelectedCategory(cat)}
        onSearch={({ query, category }) => {
          if (query) setSearchLocation(query);
          if (category) setSelectedCategory(category);
        }}
      />

      {/* 2. Pirttrip Explore by Category / Packages Section */}
      <section id="curated-trips" className="bg-[#FAF9F5] px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          {/* Top Bar: Eyebrow + Title + Scope Tabs + Search */}
          <div className="mb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#FF6B00]">
                Find trips that match your travel style.
              </p>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
                Explore by Category
              </h2>
            </div>

            {/* Right Tabs & Search Input */}
            <div className="flex flex-wrap items-center gap-3">
              {/* All / Trending / Weekend Pills (India Trips) */}
              <div className="flex items-center rounded-full bg-white p-1 border border-gray-200 shadow-sm">
                <button
                  type="button"
                  onClick={() => setScope('all')}
                  className={`rounded-full px-5 py-2 text-xs font-bold transition-all ${
                    scope === 'all'
                      ? 'bg-[#FFA300] text-gray-950 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  All Trips
                </button>
                <button
                  type="button"
                  onClick={() => setScope('popular')}
                  className={`rounded-full px-5 py-2 text-xs font-bold transition-all ${
                    scope === 'popular'
                      ? 'bg-[#FFA300] text-gray-950 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Trending
                </button>
                <button
                  type="button"
                  onClick={() => setScope('weekend')}
                  className={`rounded-full px-5 py-2 text-xs font-bold transition-all ${
                    scope === 'weekend'
                      ? 'bg-[#FFA300] text-gray-950 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Weekend
                </button>
              </div>

              {/* Location search pill */}
              <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 shadow-sm focus-within:border-[#FFA300] focus-within:ring-2 focus-within:ring-[#FFA300]/20">
                <input
                  type="text"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  placeholder="Search by location"
                  className="w-36 sm:w-44 bg-transparent text-xs text-gray-800 placeholder-gray-400 focus:outline-none"
                />
                <button
                  type="button"
                  aria-label="Search"
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-900 text-white"
                >
                  <Search className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Subcategory horizontal pills */}
          <div className="mb-8 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none" style={{ scrollbarWidth: 'none' }}>
            {SUB_CATEGORIES.map((cat) => {
              const active = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition-all ${
                    active
                      ? 'bg-[#FFA300] text-gray-950 shadow-sm'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200/80'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Trips Grid in exact pirttrip card format */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-96 w-full animate-pulse rounded-3xl bg-gray-200" />
              ))}
            </div>
          ) : filteredPackages.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPackages.map((trip) => (
                <TripCard key={trip._id} trip={trip} variant="upcoming" />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-12 text-center">
              <p className="text-base font-bold text-gray-700">No trips found matching your filters</p>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('all');
                  setScope('all');
                  setSearchLocation('');
                }}
                className="mt-3 inline-block rounded-full px-5 py-2 text-xs font-bold text-gray-950 shadow-sm"
                style={{ backgroundColor: '#FFA300' }}
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* 3. Completed Trips Carousel with exact pirttrip cards */}
      <section id="completed" className="bg-[#FAF9F5] px-4 py-12 sm:px-6 lg:px-8 border-t border-gray-200/60">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#FF6B00]">
                Real journeys, real memories
              </p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                Completed Trips
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-gray-500">
                A look back at the beautiful places we&apos;ve explored together.
              </p>
            </div>
            <Link
              href="/trips"
              className="text-xs sm:text-sm font-bold text-[#FFA300] hover:underline"
            >
              View all trips ↗
            </Link>
          </div>

          {isLoading ? (
            <div className="flex gap-6 overflow-hidden">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-96 w-[350px] shrink-0 animate-pulse rounded-3xl bg-gray-200" />
              ))}
            </div>
          ) : completedTrips.length > 0 ? (
            <TripCarousel trips={completedTrips} variant="completed" />
          ) : (
            <p className="py-8 text-center text-sm text-gray-400">No completed trips to show yet.</p>
          )}
        </div>
      </section>

      {/* 4. How It Works (Pirttrip 3-step section) */}
      <div id="how-it-works">
        <HowItWorks />
      </div>

      {/* 5. Popular Destinations */}
      <section id="destinations" className="bg-white px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#FF6B00]">
                TOP PICKS ACROSS INDIA
              </p>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mt-1">
                Popular Destinations
              </h2>
            </div>
            <Link href="/trips" className="text-xs sm:text-sm font-bold text-[#FFA300] hover:underline flex items-center gap-1">
              View all packages ↗
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {destinations.slice(0, 8).map((d) => (
              <DestinationCard key={d.id} images={d.images} name={d.name} subtitle={d.subtitle} badge={d.badge} />
            ))}
          </div>
        </div>
      </section>

      {/* 6. Why Choose Us */}
      <section className="bg-[#14181F] px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {WHY_ITEMS.map((item) => (
              <div key={item.title} className="flex flex-col items-center text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl text-2xl bg-white/10">
                  {item.icon}
                </div>
                <h3 className="mb-1 text-sm font-bold text-[#FFA300]">{item.title}</h3>
                <p className="text-xs leading-relaxed text-gray-300">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Reviews */}
      <section id="reviews" className="bg-[#FAF9F5] px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 text-center">
            <p className="text-xs font-bold uppercase tracking-wider text-[#FF6B00]">From our travellers</p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">What people are saying</h2>
          </div>
          <ReviewCarousel reviews={REVIEWS} />
        </div>
      </section>

      {/* 8. Stats Bar */}
      <div className="py-4 bg-[#FAF9F5]">
        <StatsBar />
      </div>

      {/* 9. Blog */}
      <section id="blog" className="bg-white px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#FF6B00]">
                TRAVEL TIPS & STORIES
              </p>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mt-1">
                The Travel Journal
              </h2>
            </div>
            <Link href="/trips" className="text-xs sm:text-sm font-bold text-[#FFA300] hover:underline flex items-center gap-1">
              <span>Read all stories</span>
              <span className="text-sm">↗</span>
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {BLOGS.map((b) => (
              <BlogCard key={b.title} image={b.image} tag={b.tag} title={b.title} href="/trips" />
            ))}
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
