'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import apiClient from '@/lib/api-client';
import type { ITrip } from '@/types';

// ─── Master type ──────────────────────────────────────────────────────────────
interface IMaster { _id: string; name: string; email: string; }

// ─── Zod schema ───────────────────────────────────────────────────────────────
const tripFormSchema = z.object({
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
  coverImage:         z.string().url('Must be a valid URL'),
  inclusions:         z.string(),
  exclusions:         z.string(),
  highlights:         z.string(),
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

export type TripFormData = z.infer<typeof tripFormSchema>;

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
      coverImage:        defaultValues?.coverImage        ?? '',
      inclusions:        arrToLines(defaultValues?.inclusions),
      exclusions:        arrToLines(defaultValues?.exclusions),
      highlights:        arrToLines(defaultValues?.highlights),
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
    setValue('coverImage',        defaultValues.coverImage        ?? '');
    setValue('inclusions',        arrToLines(defaultValues.inclusions));
    setValue('exclusions',        arrToLines(defaultValues.exclusions));
    setValue('highlights',        arrToLines(defaultValues.highlights));
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
    const slug = data.slug || data.title.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');

    await onSubmit({ ...data, slug, inclusions, exclusions, highlights, startDates });
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
        <p className="mt-1 text-xs text-gray-400">One item per line</p>
      </div>

      {/* ── Inclusions ───────────────────────────────────────────────── */}
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
