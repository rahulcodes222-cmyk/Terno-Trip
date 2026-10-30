'use client';

import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MapPin, CheckCircle, Briefcase, DollarSign, Plus, Edit2, Trash2, Bus } from 'lucide-react';
import { adminGetStats, adminDeleteTrip } from '@/lib/admin-api';
import { useTrips } from '@/hooks/useTrips';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Badge from '@/components/ui/Badge';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function AdminDashboardPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // ── Stats ─────────────────────────────────────────────────────────────────
  const { data: stats, isLoading: statsLoading, isError: statsError } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: adminGetStats,
  });

  // ── Recent trips ──────────────────────────────────────────────────────────
  const { data: tripsData, isLoading: tripsLoading } = useTrips({ limit: 5, page: 1 });
  const trips = tripsData?.data ?? [];

  // ── Delete handler ────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    setDeleteError('');
    try {
      await adminDeleteTrip(deleteId);
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      setDeleteId(null);
    } catch (err) {
      const e = err as { response?: { data?: { message?: string } }; message?: string };
      setDeleteError(e.response?.data?.message ?? e.message ?? 'Failed to delete trip. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const statCards = [
    {
      label: 'Total Trips',
      value: stats?.totalTrips ?? 0,
      icon: MapPin,
      color: 'text-[#FF6B00] bg-orange-50',
    },
    {
      label: 'Active Trips',
      value: stats?.activeTrips ?? 0,
      icon: CheckCircle,
      color: 'text-green-600 bg-green-50',
    },
    {
      label: 'Total Bookings',
      value: stats?.totalBookings ?? 0,
      icon: Briefcase,
      color: 'text-[#1B2E6B] bg-blue-50',
    },
    {
      label: 'Total Revenue',
      value: formatCurrency(stats?.totalRevenue ?? 0),
      icon: DollarSign,
      color: 'text-purple-600 bg-purple-50',
    },
  ];

  return (
    <div className="p-6 md:p-8">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Welcome back — here's what's happening.</p>
      </div>

      {/* Stat cards */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statsLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-xl bg-gray-200" />
            ))
          : statsError
          ? (
            <div className="col-span-2 lg:col-span-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              Failed to load dashboard statistics. Please refresh the page.
            </div>
          )
          : statCards.map(({ label, value, icon: Icon, color }) => (
              <div
                key={label}
                className="rounded-xl bg-white p-5 shadow-sm flex items-center gap-4"
              >
                <div className={`rounded-lg p-2 ${color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">{label}</p>
                  <p className="text-xl font-bold text-gray-900">{value}</p>
                </div>
              </div>
            ))}
      </div>

      {/* Recent Trips */}
      <div className="mb-8 rounded-xl bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-base font-semibold text-gray-900">Recent Trips</h2>
          <Link
            href="/admin/trips"
            className="text-sm font-medium text-[#FF6B00] hover:underline"
          >
            View all →
          </Link>
        </div>

        {tripsLoading ? (
          <div className="flex justify-center py-10">
            <LoadingSpinner />
          </div>
        ) : trips.length === 0 ? (
          <p className="py-10 text-center text-sm text-gray-500">No trips yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-100 bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left font-medium text-gray-500">Title</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-500">Destination</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-500">Price</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-500">Seats</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-500">Status</th>
                  <th className="px-6 py-3 text-right font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {trips.map((trip) => (
                  <tr key={trip._id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 font-medium text-gray-900">{trip.title}</td>
                    <td className="px-6 py-3 text-gray-600">{trip.destination}</td>
                    <td className="px-6 py-3 text-gray-600">{formatCurrency(trip.pricePerPerson)}</td>
                    <td className="px-6 py-3 text-gray-600">{trip.availableSeats}</td>
                    <td className="px-6 py-3">
                      <Badge status={trip.isActive ? 'Active' : 'Inactive'} />
                    </td>
                    <td className="px-6 py-3 text-right">
                      <div className="inline-flex gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => router.push(`/admin/trips/${trip._id}/edit`)}
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                          Edit
                        </Button>
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

      {/* Quick actions */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link
          href="/admin/trips/new"
          className="flex items-center gap-3 rounded-xl bg-[#FF6B00] p-5 text-white shadow-sm hover:bg-[#E65100] transition-colors"
        >
          <Plus className="h-6 w-6 shrink-0" />
          <div>
            <p className="font-semibold">Add New Trip</p>
            <p className="text-xs text-orange-100">Create a new trip listing</p>
          </div>
        </Link>
        <Link
          href="/admin/master"
          className="flex items-center gap-3 rounded-xl bg-green-600 p-5 text-white shadow-sm hover:bg-green-700 transition-colors"
        >
          <Bus className="h-6 w-6 shrink-0" />
          <div>
            <p className="font-semibold">Master Dashboard</p>
            <p className="text-xs text-green-100">Update live trip status</p>
          </div>
        </Link>
        <Link
          href="/admin/bookings"
          className="flex items-center gap-3 rounded-xl bg-[#1B2E6B] p-5 text-white shadow-sm hover:bg-[#162456] transition-colors"
        >
          <Briefcase className="h-6 w-6 shrink-0" />
          <div>
            <p className="font-semibold">View All Bookings</p>
            <p className="text-xs text-blue-200">Manage customer bookings</p>
          </div>
        </Link>
      </div>

      {/* Delete confirm modal */}
      <Modal
        isOpen={!!deleteId}
        onClose={() => { setDeleteId(null); setDeleteError(''); }}
        title="Deactivate Trip"
        size="sm"
      >
        <p className="mb-6 text-sm text-gray-600">
          This will soft-delete the trip and make it invisible to users.
        </p>
        {deleteError && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {deleteError}
          </div>
        )}
        <div className="flex gap-3">
          <Button variant="ghost" className="flex-1" onClick={() => { setDeleteId(null); setDeleteError(''); }}>
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
