'use client';

import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { Plus, Edit2, Trash2, Search, CheckCircle } from 'lucide-react';
import { useTrips } from '@/hooks/useTrips';
import { adminDeleteTrip, adminUpdateTrip } from '@/lib/admin-api';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Pagination from '@/components/ui/Pagination';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import { formatCurrency, cn } from '@/lib/utils';
import type { ITrip } from '@/types';

type FilterTab = 'all' | 'upcoming' | 'completed';

const TABS: { key: FilterTab; label: string }[] = [
  { key: 'all',       label: 'All Trips'       },
  { key: 'upcoming',  label: 'Upcoming'         },
  { key: 'completed', label: 'Completed'        },
];

export default function AdminTripsPage() {
  const queryClient = useQueryClient();
  const [page, setPage]               = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch]           = useState('');
  const [activeTab, setActiveTab]     = useState<FilterTab>('all');

  const [deleteId, setDeleteId]         = useState<string | null>(null);
  const [isDeleting, setIsDeleting]     = useState(false);
  const [deleteError, setDeleteError]   = useState('');

  const [completeTrip, setCompleteTrip]     = useState<ITrip | null>(null);
  const [isCompleting, setIsCompleting]     = useState(false);
  const [completeError, setCompleteError]   = useState('');

  const [togglingId, setTogglingId] = useState<string | null>(null);

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const now = new Date();

  // fetch all trips — we filter client-side by tab
  const { data, isLoading } = useTrips({ search, page, limit: 20 });
  const allTrips = data?.data ?? [];
  const pagination = data?.pagination;

  // tab filter
  const trips = allTrips.filter((t) => {
    if (activeTab === 'upcoming')  return t.isActive && t.startDates.some((d) => new Date(d) >= now);
    if (activeTab === 'completed') return !t.isActive || t.startDates.every((d) => new Date(d) < now);
    return true; // 'all'
  });

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true); setDeleteError('');
    try {
      await adminDeleteTrip(deleteId);
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      setDeleteId(null);
    } catch (err) {
      const e = err as { response?: { data?: { message?: string } }; message?: string };
      setDeleteError(e.response?.data?.message ?? e.message ?? 'Failed to delete.');
    } finally { setIsDeleting(false); }
  };

  // ── Toggle Active ──────────────────────────────────────────────────────────
  const handleToggleActive = async (id: string, current: boolean) => {
    setTogglingId(id);
    try {
      await adminUpdateTrip(id, { isActive: !current });
      queryClient.invalidateQueries({ queryKey: ['trips'] });
    } finally { setTogglingId(null); }
  };

  // ── Mark Complete ──────────────────────────────────────────────────────────
  const handleMarkComplete = async () => {
    if (!completeTrip) return;
    setIsCompleting(true); setCompleteError('');
    try {
      await adminUpdateTrip(completeTrip._id, { isActive: false });
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      setCompleteTrip(null);
    } catch (err) {
      const e = err as { response?: { data?: { message?: string } }; message?: string };
      setCompleteError(e.response?.data?.message ?? e.message ?? 'Failed.');
    } finally { setIsCompleting(false); }
  };

  return (
    <div className="p-6 md:p-8">

      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Trips</h1>
          <p className="mt-1 text-sm text-gray-500">Manage all trip listings</p>
        </div>
        <Link href="/admin/trips/new">
          <Button variant="primary">
            <Plus className="h-4 w-4" /> Add New Trip
          </Button>
        </Link>
      </div>

      {/* Search + Filter Tabs */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Search */}
        <div className="flex flex-1 items-center gap-2 rounded-xl bg-white px-4 py-2.5 shadow-sm">
          <Search className="h-4 w-4 shrink-0 text-gray-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search trips..."
            className="flex-1 bg-transparent text-sm placeholder:text-gray-400 focus:outline-none"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 rounded-xl bg-gray-100 p-1">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setPage(1); }}
              className={cn(
                'rounded-lg px-4 py-2 text-xs font-semibold transition-colors whitespace-nowrap',
                activeTab === tab.key
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              {tab.label}
              {tab.key === 'all' && allTrips.length > 0 && (
                <span className="ml-1.5 rounded-full bg-gray-200 px-1.5 py-0.5 text-[10px]">
                  {allTrips.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl bg-white shadow-sm">
        {isLoading ? (
          <div className="flex justify-center py-16"><LoadingSpinner /></div>
        ) : trips.length === 0 ? (
          <EmptyState icon="🗺️" title={`No ${activeTab === 'all' ? '' : activeTab} trips found`} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-100 bg-gray-50">
                <tr>
                  <th className="w-14 px-3 py-3" />
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Trip</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Price</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Seats</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {trips.map((trip) => {
                  const isUpcoming  = trip.isActive && trip.startDates.some((d) => new Date(d) >= now);
                  const isCompleted = !trip.isActive;
                  return (
                    <tr key={trip._id} className="hover:bg-gray-50 transition-colors">
                      {/* Image */}
                      <td className="px-3 py-3">
                        <img
                          src={trip.coverImage || 'https://picsum.photos/seed/trip/80/60'}
                          alt={trip.title}
                          className="h-10 w-14 rounded-lg object-cover"
                        />
                      </td>
                      {/* Trip info */}
                      <td className="px-4 py-3">
                        <p className="font-semibold text-gray-900 line-clamp-1 max-w-[200px]">{trip.title}</p>
                        <p className="mt-0.5 text-xs text-gray-400">{trip.destination} · {trip.duration}D/{trip.nights}N</p>
                      </td>
                      {/* Category */}
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">{trip.category}</span>
                      </td>
                      {/* Price */}
                      <td className="px-4 py-3 font-semibold text-[#FF6B00]">{formatCurrency(trip.pricePerPerson)}</td>
                      {/* Seats */}
                      <td className="px-4 py-3 text-gray-600">{trip.availableSeats}</td>
                      {/* Status */}
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleToggleActive(trip._id, trip.isActive)}
                          disabled={togglingId === trip._id}
                          title="Click to toggle"
                          className={cn(
                            'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors disabled:opacity-60',
                            isCompleted
                              ? 'bg-gray-100 text-gray-500'
                              : isUpcoming
                              ? 'bg-green-50 text-green-700'
                              : 'bg-yellow-50 text-yellow-700'
                          )}
                        >
                          <span className={cn(
                            'h-1.5 w-1.5 rounded-full',
                            isCompleted ? 'bg-gray-400' : isUpcoming ? 'bg-green-500' : 'bg-yellow-500'
                          )} />
                          {togglingId === trip._id ? '...' : isCompleted ? 'Completed' : isUpcoming ? 'Upcoming' : 'Active'}
                        </button>
                      </td>
                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link href={`/admin/trips/${trip._id}/edit`}>
                            <button className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                              <Edit2 className="h-3.5 w-3.5" /> Edit
                            </button>
                          </Link>
                          {trip.isActive && (
                            <button
                              onClick={() => setCompleteTrip(trip)}
                              className="flex items-center gap-1 rounded-lg border border-green-200 bg-green-50 px-2.5 py-1.5 text-xs font-medium text-green-700 hover:bg-green-100 transition-colors"
                            >
                              <CheckCircle className="h-3.5 w-3.5" /> Complete
                            </button>
                          )}
                          <button
                            onClick={() => setDeleteId(trip._id)}
                            className="flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="mt-6">
          <Pagination page={page} totalPages={pagination.totalPages} onPageChange={setPage} />
        </div>
      )}

      {/* Delete Modal */}
      <Modal isOpen={!!deleteId} onClose={() => { setDeleteId(null); setDeleteError(''); }} title="Delete Trip" size="sm">
        <p className="mb-4 text-sm text-gray-600">This will hide the trip from users. Data is preserved.</p>
        {deleteError && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{deleteError}</div>}
        <div className="flex gap-3">
          <Button variant="ghost" className="flex-1" onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button variant="danger" className="flex-1" loading={isDeleting} onClick={handleDelete}>Confirm Delete</Button>
        </div>
      </Modal>

      {/* Mark Complete Modal */}
      <Modal isOpen={!!completeTrip} onClose={() => { setCompleteTrip(null); setCompleteError(''); }} title="Mark Trip as Completed" size="sm">
        {completeTrip && (
          <>
            <div className="mb-4 flex items-center gap-3 rounded-xl bg-gray-50 p-3">
              <img src={completeTrip.coverImage} alt={completeTrip.title} className="h-12 w-16 rounded-lg object-cover shrink-0" />
              <div>
                <p className="font-semibold text-gray-900 text-sm">{completeTrip.title}</p>
                <p className="text-xs text-gray-500">{completeTrip.destination}</p>
              </div>
            </div>
            <p className="mb-4 text-sm text-gray-600">
              This will move the trip to <strong>Completed Trips</strong> section on the homepage and hide it from active listings.
            </p>
            {completeError && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{completeError}</div>}
            <div className="flex gap-3">
              <Button variant="ghost" className="flex-1" onClick={() => setCompleteTrip(null)}>Cancel</Button>
              <Button className="flex-1 bg-green-600 text-white hover:bg-green-700" loading={isCompleting} onClick={handleMarkComplete}>
                <CheckCircle className="h-4 w-4" /> Mark Completed
              </Button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
