import React from 'react';
import TripCard from './TripCard';
import EmptyState from '@/components/ui/EmptyState';
import type { ITrip } from '@/types';

interface TripGridProps {
  trips: ITrip[];
  isLoading?: boolean;
  onClearFilters?: () => void;
}

function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm animate-pulse">
      <div className="h-48 bg-gray-200 sm:h-52" />
      <div className="p-4 space-y-3">
        <div className="h-4 w-3/4 rounded bg-gray-200" />
        <div className="h-3 w-1/2 rounded bg-gray-200" />
        <div className="h-3 w-2/3 rounded bg-gray-200" />
        <div className="flex justify-between">
          <div className="h-5 w-24 rounded bg-gray-200" />
          <div className="h-7 w-20 rounded bg-gray-200" />
        </div>
      </div>
    </div>
  );
}

export default function TripGrid({ trips, isLoading, onClearFilters }: TripGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (!trips.length) {
    return (
      <EmptyState
        icon="🏕️"
        title="No trips found"
        message="Try adjusting your filters or search to find something that matches."
        action={onClearFilters ? { label: 'Clear Filters', onClick: onClearFilters } : undefined}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {trips.map((trip) => (
        <TripCard key={trip._id} trip={trip} />
      ))}
    </div>
  );
}
