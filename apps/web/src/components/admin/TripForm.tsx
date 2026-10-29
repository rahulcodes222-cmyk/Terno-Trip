'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import type { ITrip } from '@/types';

// ─── Zod schema ───────────────────────────────────────────────────────────────
const tripFormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  slug: z.string().min(3, 'Slug must be at least 3 characters').optional().or(z.literal('')),
  destination: z.string().min(1, 'Destination is required'),
  country: z.string().default('India'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  shortDescription: z.string().min(10, 'Short description must be at least 10 characters'),
  category: z.enum(['Adventure', 'Beach', 'Cultural', 'Wildlife', 'City', 'Mountain', 'Budget']),
  duration: z.coerce.number().min(1, 'Duration must be at least 1 day'),
  nights: z.coerce.number().min(0, 'Nights cannot be negative'),
  maxGroupSize: z.coerce.number().min(1, 'Max group size must be at least 1'),
  pricePerPerson: z.coerce.number().min(1, 'Price must be at least 1'),
  discountPrice: z.coerce.number().optional(),
  availableSeats: z.coerce.number().min(0, 'Available seats cannot be negative'),
  difficulty: z.enum(['Easy', 'Moderate', 'Challenging']),
  coverImage: z.string().url('Must be a valid URL'),
  inclusions: z.string(),
  exclusions: z.string(),
  highlights: z.string(),
  cancellationPolicy: z.string().min(5, 'Cancellation policy must be at least 5 characters'),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  startDates: z.string(),
});

export type TripFormData = z.infer<typeof tripFormSchema>;

// ─── Props ────────────────────────────────────────────────────────────────────
interface TripFormProps {
  defaultValues?: Partial<ITrip>;
  onSubmit: (data: Partial<ITrip>) => Promise<void>;
  isSubmitting: boolean;
  submitLabel: string;
  serverError?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function arrToLines(arr?: string[]): string {
  return arr?.join('\n') ?? '';
}

function arrToCsv(arr?: string[]): string {
  return arr?.join(', ') ?? '';
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function TripForm({
  defaultValues,
  onSubmit,
  isSubmitting,
  submitLabel,
  serverError,
}: TripFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TripFormData>({
    resolver: zodResolver(tripFormSchema),
    defaultValues: {
      title: defaultValues?.title ?? '',
      slug: defaultValues?.slug ?? '',
      destination: defaultValues?.destination ?? '',
      country: defaultValues?.country ?? 'India',
      description: defaultValues?.description ?? '',
      shortDescription: defaultValues?.shortDescription ?? '',
      category: defaultValues?.category ?? 'Adventure',
      duration: defaultValues?.duration ?? 1,
      nights: defaultValues?.nights ?? 0,
      maxGroupSize: defaultValues?.maxGroupSize ?? 10,
      pricePerPerson: defaultValues?.pricePerPerson ?? 1000,
      discountPrice: defaultValues?.discountPrice,
      availableSeats: defaultValues?.availableSeats ?? 0,
      difficulty: defaultValues?.difficulty ?? 'Easy',
      coverImage: defaultValues?.coverImage ?? '',
      inclusions: arrToLines(defaultValues?.inclusions),
      exclusions: arrToLines(defaultValues?.exclusions),
      highlights: arrToLines(defaultValues?.highlights),
      cancellationPolicy: defaultValues?.cancellationPolicy ?? '',
      isActive: defaultValues?.isActive ?? true,
      isFeatured: defaultValues?.isFeatured ?? false,
      startDates: arrToCsv(defaultValues?.startDates),
    },
  });

  // Auto-generate slug from title
  const titleValue = watch('title');
  const handleTitleBlur = () => {
    const currentSlug = watch('slug');
    if (!currentSlug) {
      const generated = titleValue
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setValue('slug', generated);
    }
  };

  const handleFormSubmit = async (data: TripFormData) => {
    // Convert textarea strings back to arrays
    const inclusions = data.inclusions
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    const exclusions = data.exclusions
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    const highlights = data.highlights
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    const startDates = data.startDates
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    // Auto-generate slug if empty
    const slug =
      data.slug ||
      data.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

    await onSubmit({
      ...data,
      slug,
      inclusions,
      exclusions,
      highlights,
      startDates,
    });
  };

  const textareaClass =
    'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent resize-y min-h-[80px]';

  const selectClass =
    'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent';

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} noValidate className="space-y-6">
      {serverError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {serverError}
        </div>
      )}

      {/* Row: title + slug */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Title"
          required
          error={errors.title?.message}
          {...register('title')}
          onBlur={handleTitleBlur}
        />
        <Input
          label="Slug"
          placeholder="auto-generated from title"
          error={errors.slug?.message}
          {...register('slug')}
        />
      </div>

      {/* Row: destination + country */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Destination"
          required
          error={errors.destination?.message}
          {...register('destination')}
        />
        <Input
          label="Country"
          error={errors.country?.message}
          {...register('country')}
        />
      </div>

      {/* Row: category + difficulty */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Category <span className="text-red-500">*</span>
          </label>
          <select className={selectClass} {...register('category')}>
            {['Adventure', 'Beach', 'Cultural', 'Wildlife', 'City', 'Mountain', 'Budget'].map(
              (c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              )
            )}
          </select>
          {errors.category && (
            <p className="mt-1 text-xs text-red-600">{errors.category.message}</p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Difficulty <span className="text-red-500">*</span>
          </label>
          <select className={selectClass} {...register('difficulty')}>
            {['Easy', 'Moderate', 'Challenging'].map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          {errors.difficulty && (
            <p className="mt-1 text-xs text-red-600">{errors.difficulty.message}</p>
          )}
        </div>
      </div>

      {/* Row: duration + nights */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Duration (days)"
          type="number"
          min={1}
          required
          error={errors.duration?.message}
          {...register('duration')}
        />
        <Input
          label="Nights"
          type="number"
          min={0}
          required
          error={errors.nights?.message}
          {...register('nights')}
        />
      </div>

      {/* Row: maxGroupSize + availableSeats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Max Group Size"
          type="number"
          min={1}
          required
          error={errors.maxGroupSize?.message}
          {...register('maxGroupSize')}
        />
        <Input
          label="Available Seats"
          type="number"
          min={0}
          required
          error={errors.availableSeats?.message}
          {...register('availableSeats')}
        />
      </div>

      {/* Row: pricePerPerson + discountPrice */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Price Per Person (₹)"
          type="number"
          min={1}
          required
          error={errors.pricePerPerson?.message}
          {...register('pricePerPerson')}
        />
        <Input
          label="Discount Price (₹)"
          type="number"
          min={0}
          error={errors.discountPrice?.message}
          {...register('discountPrice')}
        />
      </div>

      {/* Cover image */}
      <Input
        label="Cover Image URL"
        type="url"
        placeholder="https://..."
        required
        error={errors.coverImage?.message}
        {...register('coverImage')}
      />

      {/* Short description */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Short Description <span className="text-red-500">*</span>
        </label>
        <textarea
          className={textareaClass}
          placeholder="Brief summary shown on cards..."
          {...register('shortDescription')}
        />
        {errors.shortDescription && (
          <p className="mt-1 text-xs text-red-600">{errors.shortDescription.message}</p>
        )}
      </div>

      {/* Full description */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          className={`${textareaClass} min-h-[120px]`}
          placeholder="Full trip description..."
          {...register('description')}
        />
        {errors.description && (
          <p className="mt-1 text-xs text-red-600">{errors.description.message}</p>
        )}
      </div>

      {/* Highlights */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Highlights</label>
        <textarea
          className={textareaClass}
          placeholder="One highlight per line..."
          {...register('highlights')}
        />
        <p className="mt-1 text-xs text-gray-500">One item per line</p>
      </div>

      {/* Inclusions */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Inclusions</label>
        <textarea
          className={textareaClass}
          placeholder="One inclusion per line..."
          {...register('inclusions')}
        />
        <p className="mt-1 text-xs text-gray-500">One item per line</p>
      </div>

      {/* Exclusions */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Exclusions</label>
        <textarea
          className={textareaClass}
          placeholder="One exclusion per line..."
          {...register('exclusions')}
        />
        <p className="mt-1 text-xs text-gray-500">One item per line</p>
      </div>

      {/* Cancellation policy */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Cancellation Policy <span className="text-red-500">*</span>
        </label>
        <textarea
          className={textareaClass}
          placeholder="Describe the cancellation and refund policy..."
          {...register('cancellationPolicy')}
        />
        {errors.cancellationPolicy && (
          <p className="mt-1 text-xs text-red-600">{errors.cancellationPolicy.message}</p>
        )}
      </div>

      {/* Start dates */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Start Dates</label>
        <textarea
          className={textareaClass}
          placeholder="2025-01-15, 2025-02-10, 2025-03-05"
          {...register('startDates')}
        />
        <p className="mt-1 text-xs text-gray-500">Comma-separated ISO date strings</p>
      </div>

      {/* Checkboxes + submit */}
      <div className="flex flex-wrap items-center gap-6 pt-2">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 text-[#FF6B00] focus:ring-[#FF6B00]"
            {...register('isActive')}
          />
          Active (visible to users)
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 text-[#FF6B00] focus:ring-[#FF6B00]"
            {...register('isFeatured')}
          />
          Featured
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
