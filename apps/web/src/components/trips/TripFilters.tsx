'use client';

import React, { useState } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TripsFilter } from '@/types';

const CATEGORIES = ['Adventure', 'Beach', 'Cultural', 'Wildlife', 'City', 'Mountain', 'Budget'];
const DURATIONS = [
  { label: 'Any', value: '' },
  { label: 'Short (1-3 days)', value: '1-3' },
  { label: 'Week (4-7 days)', value: '4-7' },
  { label: 'Extended (8+ days)', value: '8+' },
];
const SORT_OPTIONS = [
  { label: 'Default', value: '' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
  { label: 'Top Rated', value: 'rating' },
  { label: 'Longest', value: 'duration' },
];

interface TripFiltersProps {
  filters: TripsFilter;
  onChange: (filters: TripsFilter) => void;
}

export default function TripFilters({ filters, onChange }: TripFiltersProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const update = (patch: Partial<TripsFilter>) => {
    onChange({ ...filters, ...patch, page: 1 });
  };

  const clearAll = () => {
    onChange({ page: 1 });
  };

  const hasFilters =
    !!filters.search ||
    !!filters.category ||
    !!filters.minPrice ||
    !!filters.maxPrice ||
    !!filters.duration ||
    !!filters.sortBy;

  const filterPanel = (
    <div className="space-y-5">
      {/* Search */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">Search</label>
        <input
          type="text"
          placeholder="Destination, trip name..."
          value={filters.search ?? ''}
          onChange={(e) => update({ search: e.target.value })}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#FF6B00] focus:outline-none focus:ring-1 focus:ring-[#FF6B00]"
        />
      </div>

      {/* Category */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">Category</label>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => update({ category: filters.category === cat ? '' : cat })}
              className={cn(
                'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                filters.category === cat
                  ? 'border-[#FF6B00] bg-[#FF6B00] text-white'
                  : 'border-gray-200 text-gray-600 hover:border-[#FF6B00] hover:text-[#FF6B00]'
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Price Range (₹)
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.minPrice ?? ''}
            onChange={(e) => update({ minPrice: e.target.value ? Number(e.target.value) : undefined })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#FF6B00] focus:outline-none focus:ring-1 focus:ring-[#FF6B00]"
          />
          <span className="text-gray-400">–</span>
          <input
            type="number"
            placeholder="Max"
            value={filters.maxPrice ?? ''}
            onChange={(e) => update({ maxPrice: e.target.value ? Number(e.target.value) : undefined })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#FF6B00] focus:outline-none focus:ring-1 focus:ring-[#FF6B00]"
          />
        </div>
      </div>

      {/* Duration */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">Duration</label>
        <div className="space-y-1.5">
          {DURATIONS.map((d) => (
            <label key={d.value} className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="radio"
                name="duration"
                checked={(filters.duration ?? '') === d.value}
                onChange={() => update({ duration: d.value })}
                className="accent-[#FF6B00]"
              />
              <span className="text-gray-700">{d.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Sort */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">Sort By</label>
        <select
          value={filters.sortBy ?? ''}
          onChange={(e) => update({ sortBy: e.target.value })}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#FF6B00] focus:outline-none focus:ring-1 focus:ring-[#FF6B00]"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {hasFilters && (
        <button
          onClick={clearAll}
          className="flex w-full items-center justify-center gap-1 rounded-lg border border-red-200 py-2 text-sm text-red-600 hover:bg-red-50"
        >
          <X className="h-3.5 w-3.5" /> Clear All Filters
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {hasFilters && (
            <span className="rounded-full bg-[#FF6B00] px-1.5 text-xs text-white">
              active
            </span>
          )}
        </button>

        {mobileOpen && (
          <div className="mt-3 rounded-xl border border-gray-100 bg-white p-4 shadow-md">
            {filterPanel}
          </div>
        )}
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:block w-64 shrink-0">
        <div className="sticky top-24 rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <h3 className="mb-4 font-semibold text-gray-900">Filters</h3>
          {filterPanel}
        </div>
      </div>
    </>
  );
}
