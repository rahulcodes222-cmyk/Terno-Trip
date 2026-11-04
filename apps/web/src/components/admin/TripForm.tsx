'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { Plus, X } from 'lucide-react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import ItineraryEditor from './ItineraryEditor';
import apiClient from '@/lib/api-client';
import type { ITrip, ITripItineraryDay } from '@/types';

// ─── Master type ──────────────────────────────────────────────────────────────
interface IMaster { _id: string; name: string; email: string; }

// ─── Zod schema ───────────────────────────────────────────────────────────────
const itineraryDaySchema = z.object({
  day: z.number().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  activities: z.array(z.string()),
  accommodation: z.string().optional(),
});

const tripFormSchema = z.object({
  // ... existing fields ...

  title:              z.string().min(3, 'Title must be at least 3 characters'),
  slug:               z.string().optional().or(z.literal('')),
  destination:        z.string().min(1, 'Destination is required'),
  country:            z.string().default('India'),
  description:        z.string().min(20, 'Description must be at least 20 characters'),
  shortDescription:   z.string().min(10, 'Short description must be at least 10 characters'),
  category:           z.enum(['Adventure', 'Beach', 'Cultural', 'Wildlife', 'City', 'Mountain', 'Budget']),
  duration:           z.coerce.number().min(1),
  nights:             z.coerce.number().min(0),
  maxGroupSize:       z.coerce.number().min(1),
  pricePerPerson:     z.coerce.number().min(1),
  discountPrice:      z.coerce.number().optional(),
  availableSeats:     z.coerce.number().min(0),
  difficulty:         z.enum(['Easy', 'Moderate', 'Challenging']),
  departureTime:      z.string().regex(/^\d{2}:\d{2}$/, 'Must be HH:MM format (24-hour)').default('06:00'),
  coverImage:         z.string().url('Must be a valid URL'),
  images:           z.string().optional(),
  inclusions:         z.string(),
  exclusions:         z.string(),
  highlights:         z.string(),
  itinerary:          z.array(itineraryDaySchema).optional().default([]),
  accommodationType:  z.string().min(1, 'Required'),
  cancellationPolicy: z.string().min(5, 'Required'),
  masterId:           z.string().optional().or(z.literal('')),
  isActive:           z.boolean().default(true),
  isFeatured:         z.boolean().default(false),
  startDates: z.string().refine(
    (val) => {
      if (!val.trim()) return true;
      return val.split(',').map(s => s.trim()).filter(Boolean)
        .every(token => !isNaN(new Date(token).getTime()));
    },
    { message: 'Each date must be valid (e.g. 2025-01-15)' }
  ),
});

export type TripFormData = z.infer<typeof tripFormSchema> & { itinerary: ITripItineraryDay[] };

// ─── Props ────────────────────────────────────────────────────────────────────
interface TripFormProps {
  defaultValues?: Partial<ITrip> & { masterId?: string };
  onSubmit: (data: Partial<ITrip> & { masterId?: string }) => Promise<void>;
  isSubmitting: boolean;
  submitLabel: string;
  serverError?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const arrToLines = (arr?: string[]) => arr?.join('\n') ?? '';

// Convert startDates array → comma-separated YYYY-MM-DD strings for the textarea
const datesToCsv = (dates?: string[]) => {
  if (!dates?.length) return '';
  return dates.map(d => {
    try { return new Date(d).toISOString().split('T')[0]; }
    catch { return d; }
  }).join(', ');
};

// ─── ImageUrlManager ─────────────────────────────────────────────────────────
// Lets admin paste one URL → click Add → see thumbnail preview → remove if needed

interface ImageUrlManagerProps {
  defaultImages?: string[];
  onChange: (urls: string[]) => void;
}

function ImageUrlManager({ defaultImages = [], onChange }: ImageUrlManagerProps) {
  const [urls, setUrls]     = useState<string[]>(defaultImages);
  const [input, setInput]   = useState('');
  const [error, setError]   = useState('');

  // keep parent in sync
  useEffect(() => { onChange(urls); }, [urls, onChange]);

  // sync if defaultImages changes (edit page load) — update urls array completely
  useEffect(() => {
    setUrls(defaultImages);
  }, [defaultImages]);

  const handleAdd = () => {
    const trimmed = input.trim();
    if (!trimmed) { setError('Please enter a URL'); return; }
    try { new URL(trimmed); } catch {
      setError('Please enter a valid URL (starting with https://)'); return;
    }
    if (urls.includes(trimmed)) { setError('This URL is already added'); return; }
    setUrls((prev) => [...prev, trimmed]);
    setInput('');
    setError('');
  };

  const handleRemove = (idx: number) => {
    setUrls((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { e.preventDefault(); handleAdd(); }
  };

  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">
        Trip Images
        <span className="ml-1 text-xs font-normal text-gray-400">(optional — shown in gallery)</span>
      </label>

      {/* URL input + Add button */}
      <div className="flex gap-2">
        <input
          type="url"
          value={input}
          onChange={(e) => { setInput(e.target.value); setError(''); }}
          onKeyDown={handleKeyDown}
          placeholder="https://images.unsplash.com/photo-xxx?w=800"
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#FF6B00] focus:outline-none focus:ring-1 focus:ring-[#FF6B00]"
        />
        <button
          type="button"
          onClick={handleAdd}
          className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors"
          style={{ backgroundColor: '#FF6B00' }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#E65100')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FF6B00')}
        >
          <Plus className="h-4 w-4" /> Add
        </button>
      </div>

      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      {!error && <p className="mt-1 text-xs text-gray-400">Paste a URL and click Add. Press Enter to add quickly.</p>}

      {/* Added images list with thumbnails */}
      {urls.length > 0 && (
        <div className="mt-3 space-y-2">
          {urls.map((url, idx) => (
            <div key={idx} className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-2">
              {/* Thumbnail */}
              <img
                src={url}
                alt={`Image ${idx + 1}`}
                className="h-14 w-20 shrink-0 rounded-lg object-cover"
                onError={(e) => { (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/error/80/56'; }}
              />
              {/* URL text */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-600">Image {idx + 1}</p>
                <p className="truncate text-xs text-gray-400">{url}</p>
              </div>
              {/* Remove */}
              <button
                type="button"
                onClick={() => handleRemove(idx)}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-red-200 bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                title="Remove image"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          <p className="text-xs text-gray-400">{urls.length} image{urls.length !== 1 ? 's' : ''} added</p>
        </div>
      )}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function TripForm({
  defaultValues,
  onSubmit,
  isSubmitting,
  submitLabel,
  serverError,
}: TripFormProps) {

  // ── Fetch masters from API ──────────────────────────────────────────────────
  const { data: mastersData } = useQuery<IMaster[]>({
    queryKey: ['auth', 'masters'],
    queryFn: async () => {
      const res = await apiClient.get<{ success: boolean; data: { masters: IMaster[] } }>(
        '/api/v1/auth/masters'
      );
      return res.data.data?.masters ?? [];
    },
    staleTime: 5 * 60_000,
  });
  const masters = mastersData ?? [];

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors },
  } = useForm<TripFormData>({
    resolver: zodResolver(tripFormSchema),
    defaultValues: {
      title:             defaultValues?.title             ?? '',
      slug:              defaultValues?.slug              ?? '',
      destination:       defaultValues?.destination       ?? '',
      country:           defaultValues?.country           ?? 'India',
      description:       defaultValues?.description       ?? '',
      shortDescription:  defaultValues?.shortDescription  ?? '',
      category:          defaultValues?.category          ?? 'Adventure',
      duration:          defaultValues?.duration          ?? 1,
      nights:            defaultValues?.nights            ?? 0,
      maxGroupSize:      defaultValues?.maxGroupSize      ?? 10,
      pricePerPerson:    defaultValues?.pricePerPerson    ?? 1000,
      discountPrice:     defaultValues?.discountPrice,
      availableSeats:    defaultValues?.availableSeats    ?? 0,
      difficulty:        defaultValues?.difficulty        ?? 'Easy',
      departureTime:     defaultValues?.departureTime     ?? '06:00',
      coverImage:        defaultValues?.coverImage        ?? '',
      images:           arrToLines(defaultValues?.images),
      inclusions:        arrToLines(defaultValues?.inclusions),
      exclusions:        arrToLines(defaultValues?.exclusions),
      highlights:        arrToLines(defaultValues?.highlights),
      itinerary:         defaultValues?.itinerary         ?? [],
      cancellationPolicy:defaultValues?.cancellationPolicy ?? '',
      accommodationType: (defaultValues as Record<string,unknown>)?.accommodationType as string ?? 'Hotel',
      masterId:          defaultValues?.masterId           ?? '',
      isActive:          defaultValues?.isActive           ?? true,
      isFeatured:        defaultValues?.isFeatured         ?? false,
      startDates:        datesToCsv(defaultValues?.startDates),
    },
  });

  // If defaultValues change (edit page loads data), reset form
  useEffect(() => {
    if (!defaultValues?.title) return;
    setValue('title',             defaultValues.title             ?? '');
    setValue('slug',              defaultValues.slug              ?? '');
    setValue('destination',       defaultValues.destination       ?? '');
    setValue('country',           defaultValues.country           ?? 'India');
    setValue('description',       defaultValues.description       ?? '');
    setValue('shortDescription',  defaultValues.shortDescription  ?? '');
    setValue('category',          defaultValues.category          ?? 'Adventure');
    setValue('duration',          defaultValues.duration          ?? 1);
    setValue('nights',            defaultValues.nights            ?? 0);
    setValue('maxGroupSize',      defaultValues.maxGroupSize      ?? 10);
    setValue('pricePerPerson',    defaultValues.pricePerPerson    ?? 1000);
    setValue('discountPrice',     defaultValues.discountPrice);
    setValue('availableSeats',    defaultValues.availableSeats    ?? 0);
    setValue('difficulty',        defaultValues.difficulty        ?? 'Easy');
    setValue('departureTime',     defaultValues.departureTime     ?? '06:00');
    setValue('coverImage',        defaultValues.coverImage        ?? '');
    setValue('images',           arrToLines(defaultValues?.images));
    setValue('inclusions',        arrToLines(defaultValues.inclusions));
    setValue('exclusions',        arrToLines(defaultValues.exclusions));
    setValue('highlights',        arrToLines(defaultValues.highlights));
    setValue('itinerary',         defaultValues.itinerary         ?? []);
    setValue('cancellationPolicy',defaultValues.cancellationPolicy ?? '');
    setValue('accommodationType', (defaultValues as Record<string,unknown>)?.accommodationType as string ?? 'Hotel');
    setValue('masterId',          defaultValues.masterId          ?? '');
    setValue('isActive',          defaultValues.isActive          ?? true);
    setValue('isFeatured',        defaultValues.isFeatured        ?? false);
    setValue('startDates',        datesToCsv(defaultValues.startDates));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValues?.title]);

  // Auto-generate slug
  const titleValue = watch('title');
  const handleTitleBlur = () => {
    const cur = watch('slug');
    if (!cur) setValue('slug', titleValue.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''));
  };

  const handleFormSubmit = async (data: TripFormData) => {
    const inclusions  = data.inclusions.split('\n').map(s=>s.trim()).filter(Boolean);
    const exclusions  = data.exclusions.split('\n').map(s=>s.trim()).filter(Boolean);
    const highlights  = data.highlights.split('\n').map(s=>s.trim()).filter(Boolean);
    const startDates  = data.startDates.split(',').map(s=>s.trim()).filter(Boolean);
    const images      = data.images?.split('\n').map(s=>s.trim()).filter(Boolean);
    const slug = data.slug || data.title.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');

    // Validate price
    const price = Number(data.pricePerPerson);
    if (!price || price <= 0) {
      setError('pricePerPerson', { message: 'Price must be greater than 0' });
      return;
    }

    await onSubmit({ 
      ...data, 
      pricePerPerson: price,
      slug, 
      inclusions, 
      exclusions, 
      highlights, 
      startDates, 
      images, 
      itinerary: data.itinerary ?? []
    });
  };


  const textareaClass = 'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent resize-y min-h-[80px]';
  const selectClass   = 'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent';
  const labelClass    = 'mb-1 block text-sm font-medium text-gray-700';

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} noValidate className="space-y-6">
      {serverError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{serverError}</div>
      )}

      {/* ── Title + Slug ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input label="Title" required error={errors.title?.message}
          {...register('title')} onBlur={handleTitleBlur} />
        <Input label="Slug (auto-generated)" placeholder="leave blank to auto-generate"
          error={errors.slug?.message} {...register('slug')} />
      </div>

      {/* ── Destination + Country ────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input label="Destination" required error={errors.destination?.message} {...register('destination')} />
        <Input label="Country" error={errors.country?.message} {...register('country')} />
      </div>

      {/* ── Category + Difficulty ────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Category <span className="text-red-500">*</span></label>
          <select className={selectClass} {...register('category')}>
            {['Adventure','Beach','Cultural','Wildlife','City','Mountain','Budget'].map(c=>(
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Difficulty <span className="text-red-500">*</span></label>
          <select className={selectClass} {...register('difficulty')}>
            {['Easy','Moderate','Challenging'].map(d=>(
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Duration + Nights ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input label="Duration (days)" type="number" min={1} required error={errors.duration?.message} {...register('duration')} />
        <Input label="Nights" type="number" min={0} required error={errors.nights?.message} {...register('nights')} />
      </div>

      {/* ── Group size + Seats ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input label="Max Group Size" type="number" min={1} required error={errors.maxGroupSize?.message} {...register('maxGroupSize')} />
        <Input label="Available Seats" type="number" min={0} required error={errors.availableSeats?.message} {...register('availableSeats')} />
      </div>

      {/* ── Price + Discount ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input label="Price Per Person (₹)" type="number" min={1} required error={errors.pricePerPerson?.message} {...register('pricePerPerson')} />
        <Input label="Discount Price (₹) — optional" type="number" min={0} error={errors.discountPrice?.message} {...register('discountPrice')} />
      </div>

      {/* ── Departure Time ──────────────────────────────────────────── */}
      <div>
        <label className={labelClass}>
          Departure Time
          <span className="ml-1 text-xs font-normal text-gray-400">(24-hour format)</span>
        </label>
        <input
          type="time"
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent"
          {...register('departureTime')}
        />
        {errors.departureTime && <p className="mt-1 text-xs text-red-600">{errors.departureTime.message}</p>}
      </div>

      {/* ── Cover Image ──────────────────────────────────────────────── */}
      <Input label="Cover Image URL" type="url" placeholder="https://..." required
        error={errors.coverImage?.message} {...register('coverImage')} />

      {/* ── Short Description ────────────────────────────────────────── */}
      <div>
        <label className={labelClass}>Short Description <span className="text-red-500">*</span></label>
        <textarea className={textareaClass} placeholder="Brief summary shown on cards..." {...register('shortDescription')} />
        {errors.shortDescription && <p className="mt-1 text-xs text-red-600">{errors.shortDescription.message}</p>}
      </div>

      {/* ── Full Description ─────────────────────────────────────────── */}
      <div>
        <label className={labelClass}>Full Description <span className="text-red-500">*</span></label>
        <textarea className={`${textareaClass} min-h-[120px]`} placeholder="Detailed trip description..." {...register('description')} />
        {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description.message}</p>}
      </div>

      {/* ── Highlights ───────────────────────────────────────────────── */}
      <div>
        <label className={labelClass}>Highlights</label>
        <textarea className={textareaClass} placeholder="One highlight per line..." {...register('highlights')} />
        <p className="mt-1 text-xs text-gray-400">One item per line. Example: Day 3 (16 Nov, 2:30 PM) — Trek to Kedarnath</p>
      </div>

      {/* ── Itinerary Editor ─────────────────────────────────────────── */}
      <ItineraryEditor
        defaultDays={defaultValues?.itinerary ?? []}
        onChange={(days) => setValue('itinerary', days)}
      />
      <div>
        <label className={labelClass}>Inclusions</label>
        <textarea className={textareaClass} placeholder="One inclusion per line..." {...register('inclusions')} />
        <p className="mt-1 text-xs text-gray-400">One item per line</p>
      </div>

      {/* ── Exclusions ───────────────────────────────────────────────── */}
      <div>
        <label className={labelClass}>Exclusions</label>
        <textarea className={textareaClass} placeholder="One exclusion per line..." {...register('exclusions')} />
        <p className="mt-1 text-xs text-gray-400">One item per line</p>
      </div>

      {/* ── Cancellation Policy ──────────────────────────────────────── */}
      <div>
        <label className={labelClass}>Cancellation Policy <span className="text-red-500">*</span></label>
        <textarea className={textareaClass} placeholder="Describe the cancellation/refund policy..." {...register('cancellationPolicy')} />
        {errors.cancellationPolicy && <p className="mt-1 text-xs text-red-600">{errors.cancellationPolicy.message}</p>}
      </div>
      {/* ── Images (URL input + Add button + preview list) ────────── */}
      <ImageUrlManager
        defaultImages={defaultValues?.images ?? []}
        onChange={(urls) => setValue('images', urls.join('\n'))}
      />

      {/* ── Accommodation Type ───────────────────────────────────────── */}
      <Input label="Accommodation Type" placeholder="e.g. Hotel, Homestay, Tent, Resort" required
        error={(errors as Record<string,{message?:string}>).accommodationType?.message}
        {...register('accommodationType')} />

      {/* ── Start Dates ──────────────────────────────────────────────── */}
      <div>
        <label className={labelClass}>Start Dates</label>
        <textarea className={textareaClass} placeholder="2025-01-15, 2025-02-10, 2025-03-05" {...register('startDates')} />
        {errors.startDates
          ? <p className="mt-1 text-xs text-red-600">{errors.startDates.message}</p>
          : <p className="mt-1 text-xs text-gray-400">Comma-separated dates: YYYY-MM-DD</p>
        }
      </div>

      {/* ── Master Dropdown ──────────────────────────────────────────── */}
      <div>
        <label className={labelClass}>
          Assign Bus Master
          <span className="ml-1 text-xs font-normal text-gray-400">(optional)</span>
        </label>
        <select className={selectClass} {...register('masterId')}>
          <option value="">— No master assigned —</option>
          {masters.length === 0 ? (
            <option disabled>No masters found (create master accounts first)</option>
          ) : (
            masters.map((m) => (
              <option key={m._id} value={m._id}>
                {m.name} ({m.email})
              </option>
            ))
          )}
        </select>
        <p className="mt-1 text-xs text-gray-400">
          The assigned master can update live trip status from Master Dashboard.
        </p>
      </div>

      {/* ── Active + Featured + Submit ───────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-6 border-t pt-5">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" className="h-4 w-4 accent-[#FF6B00]" {...register('isActive')} />
          Active (visible to users)
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" className="h-4 w-4 accent-[#FF6B00]" {...register('isFeatured')} />
          Featured on homepage
        </label>
        <div className="ml-auto">
          <Button type="submit" variant="primary" loading={isSubmitting} size="lg">
            {submitLabel}
          </Button>
        </div>
      </div>
    </form>
  );
}
