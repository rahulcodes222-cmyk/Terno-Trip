'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import PageLayout from '@/components/layout/PageLayout';
import TripGrid from '@/components/trips/TripGrid';
import TripFilters from '@/components/trips/TripFilters';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useTrips } from '@/hooks/useTrips';
import type { TripsFilter, ITrip } from '@/types';

export default function TripsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [filters, setFilters] = useState<TripsFilter>({
    search: searchParams.get('search') ?? undefined,
    category: searchParams.get('category') ?? undefined,
    sortBy: searchParams.get('sortBy') ?? undefined,
    page: 1,
    limit: 12,
  });

  // All accumulated trips for infinite scroll
  const [allTrips, setAllTrips] = useState<ITrip[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  // Sentinel element for IntersectionObserver
  const sentinelRef = useRef<HTMLDivElement>(null);

  const { data, isLoading } = useTrips(filters);

  // When new page data arrives, append to allTrips
  useEffect(() => {
    if (!data) return;
    const incoming = data.data ?? [];
    const { page, totalPages } = data.pagination ?? { page: 1, totalPages: 1 };

    if (page === 1) {
      // Fresh search/filter — reset
      setAllTrips(incoming);
    } else {
      // Load more — append
      setAllTrips((prev) => {
        const ids = new Set(prev.map((t) => t._id));
        return [...prev, ...incoming.filter((t) => !ids.has(t._id))];
      });
    }

    setHasMore(page < totalPages);
    setIsFetchingMore(false);
  }, [data]);

  // Reset when filters (except page) change
  const handleFiltersChange = (f: TripsFilter) => {
    setAllTrips([]);
    setHasMore(true);
    setFilters({ ...f, page: 1 });
  };

  // Sync filters → URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.search) params.set('search', filters.search);
    if (filters.category) params.set('category', filters.category);
    if (filters.sortBy) params.set('sortBy', filters.sortBy);
    if (filters.duration) params.set('duration', filters.duration);
    router.replace(`/trips?${params.toString()}`, { scroll: false });
  }, [filters.search, filters.category, filters.sortBy, filters.duration, router]);

  // Intersection Observer — load more when sentinel visible
  const loadMore = useCallback(() => {
    if (isLoading || isFetchingMore || !hasMore) return;
    setIsFetchingMore(true);
    setFilters((prev) => ({ ...prev, page: (prev.page ?? 1) + 1 }));
  }, [isLoading, isFetchingMore, hasMore]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: '200px' } // trigger 200px before reaching bottom
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore]);

  const showSpinner = isLoading && (filters.page ?? 1) === 1;

  return (
    <PageLayout>
      {/* Page Header — Banner */}
      <div className="mx-auto max-w-container px-4 pt-6 sm:px-6">
        <div
          className="relative overflow-hidden rounded-2xl h-[200px] sm:h-[280px]"
        >
          {/* Background image */}
          <img
            src="https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1400&q=80"
            alt="Explore India"
            className="absolute inset-0 h-full w-full object-cover"
          />
          {/* Dark overlay */}
          <div className="absolute inset-0" style={{ backgroundColor: 'rgba(10,20,40,0.70)' }} />
          {/* Content */}
          <div className="relative z-10 flex h-full flex-col justify-center px-8">
            <p className="mb-1 text-xs font-bold uppercase tracking-widest text-[#FF6B00]">All Packages</p>
            <h1 className="text-3xl font-extrabold text-white sm:text-4xl">Explore India</h1>
            <p className="mt-2 text-gray-300">Handcrafted tours across the length and breadth of Incredible India.</p>
            {/* Search bar */}
            <div className="mt-4 flex max-w-md gap-2">
              <input
                type="text"
                placeholder="Search destinations, trips..."
                value={filters.search ?? ''}
                onChange={(e) => handleFiltersChange({ ...filters, search: e.target.value, page: 1 })}
                onKeyDown={(e) => { if (e.key === 'Enter') handleFiltersChange({ ...filters, page: 1 }); }}
                className="flex-1 rounded-lg border-0 px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
              />
              <button
                onClick={() => handleFiltersChange({ ...filters, page: 1 })}
                className="rounded-lg bg-[#FF6B00] px-5 py-2 text-sm font-semibold text-white hover:bg-[#e55f00]"
              >
                Search
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-container px-4 py-8 sm:px-6">
        {/* Result count */}
        {data?.pagination && (
          <p className="mb-4 text-sm text-gray-500">
            Showing <span className="font-semibold text-gray-900">{allTrips.length}</span>{' '}
            of <span className="font-semibold text-gray-900">{data.pagination.total}</span> trips
          </p>
        )}

        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Filters */}
          <TripFilters filters={filters} onChange={handleFiltersChange} />

          {/* Results */}
          <div className="flex-1 min-w-0">
            <TripGrid
              trips={allTrips}
              isLoading={showSpinner}
              onClearFilters={() => handleFiltersChange({ page: 1, limit: 12 })}
            />

            {/* Sentinel — triggers load more when visible */}
            <div ref={sentinelRef} className="h-4 w-full" />

            {/* Loading more indicator */}
            {isFetchingMore && (
              <div className="flex justify-center py-6">
                <LoadingSpinner size="md" />
              </div>
            )}

            {/* End of results */}
            {!hasMore && allTrips.length > 0 && (
              <p className="py-6 text-center text-sm text-gray-400">
                ✅ You've seen all {allTrips.length} trip{allTrips.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
