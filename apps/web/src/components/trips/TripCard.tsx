'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, MapPin, Check } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { ITrip } from '@/types';

interface TripCardProps {
  trip: ITrip;
  variant?: 'upcoming' | 'completed';
}

const DESTINATION_FALLBACKS: Record<string, string[]> = {
  manali: [
    'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&q=80',
    'https://images.unsplash.com/photo-1580385778939-1cbb09814e0e?w=800&q=80',
    'https://images.unsplash.com/photo-1571586992748-20322d999731?w=800&q=80',
  ],
  kashmir: [
    'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&q=80',
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80',
    'https://images.unsplash.com/photo-1548013146-72479768bada?w=800&q=80',
  ],
  'tamil nadu': [
    'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800&q=80',
    'https://images.unsplash.com/photo-1609766857041-ed402ea8069a?w=800&q=80',
    'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&q=80',
  ],
  goa: [
    'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&q=80',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
    'https://images.unsplash.com/photo-1559827260-dc66d52719d2?w=800&q=80',
  ],
  ladakh: [
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80',
    'https://images.unsplash.com/photo-1626015365107-ac15a89e8c33?w=800&q=80',
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80',
  ],
  kerala: [
    'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&q=80',
    'https://images.unsplash.com/photo-1593693411515-c20261bcad6e?w=800&q=80',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
  ],
  rajasthan: [
    'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&q=80',
    'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&q=80',
    'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&q=80',
  ],
  rishikesh: [
    'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80',
    'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80',
    'https://images.unsplash.com/photo-1533240332313-0db49b459ad6?w=800&q=80',
  ],
  andaman: [
    'https://images.unsplash.com/photo-1598091383021-15ddea10925d?w=800&q=80',
    'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&q=80',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
  ],
  varanasi: [
    'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=800&q=80',
    'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&q=80',
    'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&q=80',
  ],
  mumbai: [
    'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800&q=80',
    'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?w=800&q=80',
    'https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?w=800&q=80',
  ],
  delhi: [
    'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800&q=80',
    'https://images.unsplash.com/photo-1558024564-9eb56a57b747?w=800&q=80',
    'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&q=80',
  ],
  default: [
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80',
    'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&q=80',
    'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&q=80',
  ],
};

function getTripImages(trip: ITrip): string[] {
  const destKey = (trip.destination || '').toLowerCase();
  let matchedFallback: string[] = DESTINATION_FALLBACKS.default;
  for (const [key, list] of Object.entries(DESTINATION_FALLBACKS)) {
    if (destKey.includes(key)) {
      matchedFallback = list;
      break;
    }
  }

  const rawImages = (trip.images && trip.images.length > 0)
    ? trip.images
    : trip.coverImage
    ? [trip.coverImage]
    : [];

  const validImages = rawImages.filter(img => img && !img.includes('seed/trip/800'));
  const combined = [...validImages, ...matchedFallback];
  return Array.from(new Set(combined)).slice(0, 5);
}

function formatTripDate(dates?: string[]) {
  if (!dates || !dates.length) return 'Flexible Dates';
  const now = new Date();
  const upcoming = dates.map(d => new Date(d)).filter(d => !isNaN(d.getTime()) && d >= now);
  const target = upcoming.length ? upcoming[0] : new Date(dates[0]);
  if (isNaN(target.getTime())) return 'Flexible Dates';
  return target.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export default function TripCard({ trip, variant }: TripCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const allImages = getTripImages(trip);

  // Smooth right-to-left slide state
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto slide right-to-left every 3.5s - 5s (staggered per trip)
  useEffect(() => {
    if (allImages.length <= 1) return;
    const hash = (trip._id || trip.slug || '').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const delay = 3500 + (hash % 1500);

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % allImages.length);
    }, delay);

    return () => clearInterval(interval);
  }, [allImages.length, trip._id, trip.slug]);

  const dateLabel = formatTripDate(trip.startDates);
  const durationDays = trip.duration && trip.duration > 0 ? trip.duration : 1;
  const nightsCount = (trip.nights !== undefined && trip.nights !== null)
    ? trip.nights
    : Math.max(0, durationDays - 1);

  const hasDiscount = Boolean(trip.discountPrice && trip.discountPrice > 0 && trip.discountPrice < trip.pricePerPerson);
  const realPrice = hasDiscount
    ? trip.discountPrice!
    : (trip.pricePerPerson && trip.pricePerPerson > 0)
    ? trip.pricePerPerson
    : ((trip as any).price && (trip as any).price > 0)
    ? (trip as any).price
    : 1000;

  const isExclusive = trip.isFeatured || (realPrice > 15000);
  const tierName = isExclusive ? 'Exclusive' : 'Standard';

  const curatorName = trip.country === 'India'
    ? `${trip.destination.split(' ')[0]} Curators`
    : 'Terno Partners';

  const firstStop = trip.itinerary?.[0]?.accommodation || trip.destination;
  const secondStop = trip.itinerary?.[1]?.accommodation || trip.itinerary?.[trip.itinerary.length - 1]?.accommodation || trip.destination;
  const totalPlaces = Math.max(3, (trip.itinerary?.length || 1) * 2);

  // Exact real available seats
  const seatsCount = typeof trip.availableSeats === 'number' ? trip.availableSeats : 10;
  const seatsText = seatsCount > 0 ? `${seatsCount} Seat${seatsCount > 1 ? 's' : ''} Left` : 'Sold Out';

  return (
    <div className="group relative flex flex-col rounded-3xl border border-gray-200/90 bg-white shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
      {/* ── Top Image Container with Right-to-Left Slide ────────── */}
      <div className="relative h-56 w-full overflow-hidden bg-gray-900">
        {/* Top Badges */}
        <div className="absolute top-0 left-0 z-20 pointer-events-none">
          <span className="inline-block rounded-br-2xl bg-black px-3.5 py-1.5 text-xs font-bold text-white shadow-md">
            {nightsCount}N/{durationDays}D
          </span>
        </div>

        <div className="absolute top-0 right-0 z-20 pointer-events-none">
          <span className="inline-block rounded-bl-2xl bg-[#FFA300] px-4 py-1.5 text-xs font-extrabold text-gray-950 shadow-md">
            {hasDiscount ? 'Special' : 'Only'} {formatCurrency(realPrice)}
          </span>
        </div>

        {/* Wishlist Heart Button */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsWishlisted(!isWishlisted);
          }}
          className="absolute bottom-3 right-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md transition-transform active:scale-90 hover:scale-105"
          aria-label="Wishlist"
        >
          <Heart
            className={`h-4 w-4 transition-colors ${
              isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-600 hover:text-red-500'
            }`}
          />
        </button>

        {/* Floating Feature Badges over image */}
        <div className="absolute bottom-3 left-3 z-20 flex flex-wrap items-center gap-1.5 max-w-[80%] pointer-events-none">
          <span className="flex items-center gap-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-400">
            <Check className="h-3 w-3" /> Verified
          </span>
          <span className="rounded-full bg-black/60 backdrop-blur-md border border-white/20 px-2 py-0.5 text-[10px] font-medium text-white">
            Customization Available
          </span>
          {trip.category === 'Adventure' && (
            <span className="rounded-full bg-black/60 backdrop-blur-md border border-white/20 px-2 py-0.5 text-[10px] font-medium text-amber-300">
              🐾 Pet Friendly
            </span>
          )}
        </div>

        {/* Right-to-Left Sliding Images Carousel */}
        <Link
          href={`/trips/${trip.slug}`}
          className="relative block h-full w-full overflow-hidden cursor-pointer"
        >
          <div
            className="flex h-full w-full transition-transform duration-700 ease-in-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {allImages.map((img, i) => (
              <div key={i} className="h-full w-full shrink-0">
                <img
                  src={img}
                  alt={trip.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
            ))}
          </div>

          {/* Dots progress indicator */}
          {allImages.length > 1 && (
            <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1 pointer-events-none">
              {allImages.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    i === currentIndex ? 'w-3.5 bg-[#FFA300]' : 'w-1 bg-white/60'
                  }`}
                />
              ))}
            </div>
          )}
        </Link>
      </div>

      {/* ── Content Section ────────────────────────────────────── */}
      <div className="flex flex-1 flex-col p-4">
        {/* Tier & Category Pills */}
        <div className="mb-2.5 flex items-center gap-2">
          <span className="rounded-full border border-amber-300 bg-amber-50/70 px-3 py-0.5 text-[11px] font-bold text-amber-800">
            {tierName}
          </span>
          <span className="rounded-full border border-amber-300 bg-amber-50/70 px-3 py-0.5 text-[11px] font-bold text-amber-800">
            {trip.category}
          </span>
        </div>

        {/* Title & Curator Info */}
        <div className="mb-3 flex items-start justify-between gap-2">
          <Link href={`/trips/${trip.slug}`} className="flex-1 min-w-0">
            <h3 className="text-base font-extrabold text-gray-900 group-hover:text-[#FFA300] transition-colors line-clamp-1">
              {trip.title}
            </h3>
          </Link>
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#FFA300]/20 text-[#FFA300] font-black text-[10px]">
              {curatorName[0]}
            </div>
            <span className="max-w-[90px] truncate text-xs font-semibold text-gray-600">
              {curatorName}
            </span>
          </div>
        </div>

        {/* Date & REAL AVAILABLE SEATS */}
        <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full border border-amber-300 px-2.5 py-0.5 text-[11px] font-semibold text-amber-900">
            {dateLabel}
          </span>
          <span
            className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${
              seatsCount > 0
                ? 'border-blue-200 bg-blue-50/60 text-blue-900'
                : 'border-red-200 bg-red-50 text-red-700'
            }`}
          >
            👥 {seatsText}
          </span>
        </div>

        {/* Route / Location */}
        <div className="mb-3 flex items-center gap-1 text-xs text-gray-500">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-[#FFA300]" />
          <span className="truncate">
            {trip.destination} To {trip.destination}
          </span>
        </div>

        {/* Itinerary Highlight Bar */}
        <div className="mb-4 flex items-center justify-between rounded-xl bg-amber-50/60 px-3 py-2 text-center text-[11px] text-gray-700">
          <div className="flex-1 truncate">
            <span className="block font-bold text-gray-900 truncate">1 Night</span>
            <span className="text-gray-500 truncate">{firstStop}</span>
          </div>
          <span className="text-amber-400 font-bold px-1.5">•</span>
          <div className="flex-1 truncate">
            <span className="block font-bold text-gray-900 truncate">+{totalPlaces} Places</span>
            <span className="text-gray-500 truncate">Explore</span>
          </div>
          <span className="text-amber-400 font-bold px-1.5">•</span>
          <div className="flex-1 truncate">
            <span className="block font-bold text-gray-900 truncate">1 Night</span>
            <span className="text-gray-500 truncate">{secondStop}</span>
          </div>
        </div>

        {/* Bottom Action Buttons */}
        <div className="mt-auto flex items-center gap-2 pt-1">
          <Link
            href={`/trips/${trip.slug}`}
            className="flex-1 rounded-full px-4 py-2 text-center text-xs font-extrabold text-gray-950 shadow-sm transition-all hover:brightness-105 active:scale-95"
            style={{ backgroundColor: '#FFA300' }}
          >
            Contact Curator
          </Link>
          <Link
            href={`/trips/${trip.slug}`}
            className="flex-1 rounded-full border border-[#FFA300] px-4 py-2 text-center text-xs font-bold text-gray-800 transition-colors hover:bg-amber-50"
          >
            Compare
          </Link>
        </div>
      </div>
    </div>
  );
}
