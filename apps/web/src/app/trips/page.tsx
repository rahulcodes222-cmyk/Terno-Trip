'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import PageLayout from '@/components/layout/PageLayout';
import TripGrid from '@/components/trips/TripGrid';
import TripFilters from '@/components/trips/TripFilters';
import Pagination from '@/components/ui/Pagination';
import { useTrips } from '@/hooks/useTrips';
import type { TripsFilter } from '@/types';

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

  const { data, isLoading } = useTrips(filters);
  const trips = data?.data ?? [];
  const pagination = data?.pagination;

  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.search) params.set('search', filters.search);
    if (filters.category) params.set('category', filters.category);
    if (filters.sortBy) params.set('sortBy', filters.sortBy);
    if (filters.duration) params.set('duration', filters.duration);
    router.replace(`/trips?${params.toString()}`, { scroll: false });
  }, [filters, router]);

  return (
    <PageLayout>
      {/* Page Header */}
      <div className="bg-[#0A0A0A] py-12">
        <div className="mx-auto max-w-container px-4 sm:px-6">
          <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-[#FF6B00]">
            All Packages
          </p>
          <h1 className="text-3xl font-extrabold text-white sm:text-4xl">
            Explore India
          </h1>
          <p className="mt-2 text-gray-400">
            Handcrafted tours across the length and breadth of Incredible India.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-container px-4 py-8 sm:px-6 lg:px-8">
        {/* Result count */}
        {pagination && (
          <p className="mb-4 text-sm text-gray-500">
            Showing{' '}
            <span className="font-semibold text-gray-900">{trips.length}</span>{' '}
            of{' '}
            <span className="font-semibold text-gray-900">{pagination.total}</span>{' '}
            trips
          </p>
        )}

        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Filters */}
          <TripFilters
            filters={filters}
            onChange={(f) => setFilters({ ...f, page: 1 })}
          />

          {/* Results */}
          <div className="flex-1 min-w-0">
            <TripGrid
              trips={trips}
              isLoading={isLoading}
              onClearFilters={() => setFilters({ page: 1, limit: 12 })}
            />

            {pagination && pagination.totalPages > 1 && (
              <div className="mt-8">
                <Pagination
                  page={filters.page ?? 1}
                  totalPages={pagination.totalPages}
                  onPageChange={(p) => setFilters((f) => ({ ...f, page: p }))}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
