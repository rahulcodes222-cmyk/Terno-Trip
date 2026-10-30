import React from 'react';
import Link from 'next/link';
import { Star, Clock, MapPin } from 'lucide-react';
import { formatCurrency, getCategoryIcon } from '@/lib/utils';
import type { ITrip } from '@/types';

interface TripCardProps {
  trip: ITrip;
}

export default function TripCard({ trip }: TripCardProps) {
  return (
    <Link
      href={`/trips/${trip.slug}`}
      className="group block overflow-hidden rounded-xl border border-gray-200 bg-white shadow-card transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5"
    >
      {/* Image */}
      <div className="relative h-44 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={trip.coverImage}
          alt={trip.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute left-2.5 top-2.5">
          <span className="rounded-full bg-white/90 px-2.5 py-0.5 text-[11px] font-semibold text-gray-700 shadow-sm">
            {getCategoryIcon(trip.category)} {trip.category}
          </span>
        </div>
        {trip.isFeatured && (
          <div className="absolute right-2.5 top-2.5">
            <span className="rounded-full bg-[#FF6B00] px-2.5 py-0.5 text-[11px] font-bold text-white">
              ⭐ Popular
            </span>
          </div>
        )}
        {trip.availableSeats <= 5 && trip.availableSeats > 0 && (
          <div className="absolute bottom-2.5 left-2.5">
            <span className="rounded-full bg-[#FF6B00] px-2.5 py-0.5 text-[11px] font-medium text-white">
              {trip.availableSeats} seats left
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="mb-1 line-clamp-1 text-sm font-bold text-gray-900 group-hover:text-[#FF6B00] transition-colors">
          {trip.title}
        </h3>

        <div className="mb-2.5 flex items-center gap-1 text-xs text-gray-500">
          <MapPin className="h-3 w-3 shrink-0" />
          <span className="line-clamp-1">{trip.destination}, {trip.country}</span>
        </div>

        <div className="mb-3 flex items-center gap-3 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {trip.duration}D / {trip.nights}N
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            <span className="font-medium text-gray-700">{trip.ratingsAverage.toFixed(1)}</span>
            <span className="text-gray-400">({trip.ratingsQuantity})</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            {trip.discountPrice ? (
              <>
                <span className="text-xs text-gray-400 line-through">{formatCurrency(trip.pricePerPerson)}</span>
                <div className="text-base font-extrabold text-[#FF6B00]">{formatCurrency(trip.discountPrice)}</div>
              </>
            ) : (
              <div className="text-base font-extrabold text-[#FF6B00]">{formatCurrency(trip.pricePerPerson)}</div>
            )}
            <span className="text-[11px] text-gray-400">per person</span>
          </div>
          <span className="rounded-lg bg-[#FF6B00] px-3 py-1.5 text-xs font-bold text-white transition-colors group-hover:bg-[#E65100]">
            View Trip →
          </span>
        </div>
      </div>
    </Link>
  );
}
