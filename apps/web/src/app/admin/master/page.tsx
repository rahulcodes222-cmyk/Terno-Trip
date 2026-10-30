'use client';

import React, { useState } from 'react';
import {
  MapPin, Camera, CheckCircle, Clock, Bus,
  Upload, ChevronDown, ChevronUp, Image as ImageIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ── Types ────────────────────────────────────────────────────────────────────

type TripStatus =
  | 'not_started'
  | 'boarding'
  | 'en_route'
  | 'at_stop'
  | 'arrived'
  | 'completed';

interface StatusUpdate {
  id: string;
  status: TripStatus;
  location: string;
  message: string;
  timestamp: string;
  photos: string[]; // object URLs (preview only — no API)
}

interface MockTrip {
  id: string;
  title: string;
  destination: string;
  date: string;
  travellers: number;
  busNumber: string;
  coverImage: string;
}

// ── Static demo trips ─────────────────────────────────────────────────────────
const DEMO_TRIPS: MockTrip[] = [
  {
    id: '1',
    title: 'Manali Adventure Expedition',
    destination: 'Manali, Himachal Pradesh',
    date: '2025-06-01',
    travellers: 14,
    busNumber: 'HP-12-3456',
    coverImage: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=400',
  },
  {
    id: '2',
    title: 'Kerala Backwaters & Munnar',
    destination: 'Kerala',
    date: '2025-06-15',
    travellers: 12,
    busNumber: 'KL-07-8901',
    coverImage: 'https://images.unsplash.com/photo-1593693411515-c20261bcad6e?w=400',
  },
  {
    id: '3',
    title: 'Royal Rajasthan Tour',
    destination: 'Rajasthan',
    date: '2025-07-01',
    travellers: 16,
    busNumber: 'RJ-14-5678',
    coverImage: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=400',
  },
];

const STATUS_OPTIONS: { value: TripStatus; label: string; color: string }[] = [
  { value: 'not_started', label: 'Not Started',    color: 'bg-gray-100 text-gray-600'   },
  { value: 'boarding',    label: 'Boarding',        color: 'bg-blue-100 text-blue-700'   },
  { value: 'en_route',    label: 'En Route',        color: 'bg-orange-100 text-orange-700' },
  { value: 'at_stop',     label: 'At Stop / Break', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'arrived',     label: 'Arrived',         color: 'bg-purple-100 text-purple-700' },
  { value: 'completed',   label: 'Trip Completed',  color: 'bg-green-100 text-green-700'  },
];

function statusColor(s: TripStatus) {
  return STATUS_OPTIONS.find((o) => o.value === s)?.color ?? 'bg-gray-100 text-gray-600';
}
function statusLabel(s: TripStatus) {
  return STATUS_OPTIONS.find((o) => o.value === s)?.label ?? s;
}

// ── Component ────────────────────────────────────────────────────────────────
export default function MasterDashboard() {
  const [selectedTrip, setSelectedTrip] = useState<MockTrip | null>(null);
  const [currentStatus, setCurrentStatus] = useState<TripStatus>('not_started');
  const [location, setLocation]   = useState('');
  const [message, setMessage]     = useState('');
  const [photos, setPhotos]       = useState<string[]>([]);
  const [updates, setUpdates]     = useState<StatusUpdate[]>([]);
  const [showHistory, setShowHistory] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  // photo file input → object URLs (no upload API yet)
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const urls = files.map((f) => URL.createObjectURL(f));
    setPhotos((prev) => [...prev, ...urls]);
  };

  const removePhoto = (idx: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmitUpdate = () => {
    if (!selectedTrip || !location.trim()) return;

    const update: StatusUpdate = {
      id: Date.now().toString(),
      status: currentStatus,
      location: location.trim(),
      message: message.trim(),
      timestamp: new Date().toLocaleString('en-IN'),
      photos,
    };

    setUpdates((prev) => [update, ...prev]);
    setMessage('');
    setPhotos([]);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Bus className="h-6 w-6 text-[#FF6B00]" />
          <h1 className="text-2xl font-bold text-gray-900">Master Dashboard</h1>
        </div>
        <p className="text-sm text-gray-500">
          Bus trip master — update live trip status, location, and upload photos.
          <span className="ml-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
            UI Only — API integration pending
          </span>
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        {/* ── Left: Trip selector ──────────────────────────────────────── */}
        <div className="lg:col-span-1">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Select Active Trip
          </h2>
          <div className="space-y-3">
            {DEMO_TRIPS.map((trip) => (
              <button
                key={trip.id}
                onClick={() => { setSelectedTrip(trip); setUpdates([]); setCurrentStatus('not_started'); }}
                className={cn(
                  'w-full overflow-hidden rounded-xl border text-left transition-all',
                  selectedTrip?.id === trip.id
                    ? 'border-[#FF6B00] ring-2 ring-[#FF6B00]/20'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                )}
              >
                <div className="flex items-center gap-3 p-3">
                  <img
                    src={trip.coverImage}
                    alt={trip.title}
                    className="h-12 w-16 shrink-0 rounded-lg object-cover"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-gray-900">{trip.title}</p>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-500">
                      <MapPin className="h-3 w-3 shrink-0" /> {trip.destination}
                    </p>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-400">
                      <Bus className="h-3 w-3 shrink-0" /> {trip.busNumber} · {trip.travellers} travellers
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ── Right: Update form + history ──────────────────────────────── */}
        <div className="lg:col-span-2 space-y-5">

          {!selectedTrip ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-white py-16 text-center">
              <Bus className="mb-3 h-10 w-10 text-gray-300" />
              <p className="text-sm font-medium text-gray-400">Select a trip to post an update</p>
            </div>
          ) : (
            <>
              {/* Selected trip banner */}
              <div className="flex items-center gap-3 rounded-xl border border-[#FF6B00]/20 bg-orange-50 p-4">
                <img src={selectedTrip.coverImage} alt={selectedTrip.title} className="h-12 w-16 rounded-lg object-cover shrink-0" />
                <div>
                  <p className="font-bold text-gray-900">{selectedTrip.title}</p>
                  <p className="text-xs text-gray-500">{selectedTrip.destination} · {new Date(selectedTrip.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                </div>
                <span className={cn('ml-auto shrink-0 rounded-full px-3 py-1 text-xs font-bold', statusColor(currentStatus))}>
                  {statusLabel(currentStatus)}
                </span>
              </div>

              {/* Update form */}
              <div className="rounded-xl bg-white p-5 shadow-sm space-y-4">
                <h3 className="font-semibold text-gray-900">Post Status Update</h3>

                {/* Status selector */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Trip Status
                  </label>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {STATUS_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setCurrentStatus(opt.value)}
                        className={cn(
                          'rounded-lg border px-3 py-2 text-xs font-medium transition-all text-left',
                          currentStatus === opt.value
                            ? 'border-[#FF6B00] bg-orange-50 text-[#FF6B00] ring-1 ring-[#FF6B00]'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Current location */}
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Current Location <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 focus-within:border-[#FF6B00] focus-within:ring-1 focus-within:ring-[#FF6B00]">
                    <MapPin className="h-4 w-4 shrink-0 text-gray-400" />
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Passing through Manali bypass, NH3"
                      className="flex-1 bg-transparent text-sm focus:outline-none"
                    />
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Message for Travellers (optional)
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="e.g. We have reached Rohtang Pass. Stunning views! Next stop in 30 mins."
                    rows={3}
                    className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#FF6B00] focus:outline-none focus:ring-1 focus:ring-[#FF6B00]"
                  />
                </div>

                {/* Photo upload */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Upload Photos (optional)
                  </label>

                  {/* Upload button */}
                  <label className="flex cursor-pointer items-center gap-2 rounded-lg border-2 border-dashed border-gray-200 px-4 py-3 text-sm text-gray-500 hover:border-[#FF6B00] hover:text-[#FF6B00] transition-colors">
                    <Upload className="h-4 w-4" />
                    <span>Choose photos from device</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handlePhotoChange}
                    />
                  </label>

                  {/* Photo previews */}
                  {photos.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {photos.map((url, i) => (
                        <div key={i} className="relative group">
                          <img src={url} alt={`photo ${i + 1}`} className="h-16 w-20 rounded-lg object-cover" />
                          <button
                            onClick={() => removePhoto(i)}
                            className="absolute -right-1.5 -top-1.5 hidden h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white group-hover:flex"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Submit */}
                {submitted ? (
                  <div className="flex items-center gap-2 rounded-lg bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                    <CheckCircle className="h-4 w-4" /> Update posted successfully!
                  </div>
                ) : (
                  <button
                    onClick={handleSubmitUpdate}
                    disabled={!location.trim()}
                    className="w-full rounded-xl py-3 text-sm font-bold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                    style={{ backgroundColor: '#FF6B00' }}
                  >
                    Post Update
                  </button>
                )}
              </div>

              {/* Update history */}
              {updates.length > 0 && (
                <div className="rounded-xl bg-white shadow-sm overflow-hidden">
                  <button
                    onClick={() => setShowHistory(!showHistory)}
                    className="flex w-full items-center justify-between px-5 py-4 text-left"
                  >
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="font-semibold text-gray-900">Update History</span>
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                        {updates.length}
                      </span>
                    </div>
                    {showHistory ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                  </button>

                  {showHistory && (
                    <div className="border-t border-gray-100">
                      {updates.map((u, idx) => (
                        <div key={u.id} className={cn('px-5 py-4', idx !== updates.length - 1 && 'border-b border-gray-50')}>
                          <div className="flex items-start gap-3">
                            {/* Timeline dot */}
                            <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-100">
                              <MapPin className="h-3.5 w-3.5 text-[#FF6B00]" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-bold', statusColor(u.status))}>
                                  {statusLabel(u.status)}
                                </span>
                                <span className="text-xs text-gray-400">{u.timestamp}</span>
                              </div>
                              <p className="mt-1 text-sm font-medium text-gray-800">{u.location}</p>
                              {u.message && <p className="mt-0.5 text-sm text-gray-500">{u.message}</p>}
                              {u.photos.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-1.5">
                                  {u.photos.map((ph, pi) => (
                                    <img key={pi} src={ph} alt="" className="h-14 w-18 rounded-lg object-cover" />
                                  ))}
                                  <div className="flex items-center gap-1 rounded-lg bg-gray-50 px-2 text-xs text-gray-500">
                                    <ImageIcon className="h-3 w-3" /> {u.photos.length} photo{u.photos.length > 1 ? 's' : ''}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
