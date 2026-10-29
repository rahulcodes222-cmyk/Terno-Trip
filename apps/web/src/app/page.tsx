'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTrips } from '@/hooks/useTrips';
import PageLayout from '@/components/layout/PageLayout';
import HeroSlider from '@/components/home/HeroSlider';
import StatsBar from '@/components/home/StatsBar';
import DestinationCard from '@/components/home/DestinationCard';
import TripCardUpcoming from '@/components/home/TripCardUpcoming';
import ReviewCard from '@/components/home/ReviewCard';
import BlogCard from '@/components/home/BlogCard';

const WHY_ITEMS = [
  {
    icon: '🗺️',
    title: 'Curated Itineraries',
    desc: 'Every trip is hand-crafted by our local India travel experts for the best experience.',
  },
  {
    icon: '🚌',
    title: 'All-Inclusive Packages',
    desc: 'Transport, stays, meals & sightseeing — everything covered in one price.',
  },
  {
    icon: '👥',
    title: 'Small Group Tours',
    desc: 'Intimate groups of 8–16 travellers for a personal and memorable experience.',
  },
  {
    icon: '📞',
    title: '24/7 Support',
    desc: 'Our dedicated team is always on call throughout your entire journey.',
  },
];

export default function HomePage() {
  const { data: tripsData, isLoading } = useTrips({ limit: 20 });
  const allTrips = tripsData?.data ?? [];
  const now = new Date();

  const upcomingTrips = allTrips
    .filter((t) => t.startDates.some((d) => new Date(d) > now))
    .slice(0, 3);

  const completedTrips = allTrips
    .filter(
      (t) =>
        t.startDates.length > 0 && t.startDates.every((d) => new Date(d) <= now)
    )
    .slice(0, 3);

  return (
    <PageLayout>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <HeroSlider />

      {/* ── Stats ────────────────────────────────────────────────────────── */}
      <StatsBar />

      {/* ── Popular Destinations ─────────────────────────────────────────── */}
      <section id="destinations" className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-primary">
                Top picks across India
              </p>
              <h2 className="text-3xl font-extrabold text-gray-900">Popular Destinations</h2>
              <p className="mt-1 text-gray-500">From mountains to beaches — India has it all.</p>
            </div>
            <Link
              href="/trips"
              className="whitespace-nowrap text-sm font-semibold text-primary hover:underline"
            >
              View all packages ↗
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <DestinationCard
              image="https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=600"
              name="Manali"
              subtitle="Himachal Pradesh"
              badge="Popular"
            />
            <DestinationCard
              image="https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600"
              name="Goa"
              subtitle="Beach Paradise"
              badge="Trending"
            />
            <DestinationCard
              image="https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=600"
              name="Agra"
              subtitle="Land of Royals"
              badge="Top Rated"
            />
            <DestinationCard
              image="https://images.unsplash.com/photo-1609766418204-94aae0ecbff4?w=600"
              name="Kerala"
              subtitle="God's Own Country"
            />
          </div>
        </div>
      </section>

      {/* ── Why Choose Us ────────────────────────────────────────────────── */}
      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-primary">
              Why travel with us
            </p>
            <h2 className="text-3xl font-extrabold text-gray-900">Why Choose TernoTrip?</h2>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {WHY_ITEMS.map((item) => (
              <div
                key={item.title}
                className="flex flex-col items-center rounded-2xl bg-white p-6 text-center shadow-sm"
              >
                <span className="mb-4 text-4xl">{item.icon}</span>
                <h3 className="mb-2 font-semibold text-gray-900">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Upcoming Trips ───────────────────────────────────────────────── */}
      <section id="upcoming" className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-primary">
                Book before seats fill up
              </p>
              <h2 className="text-3xl font-extrabold text-gray-900">Upcoming Trips</h2>
              <p className="mt-1 text-gray-500">Fixed departure dates — reserve your spot today.</p>
            </div>
            <Link
              href="/trips"
              className="whitespace-nowrap text-sm font-semibold text-primary hover:underline"
            >
              Get early access ↗
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 animate-pulse rounded-2xl bg-gray-100" />
              ))}
            </div>
          ) : upcomingTrips.length > 0 ? (
            <div className="space-y-4">
              {upcomingTrips.map((trip) => (
                <TripCardUpcoming key={trip._id} trip={trip} variant="upcoming" />
              ))}
            </div>
          ) : (
            <p className="py-10 text-center text-gray-500">
              No upcoming trips scheduled yet. Check back soon!
            </p>
          )}
        </div>
      </section>

      {/* ── Completed Trips ──────────────────────────────────────────────── */}
      <section id="completed" className="bg-[#F9FAFB] py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-primary">
                Real journeys, real memories
              </p>
              <h2 className="text-3xl font-extrabold text-gray-900">Completed Trips</h2>
              <p className="mt-1 text-gray-500">
                A look back at the beautiful places we&#39;ve explored together.
              </p>
            </div>
            <Link
              href="/trips"
              className="whitespace-nowrap text-sm font-semibold text-primary hover:underline"
            >
              Read trip stories ↗
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 animate-pulse rounded-2xl bg-gray-100" />
              ))}
            </div>
          ) : completedTrips.length > 0 ? (
            <div className="space-y-4">
              {completedTrips.map((trip) => (
                <TripCardUpcoming key={trip._id} trip={trip} variant="completed" />
              ))}
            </div>
          ) : (
            <p className="py-10 text-center text-gray-500">No completed trips to show yet.</p>
          )}
        </div>
      </section>

      {/* ── Reviews ──────────────────────────────────────────────────────── */}
      <section id="reviews" className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-primary">
              From our travellers
            </p>
            <h2 className="text-3xl font-extrabold text-gray-900">What people are saying</h2>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <ReviewCard
              stars={5}
              text='"The Ladakh trip was a dream. TernoTrip handled everything — permits, stays, transport. I just had to show up and enjoy!"'
              initials="RK"
              name="Rohit Kumar"
              meta="Travelled to Ladakh"
            />
            <ReviewCard
              stars={5}
              text='"Kerala backwaters was beyond expectations. The houseboat stay and the sunset views — absolutely magical experience!"'
              initials="PS"
              name="Priya Sharma"
              meta="Travelled to Kerala"
            />
            <ReviewCard
              stars={5}
              text='"Rajasthan with TernoTrip was like stepping into a history book. The small group made it so personal and truly fun!"'
              initials="AM"
              name="Arjun Mehta"
              meta="Travelled to Rajasthan"
            />
          </div>
        </div>
      </section>

      {/* ── Blog ─────────────────────────────────────────────────────────── */}
      <section id="blog" className="bg-[#F9FAFB] py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-primary">
                Travel tips &amp; stories
              </p>
              <h2 className="text-3xl font-extrabold text-gray-900">The Travel Journal</h2>
            </div>
            <a
              href="#"
              className="whitespace-nowrap text-sm font-semibold text-primary hover:underline"
            >
              Read all stories ↗
            </a>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <BlogCard
              image="https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=600"
              tag="TRAVEL TIPS · 5 MIN READ"
              title="Best time to visit Manali & Spiti Valley"
              href="#"
            />
            <BlogCard
              image="https://images.unsplash.com/photo-1609766418204-94aae0ecbff4?w=600"
              tag="DESTINATION GUIDE · 7 MIN READ"
              title="Kerala in 6 days: the perfect itinerary"
              href="#"
            />
            <BlogCard
              image="https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=600"
              tag="SLOW TRAVEL · 4 MIN READ"
              title="Why small-group tours are better in Rajasthan"
              href="#"
            />
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
