'use client';

import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';
import { useTrips } from '@/hooks/useTrips';
import { adminDeleteTrip, adminUpdateTrip } from '@/lib/admin-api';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Pagination from '@/components/ui/Pagination';
import Badge from '@/components/ui/Badge';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import { formatCurrency } from '@/lib/utils';

export default function AdminTripsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data, isLoading } = useTrips({ search, page, limit: 10 });
  const trips = data?.data ?? [];
  const pagination = data?.pagination;

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await adminDeleteTrip(deleteId);
      queryClient.invalidateQueries({ queryKey: ['trips'] });
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const handleToggleActive = async (id: string, current: boolean) => {
    setTogglingId(id);
    try {
      await adminUpdateTrip(id, { isActive: !current });
      queryClient.invalidateQueries({ queryKey: ['trips'] });
    } finally {
      setTogglingId(null);
    }
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
            <Plus className="h-4 w-4" />
            Add New Trip
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="mb-4 flex items-center gap-2 rounded-xl bg-white px-4 py-3 shadow-sm">
        <Search className="h-4 w-4 shrink-0 text-gray-400" />
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search trips..."
          className="flex-1 bg-transparent text-sm placeholder:text-gray-400 focus:outline-none"
        />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl bg-white shadow-sm">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner />
          </div>
        ) : trips.length === 0 ? (
          <EmptyState icon="🗺️" title="No trips found" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-white border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-500 w-10"></th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Title</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Destination</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Category</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Price</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Duration</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Seats</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {trips.map((trip) => (
                  <tr key={trip._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      {trip.coverImage ? (
                        <img
                          src={trip.coverImage}
                          alt={trip.title}
                          className="h-10 w-10 rounded object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
                          N/A
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">{trip.title}</td>
                    <td className="px-4 py-3 text-gray-600">{trip.destination}</td>
                    <td className="px-4 py-3 text-gray-600">{trip.category}</td>
                    <td className="px-4 py-3 text-gray-600">{formatCurrency(trip.pricePerPerson)}</td>
                    <td className="px-4 py-3 text-gray-600">{trip.duration} days</td>
                    <td className="px-4 py-3 text-gray-600">{trip.availableSeats}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggleActive(trip._id, trip.isActive)}
                        disabled={togglingId === trip._id}
                        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors disabled:opacity-60"
                        style={
                          trip.isActive
                            ? { backgroundColor: '#dcfce7', color: '#16a34a' }
                            : { backgroundColor: '#f3f4f6', color: '#6b7280' }
                        }
                        title="Toggle active"
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${trip.isActive ? 'bg-green-500' : 'bg-gray-400'}`}
                        />
                        {trip.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex gap-2">
                        <Link href={`/admin/trips/${trip._id}/edit`}>
                          <Button variant="secondary" size="sm">
                            <Edit2 className="h-3.5 w-3.5" />
                            Edit
                          </Button>
                        </Link>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => setDeleteId(trip._id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
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

      {/* Delete confirm modal */}
      <Modal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Deactivate Trip"
        size="sm"
      >
        <p className="mb-6 text-sm text-gray-600">
          This will soft-delete the trip and make it invisible to users.
        </p>
        <div className="flex gap-3">
          <Button variant="ghost" className="flex-1" onClick={() => setDeleteId(null)}>
            Keep
          </Button>
          <Button
            variant="danger"
            className="flex-1"
            loading={isDeleting}
            onClick={handleDelete}
          >
            Confirm Deactivate
          </Button>
        </div>
      </Modal>
    </div>
  );
}
