'use client';

import React, { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  MapPin,
  Clock,
  Users,
  Calendar,
  Share2,
  Heart,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Info,
  ShieldCheck,
  MessageCircle,
  Eye,
  ArrowRight,
  Ticket,
  Compass,
  UserCheck,
  Briefcase,
  Cake,
  Utensils,
  Home,
  CheckCircle2,
} from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Button from '@/components/ui/Button';
import { useTrip } from '@/hooks/useTrips';
import { useAuth } from '@/contexts/AuthContext';
import { saveBookingIntent } from '@/lib/session-storage';
import { formatCurrency, formatDate } from '@/lib/utils';

// Fallback high-resolution photos matching Indian travel destinations
const CURATED_GALLERY_FALLBACKS = [
  'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?w=1000&q=80', // Mumbai Yacht
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80', // Beach
  'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&q=80', // Varanasi / Heritage
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80', // Mountains
  'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&q=80', // Goa Sunset
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80', // Lake
];

export default function TripDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const { data: trip, isLoading, error } = useTrip(slug);

  // Form states
  const [selectedDate, setSelectedDate] = useState('');
  const [travellers, setTravellers] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'itinerary' | 'stay' | 'inclusions' | 'payment' | 'cancellation'
  >('overview');
  const [expandedItineraryDay, setExpandedItineraryDay] = useState<number | null>(0);
  const [showContactModal, setShowContactModal] = useState(false);

  // Effective price calculation
  const effectivePrice = useMemo(() => {
    if (!trip) return 1000;
    if (trip.discountPrice && trip.discountPrice > 0) return trip.discountPrice;
    if (trip.pricePerPerson && trip.pricePerPerson > 0) return trip.pricePerPerson;
    return 1000;
  }, [trip]);

  const taxes = Math.round(effectivePrice * travellers * 0.05);
  const total = effectivePrice * travellers + taxes;

  // Build full 5-image mosaic gallery
  const galleryImages = useMemo(() => {
    if (!trip) return CURATED_GALLERY_FALLBACKS.slice(0, 5);
    const existing = [trip.coverImage, ...(trip.images ?? [])].filter(Boolean);
    const combined = [...existing];
    let fallbackIdx = 0;
    while (combined.length < 5) {
      combined.push(CURATED_GALLERY_FALLBACKS[fallbackIdx % CURATED_GALLERY_FALLBACKS.length]);
      fallbackIdx++;
    }
    return combined.slice(0, 5);
  }, [trip]);

  // Compute duration strings
  const durationDays = trip?.duration && trip.duration > 0 ? trip.duration : 2;
  const nightsCount = trip?.nights && trip.nights > 0 ? trip.nights : Math.max(0, durationDays - 1);

  // Available seats for selected date
  const getSeatsForDate = (date: string): number => {
    if (!trip || !date) return 0;
    const byDateSeats = trip.seatsByStartDate?.find(
      (s) => new Date(s.startDate).toISOString().split('T')[0] === new Date(date).toISOString().split('T')[0]
    );
    return byDateSeats ? byDateSeats.availableSeats : trip.availableSeats;
  };

  const seats = getSeatsForDate(selectedDate);
  const isSoldOut = selectedDate !== '' && seats === 0;
  const isLowStock = selectedDate !== '' && seats > 0 && seats <= 5;

  // Format departure time
  const formatDepartureTime = (time?: string): string => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: trip?.title,
          url: window.location.href,
        });
      } catch {
        // User cancelled share
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 2500);
    }
  };

  const handleBookNow = () => {
    if (!trip) return;
    if (!selectedDate) {
      alert('Please select a departure date');
      return;
    }

    const availableSeats = getSeatsForDate(selectedDate);
    if (travellers > availableSeats) {
      alert(`Only ${availableSeats} seat${availableSeats !== 1 ? 's' : ''} available for selected date.`);
      return;
    }

    if (travellers > trip.maxGroupSize) {
      alert(`Maximum ${trip.maxGroupSize} travellers allowed per booking.`);
      return;
    }

    if (!isAuthenticated) {
      saveBookingIntent({
        tripId: trip._id,
        tripSlug: trip.slug,
        departureDate: selectedDate,
        travellersCount: travellers,
      });
      router.push(`/auth/login?returnUrl=${encodeURIComponent(`/trips/${slug}`)}`);
      return;
    }

    router.push(`/checkout?tripSlug=${trip.slug}&date=${selectedDate}&travellers=${travellers}`);
  };

  if (isLoading) {
    return (
      <PageLayout>
        <LoadingSpinner fullPage />
      </PageLayout>
    );
  }

  if (error || !trip) {
    return (
      <PageLayout>
        <div className="flex min-h-[60vh] flex-col items-center justify-center text-center px-4">
          <p className="text-gray-500 font-semibold">Trip not found.</p>
          <Button variant="primary" className="mt-4" onClick={() => router.push('/trips')}>
            Browse All Trips
          </Button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="bg-[#FAF9F7] min-h-screen pb-16">
        {/* ════════════════════════════════════════════════════════════════
            1. TOP MOSAIC PHOTO GALLERY (Pirttrip 5-Photo Mosaic Grid)
           ════════════════════════════════════════════════════════════════ */}
        <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm">
            {/* Main Photo 1: Big Left View */}
            <div className="col-span-2 row-span-2 relative h-[260px] sm:h-[400px] overflow-hidden group">
              <img
                src={galleryImages[0]}
                alt={trip.title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>

            {/* Photo 2: Top Center with Special Overlay Badge */}
            <div className="relative h-[126px] sm:h-[195px] overflow-hidden group">
              <img
                src={galleryImages[1]}
                alt=""
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {/* Script Badge from screenshot */}
              <div className="absolute top-2 left-2 right-2 bg-blue-900/80 backdrop-blur-xs text-white text-center py-1 px-2 rounded-lg pointer-events-none shadow">
                <p className="text-[10px] sm:text-xs font-serif italic text-amber-200">
                  Create Special Moments on the Sea ♡
                </p>
              </div>
            </div>

            {/* Photo 3: Top Right */}
            <div className="relative h-[126px] sm:h-[195px] overflow-hidden group">
              <img
                src={galleryImages[2]}
                alt=""
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>

            {/* Photo 4: Bottom Center */}
            <div className="relative h-[126px] sm:h-[195px] overflow-hidden group">
              <img
                src={galleryImages[3]}
                alt=""
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>

            {/* Photo 5: Bottom Right */}
            <div className="relative h-[126px] sm:h-[195px] overflow-hidden group">
              <img
                src={galleryImages[4]}
                alt=""
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════════
            2. BREADCRUMB NAVIGATION
           ════════════════════════════════════════════════════════════════ */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-4 pb-2">
          <nav className="flex items-center gap-1.5 text-xs text-gray-400">
            <Link href="/" className="hover:text-gray-700 transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/trips" className="hover:text-gray-700 transition-colors">
              Toursongo
            </Link>
            <span>/</span>
            <span className="text-gray-600 font-medium truncate max-w-md">
              {trip.title}
            </span>
          </nav>
        </div>

        {/* ════════════════════════════════════════════════════════════════
            3. MAIN CONTENT + STICKY SIDEBAR (2 Columns)
           ════════════════════════════════════════════════════════════════ */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-2">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
            {/* ── LEFT COLUMN: TRIP DETAILS & CONTENT ─────────────────── */}
            <div className="flex-1 min-w-0 space-y-6 w-full">
              {/* Card 1: Title, Badges, Details Grid */}
              <div className="rounded-3xl border border-gray-100 bg-white p-5 sm:p-7 shadow-sm">
                {/* Badges Pill Row */}
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                    <Check className="h-3 w-3 stroke-[3]" /> Verified
                  </span>
                  <span className="rounded-full bg-gray-100 px-3 py-0.5 text-xs font-semibold text-gray-600">
                    Standard
                  </span>
                  <span className="rounded-full bg-gray-100 px-3 py-0.5 text-xs font-semibold text-gray-600 capitalize">
                    {trip.category || 'Leisure'}
                  </span>
                  <span className="rounded-full bg-gray-100 px-3 py-0.5 text-xs font-semibold text-gray-600">
                    Domestic
                  </span>
                </div>

                {/* Main Title & Action Buttons */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight leading-snug">
                    {trip.title}
                  </h1>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Wishlist Heart Button */}
                    <button
                      type="button"
                      onClick={() => setIsWishlisted(!isWishlisted)}
                      className={`h-9 w-9 rounded-full border border-gray-200 flex items-center justify-center transition-colors ${
                        isWishlisted ? 'text-red-500 bg-red-50 border-red-200' : 'text-gray-600 hover:bg-gray-50'
                      }`}
                      aria-label="Wishlist"
                    >
                      <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current' : ''}`} />
                    </button>

                    {/* Share Button */}
                    <button
                      type="button"
                      onClick={handleShare}
                      className="flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Share2 className="h-3.5 w-3.5" />
                      <span>{shareSuccess ? 'Copied!' : 'Share'}</span>
                    </button>
                  </div>
                </div>

                {/* DETAILS Section Box (from Screenshot 3) */}
                <div className="mb-6">
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
                    Details
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {/* Item 1: Pickup & Drop */}
                    <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-3 text-left">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-[#FFA300]" /> Pickup &amp; Drop
                      </p>
                      <p className="text-xs font-bold text-gray-900 mt-1 truncate">
                        {trip.destination} to Colaba
                      </p>
                    </div>

                    {/* Item 2: Category */}
                    <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-3 text-left">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1">
                        <Briefcase className="h-3 w-3 text-[#FFA300]" /> Category
                      </p>
                      <p className="text-xs font-bold text-gray-900 mt-1 capitalize truncate">
                        {trip.category || 'Leisure'}
                      </p>
                    </div>

                    {/* Item 3: Duration */}
                    <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-3 text-left">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1">
                        <Clock className="h-3 w-3 text-[#FFA300]" /> Duration
                      </p>
                      <p className="text-xs font-bold text-gray-900 mt-1">
                        {nightsCount}N/{durationDays}D
                      </p>
                    </div>

                    {/* Item 4: Group Size */}
                    <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-3 text-left">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1">
                        <Users className="h-3 w-3 text-[#FFA300]" /> Group Size
                      </p>
                      <p className="text-xs font-bold text-gray-900 mt-1">
                        2–{trip.maxGroupSize || 10}
                      </p>
                    </div>

                    {/* Item 5: Age Limit */}
                    <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-3 text-left">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1">
                        <Cake className="h-3 w-3 text-[#FFA300]" /> Age Limit
                      </p>
                      <p className="text-xs font-bold text-gray-900 mt-1">No Age Limit</p>
                    </div>

                    {/* Item 6: Group */}
                    <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-3 text-left">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1">
                        <UserCheck className="h-3 w-3 text-[#FFA300]" /> Group
                      </p>
                      <p className="text-xs font-bold text-gray-900 mt-1">All genders welcome</p>
                    </div>

                    {/* Item 7: Group Type */}
                    <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-3 text-left">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1">
                        <Users className="h-3 w-3 text-[#FFA300]" /> Group Type
                      </p>
                      <p className="text-xs font-bold text-gray-900 mt-1">Mixed Group</p>
                    </div>

                    {/* Item 8: Customization */}
                    <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-3 text-left">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3 text-[#FFA300]" /> Customization
                      </p>
                      <p className="text-xs font-bold text-gray-900 mt-1">Available</p>
                    </div>
                  </div>
                </div>

                {/* INCLUSIONS Quick Pills (from Screenshot 3) */}
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2.5">
                    Inclusions
                  </p>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50/80 border border-amber-200/60 px-3.5 py-1 text-xs font-bold text-gray-800">
                      <Ticket className="h-3.5 w-3.5 text-[#FFA300]" /> Entry Tickets
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50/80 border border-amber-200/60 px-3.5 py-1 text-xs font-bold text-gray-800">
                      <Compass className="h-3.5 w-3.5 text-[#FFA300]" /> Activities
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50/80 border border-amber-200/60 px-3.5 py-1 text-xs font-bold text-gray-800">
                      <UserCheck className="h-3.5 w-3.5 text-[#FFA300]" /> Tour Captain
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 2: Interactive Tabs Navigation Bar */}
              <div className="rounded-3xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                {/* Horizontal Tab Headers */}
                <div className="flex items-center gap-1 sm:gap-4 overflow-x-auto border-b border-gray-100 px-4 sm:px-6 scrollbar-none">
                  {[
                    { id: 'overview', label: 'Overview' },
                    { id: 'itinerary', label: 'Itinerary' },
                    { id: 'stay', label: 'Stay & Meal' },
                    { id: 'inclusions', label: 'Inclusions & Exclusions' },
                    { id: 'payment', label: 'Payment Policy' },
                    { id: 'cancellation', label: 'Cancellation & Refund Policy' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`py-3.5 sm:py-4 text-xs sm:text-sm font-bold whitespace-nowrap transition-colors relative ${
                        activeTab === tab.id
                          ? 'text-[#FF6B00]'
                          : 'text-gray-500 hover:text-gray-900'
                      }`}
                    >
                      {tab.label}
                      {activeTab === tab.id && (
                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF6B00] rounded-full" />
                      )}
                    </button>
                  ))}
                </div>

                {/* Tab Panel Contents */}
                <div className="p-5 sm:p-7">
                  {/* 1. OVERVIEW */}
                  {activeTab === 'overview' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-base font-bold text-gray-900 mb-2">Overview</h3>
                        <p className="text-sm leading-relaxed text-gray-600 whitespace-pre-line">
                          {trip.description}
                        </p>
                      </div>

                      {/* Highlights */}
                      {(trip.highlights ?? []).length > 0 && (
                        <div>
                          <h4 className="text-sm font-bold text-gray-900 mb-3">Trip Highlights</h4>
                          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {(trip.highlights ?? []).map((h, i) => (
                              <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-gray-700">
                                <span className="h-4 w-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                                  ✓
                                </span>
                                <span>{h}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 2. ITINERARY */}
                  {activeTab === 'itinerary' && (
                    <div>
                      <h3 className="text-base font-bold text-gray-900 mb-4">Day-by-Day Itinerary</h3>
                      {(trip.itinerary ?? []).length > 0 ? (
                        <div className="space-y-3">
                          {trip.itinerary.map((day, idx) => {
                            const isExpanded = expandedItineraryDay === idx;
                            return (
                              <div
                                key={idx}
                                className="rounded-2xl border border-gray-100 bg-gray-50/50 overflow-hidden transition-all"
                              >
                                <button
                                  type="button"
                                  onClick={() => setExpandedItineraryDay(isExpanded ? null : idx)}
                                  className="w-full flex items-center justify-between p-4 text-left font-bold text-sm text-gray-900"
                                >
                                  <div className="flex items-center gap-3">
                                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#FFA300] text-gray-950 text-xs font-black">
                                      {day.day}
                                    </span>
                                    <span>{day.title}</span>
                                  </div>
                                  {isExpanded ? (
                                    <ChevronUp className="h-4 w-4 text-gray-400" />
                                  ) : (
                                    <ChevronDown className="h-4 w-4 text-gray-400" />
                                  )}
                                </button>
                                {isExpanded && (
                                  <div className="px-4 pb-4 pt-1 text-xs sm:text-sm text-gray-600 border-t border-gray-100/80">
                                    <p className="leading-relaxed">{day.description}</p>
                                    {(day.activities ?? []).length > 0 && (
                                      <div className="mt-3 flex flex-wrap gap-1.5">
                                        {day.activities.map((act, aIdx) => (
                                          <span
                                            key={aIdx}
                                            className="rounded-full bg-white border border-gray-200 px-2.5 py-0.5 text-[11px] text-gray-700"
                                          >
                                            • {act}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">
                          Day 1: Arrival &amp; Check-in. Guided sight tours and evening celebration.<br />
                          Day 2: Morning expedition, leisure time, and return transfer.
                        </p>
                      )}
                    </div>
                  )}

                  {/* 3. STAY & MEAL (from Screenshot 4) */}
                  {activeTab === 'stay' && (
                    <div>
                      <h3 className="text-base font-bold text-gray-900 mb-4">Stay &amp; Meal</h3>
                      <div className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 shadow-xs">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-[#FFA300]" />
                          <span className="text-sm font-bold text-gray-900">
                            {trip.destination}
                          </span>
                        </div>

                        <div className="flex items-center gap-4 text-xs text-gray-600">
                          <span className="flex items-center gap-1 font-semibold">
                            {nightsCount} Night{nightsCount !== 1 ? 's' : ''}
                          </span>
                          <span className="flex items-center gap-1 font-semibold">
                            <Home className="h-3.5 w-3.5 text-gray-400" /> Luxury Cabin / Hotel
                          </span>
                          <span className="flex items-center gap-1 font-semibold">
                            <Utensils className="h-3.5 w-3.5 text-gray-400" /> Room only &amp; Refreshments
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 4. INCLUSIONS & EXCLUSIONS (from Screenshot 4) */}
                  {activeTab === 'inclusions' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Inclusions */}
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-3 flex items-center gap-1">
                          Inclusions
                        </h4>
                        <ul className="space-y-2.5">
                          {(trip.inclusions && trip.inclusions.length > 0
                            ? trip.inclusions
                            : ['Water And Soft Drinks', 'Decoration', 'Music', 'Tour Captain', 'Safety Life Jackets']
                          ).map((item, i) => (
                            <li key={i} className="flex items-center gap-2.5 text-xs sm:text-sm text-gray-800">
                              <span className="h-4 w-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-black shrink-0">
                                ✓
                              </span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Exclusions */}
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-rose-600 mb-3 flex items-center gap-1">
                          Exclusions
                        </h4>
                        <ul className="space-y-2.5">
                          {(trip.exclusions && trip.exclusions.length > 0
                            ? trip.exclusions
                            : ['Food & Alcohol', 'Customized Birthday Cake', 'Personal Expenses', 'Flight/Train tickets']
                          ).map((item, i) => (
                            <li key={i} className="flex items-center gap-2.5 text-xs sm:text-sm text-gray-600">
                              <span className="h-4 w-4 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-[10px] font-black shrink-0">
                                ✕
                              </span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* 5. PAYMENT POLICY (from Screenshot 5) */}
                  {activeTab === 'payment' && (
                    <div className="space-y-4 text-xs sm:text-sm text-gray-600 leading-relaxed">
                      <div>
                        <p className="font-bold text-gray-900 uppercase tracking-wide">
                          TOURSONGO – PAYMENT POLICY
                        </p>
                        <p className="text-[11px] text-gray-400 mt-0.5">Last Updated: 31 October 2026</p>
                      </div>

                      <p>
                        At Toursongo, we provide secure and transparent payment options for domestic travel bookings.
                      </p>

                      <div>
                        <p className="font-bold text-gray-900 mb-1">1. BOOKING CONFIRMATION</p>
                        <p>
                          A minimum advance payment of 30% of the total package amount is generally required to confirm a booking. The exact advance amount may vary depending on the destination, hotel, resort, and travel dates.
                        </p>
                      </div>

                      <div>
                        <p className="font-bold text-gray-900 mb-1">2. BALANCE PAYMENT</p>
                        <p>
                          The remaining balance must be paid at least 7 days before departure unless otherwise specified in the booking confirmation.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* 6. CANCELLATION & REFUND POLICY */}
                  {activeTab === 'cancellation' && (
                    <div className="space-y-4 text-xs sm:text-sm text-gray-600 leading-relaxed">
                      <p className="font-bold text-gray-900 uppercase tracking-wide">
                        CANCELLATION &amp; REFUND POLICY
                      </p>
                      <p>{trip.cancellationPolicy || 'Free cancellation up to 7 days before departure.'}</p>
                      <div className="space-y-2 rounded-2xl bg-amber-50/60 p-4 border border-amber-200/50">
                        <p className="font-bold text-gray-900 text-xs">Standard Cancellation Timeline:</p>
                        <ul className="space-y-1 text-xs text-gray-700 list-disc pl-4">
                          <li>Cancellation 15+ days prior: 90% refund</li>
                          <li>Cancellation 7–14 days prior: 50% refund</li>
                          <li>Cancellation within 7 days: Non-refundable</li>
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ── RIGHT COLUMN: STICKY BOOKING SIDEBAR ────────────────── */}
            <aside className="w-full lg:w-96 shrink-0 space-y-4 lg:sticky lg:top-24">
              {/* Box 1: Starting Price Banner (from Screenshot 2, 3, 4) */}
              <div className="rounded-3xl border border-gray-100 bg-white overflow-hidden shadow-sm">
                {/* Mountain Graphic Top Header */}
                <div className="relative p-5 bg-gradient-to-br from-amber-50/80 via-orange-50/40 to-teal-50/40 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-black uppercase tracking-wider text-gray-500 flex items-center gap-1">
                      Starting From <Info className="h-3 w-3 text-gray-400" />
                    </p>
                    <span className="rounded-full bg-white/90 border border-gray-200/80 px-2.5 py-0.5 text-[10px] font-bold text-gray-700">
                      📅 {nightsCount}N/{durationDays}D
                    </span>
                  </div>

                  <div className="mt-2 flex items-baseline gap-1.5">
                    <span className="text-3xl font-black text-gray-900">
                      {formatCurrency(effectivePrice)}
                    </span>
                    <span className="text-xs font-semibold text-gray-500">/ Per Person</span>
                  </div>

                  <p className="text-xs text-gray-500 mt-1">
                    {trip.destination} ({nightsCount}N)
                  </p>
                </div>

                {/* Box 2: HOSTED BY Card (from Screenshot 3, 4) */}
                <div className="p-5 border-b border-gray-100">
                  <p className="text-[10px] font-black uppercase tracking-wider text-blue-600 mb-3">
                    Hosted By
                  </p>

                  <div className="flex items-start gap-3">
                    {/* Palm Tree Curator Logo */}
                    <div className="h-12 w-12 rounded-full overflow-hidden bg-gradient-to-tr from-amber-200 to-teal-200 border-2 border-white shadow-sm flex items-center justify-center shrink-0">
                      <span className="text-2xl select-none">🌴</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <p className="text-sm font-black text-gray-900 truncate">Toursongo</p>
                        <ShieldCheck className="h-4 w-4 text-blue-500 shrink-0" />
                      </div>
                      <p className="text-[11px] font-bold text-emerald-600">
                        Verified Partner ✓
                      </p>
                      <p className="text-[11px] text-gray-400 truncate mt-0.5">
                        📍 Travel Curator · {trip.destination || 'Mumbai, Maharashtra'}
                      </p>

                      {/* Verified Badges */}
                      <div className="flex items-center gap-2 mt-2">
                        <span className="rounded-md border border-amber-300/80 bg-amber-50/50 px-2 py-0.5 text-[9px] font-bold text-gray-700">
                          Aadhaar Verified
                        </span>
                        <span className="rounded-md border border-amber-300/80 bg-amber-50/50 px-2 py-0.5 text-[9px] font-bold text-gray-700">
                          PAN Verified
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Two Buttons: View Profile & Compare */}
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    <button
                      type="button"
                      onClick={() => alert('Curator Profile: Toursongo is an authentic verified partner on TernoTrip.')}
                      className="rounded-xl border border-blue-400 py-1.5 text-xs font-bold text-blue-600 hover:bg-blue-50 transition-colors flex items-center justify-center gap-1"
                    >
                      <Eye className="h-3 w-3" /> View Profile
                    </button>
                    <button
                      type="button"
                      onClick={() => router.push('/trips')}
                      className="rounded-xl bg-[#FFA300] py-1.5 text-xs font-bold text-gray-950 hover:brightness-105 transition-colors shadow-xs"
                    >
                      Compare
                    </button>
                  </div>

                  {/* Big Golden Contact Curator Button */}
                  <button
                    type="button"
                    onClick={() => setShowContactModal(true)}
                    className="w-full mt-3 rounded-xl bg-gradient-to-r from-[#FFA300] to-[#FF6B00] py-2.5 text-xs font-extrabold text-white shadow-md hover:brightness-105 transition-all flex items-center justify-center gap-1.5"
                  >
                    <MessageCircle className="h-4 w-4" /> Contact Curator &gt;
                  </button>
                </div>

                {/* Box 3: PRICE PACKAGES Summary (from Screenshot 3, 4) */}
                <div className="p-5 border-b border-gray-100 bg-gray-50/40">
                  <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">
                    Price Packages
                  </p>
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-gray-900">Standard</p>
                      <p className="text-[10px] text-gray-400">Starting from</p>
                    </div>
                    <p className="font-black text-sm text-gray-900">
                      {formatCurrency(effectivePrice)}
                    </p>
                  </div>
                </div>

                {/* Box 4: TRIP DATES & BOOKING FORM */}
                <div className="p-5">
                  <p className="text-xs font-bold text-gray-900 mb-1">Trip Dates</p>
                  <p className="text-[11px] text-gray-400 leading-snug mb-3">
                    Flexible dates — book anytime, then coordinate the exact dates directly with the curator/agency.
                  </p>

                  {/* Date Selector */}
                  <div className="mb-3">
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">
                      Select Departure Date
                    </label>
                    <select
                      value={selectedDate}
                      onChange={(e) => {
                        const newDate = e.target.value;
                        setSelectedDate(newDate);
                        if (newDate) {
                          const availableSeats = getSeatsForDate(newDate);
                          if (travellers > availableSeats && availableSeats > 0) {
                            setTravellers(Math.min(availableSeats, trip.maxGroupSize));
                          }
                        }
                      }}
                      className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-800 focus:border-[#FFA300] focus:outline-none focus:ring-1 focus:ring-[#FFA300]"
                    >
                      <option value="">Select a date</option>
                      {(trip.startDates ?? []).map((d) => {
                        const seatsForDate = getSeatsForDate(d);
                        const isSoldOutDate = seatsForDate === 0;
                        return (
                          <option
                            key={d}
                            value={d}
                            disabled={isSoldOutDate}
                            className={isSoldOutDate ? 'text-gray-400' : ''}
                          >
                            {formatDate(d)} {isSoldOutDate ? '— Sold out' : `(${seatsForDate} seats left)`}
                          </option>
                        );
                      })}
                    </select>

                    {/* Stock status indicator */}
                    {isSoldOut && (
                      <p className="mt-1 text-[11px] font-bold text-red-600">
                        Sold out for this date — please select another date
                      </p>
                    )}
                    {isLowStock && (
                      <p className="mt-1 text-[11px] font-bold text-orange-600">
                        🔥 Only {seats} seat{seats !== 1 ? 's' : ''} left!
                      </p>
                    )}
                    {!isSoldOut && !isLowStock && selectedDate && (
                      <p className="mt-1 text-[11px] font-bold text-emerald-600">
                        ✓ {seats} seats available
                      </p>
                    )}
                  </div>

                  {/* Travellers Counter */}
                  <div className="mb-4">
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">
                      No. of Travellers
                    </label>
                    <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-3 py-1.5">
                      <button
                        type="button"
                        onClick={() => setTravellers(Math.max(1, travellers - 1))}
                        disabled={travellers <= 1}
                        className="h-7 w-7 rounded-lg border border-gray-200 flex items-center justify-center text-sm font-bold text-gray-600 hover:bg-gray-100 disabled:opacity-40"
                      >
                        −
                      </button>
                      <span className="text-xs font-black text-gray-900">
                        {travellers} Traveller{travellers !== 1 ? 's' : ''}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const availableSeats = getSeatsForDate(selectedDate);
                          const maxAllowed = Math.min(trip.maxGroupSize, availableSeats);
                          setTravellers(Math.min(maxAllowed, travellers + 1));
                        }}
                        disabled={!selectedDate || travellers >= Math.min(trip.maxGroupSize, getSeatsForDate(selectedDate))}
                        className="h-7 w-7 rounded-lg border border-gray-200 flex items-center justify-center text-sm font-bold text-gray-600 hover:bg-gray-100 disabled:opacity-40"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Price Calculation Box */}
                  <div className="mb-4 rounded-2xl bg-gray-50 p-3 space-y-1.5 text-xs">
                    <div className="flex justify-between text-gray-500">
                      <span>{formatCurrency(effectivePrice)} × {travellers}</span>
                      <span>{formatCurrency(effectivePrice * travellers)}</span>
                    </div>
                    <div className="flex justify-between text-gray-500">
                      <span>Taxes &amp; Fees (5%)</span>
                      <span>{formatCurrency(taxes)}</span>
                    </div>
                    <div className="flex justify-between border-t border-gray-200 pt-1.5 font-black text-gray-900 text-sm">
                      <span>Total Amount</span>
                      <span className="text-[#FF6B00]">{formatCurrency(total)}</span>
                    </div>
                  </div>

                  {/* Big Book Now Button */}
                  <button
                    type="button"
                    onClick={handleBookNow}
                    disabled={
                      isSoldOut ||
                      !selectedDate ||
                      travellers > getSeatsForDate(selectedDate) ||
                      travellers > trip.maxGroupSize
                    }
                    className="w-full rounded-full py-3 text-center text-sm font-black text-gray-950 shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-105"
                    style={{ backgroundColor: '#FFA300' }}
                  >
                    Book Now
                  </button>
                  <p className="mt-2 text-center text-[10px] text-gray-400">
                    No charges until confirmation step
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </div>

        {/* Mobile Sticky Booking Bar */}
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white p-3.5 shadow-2xl lg:hidden flex items-center justify-between">
          <div>
            <div className="text-lg font-black text-[#FF6B00]">{formatCurrency(total)}</div>
            <div className="text-[10px] text-gray-400">for {travellers} person{travellers !== 1 ? 's' : ''}</div>
          </div>
          <button
            type="button"
            onClick={handleBookNow}
            disabled={isSoldOut || !selectedDate || travellers > getSeatsForDate(selectedDate) || travellers > trip.maxGroupSize}
            className="rounded-full bg-[#FFA300] px-6 py-2.5 text-xs font-black text-gray-950 shadow-md disabled:opacity-50"
          >
            Book Now
          </button>
        </div>

        {/* Curator Contact Modal */}
        {showContactModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
              <button
                type="button"
                onClick={() => setShowContactModal(false)}
                className="absolute top-4 right-4 h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200"
              >
                ✕
              </button>

              <div className="text-center mb-4">
                <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center text-2xl mx-auto mb-2">
                  🌴
                </div>
                <h3 className="text-base font-bold text-gray-900">Contact Toursongo</h3>
                <p className="text-xs text-gray-500">Verified Travel Curator for {trip.destination}</p>
              </div>

              <div className="space-y-3 mb-4">
                <input
                  type="text"
                  placeholder="Your Name"
                  className="w-full rounded-xl border border-gray-200 p-2.5 text-xs text-gray-800 focus:outline-none focus:border-[#FFA300]"
                />
                <input
                  type="text"
                  placeholder="Phone Number / WhatsApp"
                  className="w-full rounded-xl border border-gray-200 p-2.5 text-xs text-gray-800 focus:outline-none focus:border-[#FFA300]"
                />
                <textarea
                  rows={3}
                  placeholder={`Hi, I'm interested in "${trip.title}". Can you share more details?`}
                  className="w-full rounded-xl border border-gray-200 p-2.5 text-xs text-gray-800 focus:outline-none focus:border-[#FFA300]"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  alert('Inquiry sent to curator! They will contact you shortly on WhatsApp.');
                  setShowContactModal(false);
                }}
                className="w-full rounded-full bg-[#FFA300] py-2.5 text-xs font-black text-gray-950 shadow-md hover:brightness-105"
              >
                Send Inquiry
              </button>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
