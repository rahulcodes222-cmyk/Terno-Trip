'use client';

import React from 'react';
import Link from 'next/link';
import { useFeaturedTrips, useTrendingTrips } from '@/hooks/useTrips';
import PageLayout from '@/components/layout/PageLayout';
import HeroSlider from '@/components/home/HeroSlider';
import StatsBar from '@/components/home/StatsBar';
import DestinationCard from '@/components/home/DestinationCard';
import TripCardUpcoming from '@/components/home/TripCardUpcoming';
import ReviewCard from '@/components/home/ReviewCard';
import BlogCard from '@/components/home/BlogCard';

const WHY_ITEMS = [
  { icon: '🗺️', title: 'Curated Itineraries',   desc: 'Every trip is hand-crafted by our local India travel experts for the best experience.' },
  { icon: '🚌', title: 'All-Inclusive Packages', desc: 'Transport, stays, meals & sightseeing — everything covered in one price.' },
  { icon: '👥', title: 'Small Group Tours',      desc: 'Intimate groups of 8–16 travellers for a personal and memorable experience.' },
  { icon: '📞', title: '24/7 Support',           desc: 'Our dedicated team is always on call throughout your entire journey.' },
];

const REVIEWS = [
  { stars: 5, text: '"The Ladakh trip was a dream. TernoTrip handled everything — permits, stays, transport. I just had to show up and enjoy!"', initials: 'RK', name: 'Rohit Kumar',  meta: 'Travelled to Ladakh' },
  { stars: 5, text: '"Kerala backwaters was beyond expectations. The houseboat stay and the sunset views — absolutely magical experience!"',         initials: 'PS', name: 'Priya Sharma', meta: 'Travelled to Kerala' },
  { stars: 5, text: '"Rajasthan with TernoTrip was like stepping into a history book. The small group made it so personal and truly fun!"',          initials: 'AM', name: 'Arjun Mehta',  meta: 'Travelled to Rajasthan' },
];

const BLOGS = [
  { image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=600&q=80', tag: 'TRAVEL TIPS · 5 MIN READ',       title: 'Best time to visit Manali & Spiti Valley' },
  { image: 'https://images.unsplash.com/photo-1593693411515-c20261bcad6e?w=600&q=80', tag: 'DESTINATION GUIDE · 7 MIN READ', title: 'Kerala in 6 days: the perfect itinerary' },
  { image: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=600&q=80', tag: 'SLOW TRAVEL · 4 MIN READ',       title: 'Why small-group tours are better in Rajasthan' },
];

function SectionHeader({ eyebrow, title, sub, link, linkLabel }: {
  eyebrow: string; title: string; sub?: string; link?: string; linkLabel?: string;
}) {
  return (
    <div className="mb-8 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="mb-1 text-xs font-bold uppercase tracking-widest" style={{ color: '#FF6B00' }}>{eyebrow}</p>
        <h2 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">{title}</h2>
        {sub && <p className="mt-1 text-sm text-gray-500">{sub}</p>}
      </div>
      {link && linkLabel && (
        <Link href={link} className="shrink-0 text-sm font-semibold hover:underline" style={{ color: '#FF6B00' }}>
          {linkLabel}
        </Link>
      )}
    </div>
  );
}

function SkeletonCard() {
  return <div className="h-64 w-full animate-pulse rounded-xl bg-gray-200" />;
}

export default function HomePage() {
  const { data: featuredTrips = [], isLoading: fl } = useFeaturedTrips();
  const { data: trendingTrips = [],  isLoading: tl } = useTrendingTrips();
  const now = new Date();

  const displayUpcoming  = featuredTrips.slice(0, 3);
  const completedTrips   = trendingTrips.filter((t) => t.startDates.length > 0 && new Date(t.startDates[0]) <= now).slice(0, 3);
  const displayCompleted = completedTrips.length ? completedTrips : trendingTrips.slice(0, 3);
  const isLoading = fl || tl;

  /* ── Shared section wrapper — white card on gray page ── */
  const Section = ({ id, children, className = '' }: { id?: string; children: React.ReactNode; className?: string }) => (
    <section id={id} className={`bg-[#F5F7FA] px-4 py-8 sm:px-6 lg:px-8 ${className}`}>
      <div className="mx-auto max-w-container rounded-2xl bg-white px-6 py-8 shadow-card sm:px-8 sm:py-10">
        {children}
      </div>
    </section>
  );

  return (
    <PageLayout>
      {/* 1. Hero */}
      <HeroSlider />

      {/* 2. Stats bar */}
      <div className="py-4">
        <StatsBar />
      </div>

      {/* 3. Popular Destinations */}
      <Section id="destinations">
        <SectionHeader eyebrow="Top picks across India" title="Popular Destinations" sub="From mountains to beaches — India has it all." link="/trips" linkLabel="View all packages ↗" />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <DestinationCard
            image="https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=600&q=80"
            name="Manali" subtitle="Himachal Pradesh" badge="Popular"
          />
          <DestinationCard
            image="https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600&q=80"
            name="Goa" subtitle="Beach Paradise" badge="Trending"
          />
          <DestinationCard
            image="https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=600&q=80"
            name="Agra" subtitle="Land of Royals" badge="Top Rated"
          />
          {/* Kerala — using a working picsum seed as reliable fallback */}
          <DestinationCard
            image="https://images.unsplash.com/photo-1593693411515-c20261bcad6e?w=600&q=80"
            name="Kerala" subtitle="God's Own Country"
          />
        </div>
      </Section>

      {/* 4. Why Choose Us — dark navy card exactly like screenshot */}
      <section className="bg-[#F5F7FA] px-4 pb-4 sm:px-6">
        <div className="mx-auto max-w-container">
          <div
            className="rounded-2xl px-6 py-8 sm:px-10 sm:py-10"
            style={{ background: 'linear-gradient(135deg, #1a2a4a 0%, #1e3a5f 60%, #1a3050 100%)' }}
          >
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {WHY_ITEMS.map((item) => (
                <div key={item.title} className="flex flex-col items-center text-center">
                  {/* Icon box */}
                  <div
                    className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl text-2xl"
                    style={{ backgroundColor: 'rgba(255,255,255,0.12)' }}
                  >
                    {item.icon}
                  </div>
                  <h3 className="mb-1.5 text-sm font-bold" style={{ color: '#FF6B00' }}>
                    {item.title}
                  </h3>
                  <p className="text-xs leading-relaxed text-gray-300">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 5. Upcoming Trips */}
      <Section id="upcoming">
        <SectionHeader eyebrow="Book before seats fill up" title="Upcoming Trips" sub="Fixed departure dates — reserve your spot today." link="/trips" linkLabel="Get early access ↗" />
        {isLoading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">{[1,2,3].map(i=><SkeletonCard key={i}/>)}</div>
        ) : displayUpcoming.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {displayUpcoming.map(t => <TripCardUpcoming key={t._id} trip={t} variant="upcoming" />)}
          </div>
        ) : (
          <p className="py-8 text-center text-sm text-gray-400">No upcoming trips yet — check back soon!</p>
        )}
      </Section>

      {/* 6. Completed Trips */}
      <Section id="completed">
        <SectionHeader eyebrow="Real journeys, real memories" title="Completed Trips" sub="A look back at the beautiful places we've explored together." link="/trips" linkLabel="Read trip stories ↗" />
        {isLoading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">{[1,2,3].map(i=><SkeletonCard key={i}/>)}</div>
        ) : displayCompleted.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {displayCompleted.map(t => <TripCardUpcoming key={t._id} trip={t} variant="completed" />)}
          </div>
        ) : (
          <p className="py-8 text-center text-sm text-gray-400">No completed trips to show yet.</p>
        )}
      </Section>

      {/* 7. Reviews */}
      <Section id="reviews">
        <SectionHeader eyebrow="From our travellers" title="What people are saying" />
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {REVIEWS.map(r => <ReviewCard key={r.name} {...r} />)}
        </div>
      </Section>

      {/* 8. Blog */}
      <Section id="blog">
        <SectionHeader eyebrow="Travel tips & stories" title="The Travel Journal" link="/trips" linkLabel="Read all stories ↗" />
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {BLOGS.map(b => <BlogCard key={b.title} image={b.image} tag={b.tag} title={b.title} href="/trips" />)}
        </div>
      </Section>

    </PageLayout>
  );
}
