import React from 'react';
import Image from 'next/image';
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
      className="group block overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden sm:h-52">
        <Image
          src={trip.coverImage}
          alt={trip.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <div className="absolute left-3 top-3">
          <span className="rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-gray-700 backdrop-blur-sm">
            {getCategoryIcon(trip.category)} {trip.category}
          </span>
        </div>
        {trip.isFeatured && (
          <div className="absolute right-3 top-3">
            <span className="rounded-full bg-primary px-2.5 py-1 text-xs font-bold text-white">
              ⭐ Popular
            </span>
          </div>
        )}
        {trip.availableSeats <= 5 && trip.availableSeats > 0 && (
          <div className="absolute left-3 bottom-3">
            <span className="rounded-full bg-primary px-2.5 py-1 text-xs font-medium text-white">
              {trip.availableSeats} seats left
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="mb-1 line-clamp-1 font-semibold text-gray-900 group-hover:text-primary">
          {trip.title}
        </h3>

        <div className="mb-3 flex items-center gap-1 text-sm text-gray-500">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span className="line-clamp-1">
            {trip.destination}, {trip.country}
          </span>
        </div>

        <div className="mb-3 flex items-center gap-3 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {trip.duration}D / {trip.nights}N
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span className="font-medium text-gray-700">{trip.ratingsAverage.toFixed(1)}</span>
            <span className="text-gray-400">({trip.ratingsQuantity})</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            {trip.discountPrice ? (
              <>
                <span className="text-xs text-gray-400 line-through">
                  {formatCurrency(trip.pricePerPerson)}
                </span>
                <div className="text-lg font-bold text-primary">
                  {formatCurrency(trip.discountPrice)}
                </div>
              </>
            ) : (
              <div className="text-lg font-bold text-primary">
                {formatCurrency(trip.pricePerPerson)}
              </div>
            )}
            <span className="text-xs text-gray-400">per person</span>
          </div>
          <span className="rounded-lg bg-primary-50 px-3 py-1.5 text-xs font-medium text-primary group-hover:bg-primary group-hover:text-white transition-colors">
            View Trip →
          </span>
        </div>
      </div>
    </Link>
  );
}
