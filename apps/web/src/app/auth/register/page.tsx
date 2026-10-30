'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { getBookingIntent, clearBookingIntent } from '@/lib/session-storage';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

const registerSchema = z
  .object({
    firstName: z.string().min(2, 'At least 2 characters'),
    lastName: z.string().min(2, 'At least 2 characters'),
    email: z.string().email('Please enter a valid email'),
    password: z.string().min(8, 'At least 8 characters'),
    confirmPassword: z.string(),
    terms: z.boolean().refine((v) => v, 'You must accept the terms'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { register: authRegister } = useAuth();
  const [serverError, setServerError] = useState('');
  const returnUrl = searchParams.get('returnUrl') ?? '/';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (data: RegisterForm) => {
    setServerError('');
    try {
      await authRegister({ firstName: data.firstName, lastName: data.lastName, email: data.email, password: data.password });
      const intent = getBookingIntent();
      if (intent) {
        clearBookingIntent();
        router.push(`/checkout?tripSlug=${intent.tripSlug}&date=${intent.departureDate}&travellers=${intent.travellersCount}`);
        return;
      }
      router.push(returnUrl);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Registration failed. Please try again.';
      setServerError(message);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left — branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center bg-[#0A0A0A] px-12">
        <Link href="/" className="mb-12 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FF6B00] text-white font-bold">T</div>
          <span className="text-2xl font-bold text-white">TernoTrip</span>
        </Link>
        <h2 className="mb-4 text-4xl font-extrabold text-white leading-tight">
          Start your India<br />
          <span className="text-[#FF6B00]">Journey today</span>
        </h2>
        <p className="mb-8 text-gray-400">
          Join thousands of travellers who explore Incredible India with TernoTrip.
        </p>
        <div className="space-y-3 text-sm text-gray-400">
          {['Curated trips across 25+ destinations', 'Fixed departure dates, guaranteed departures', 'Small groups of 8–16 travellers', '24/7 support throughout your journey'].map((f) => (
            <div key={f} className="flex items-center gap-2">
              <span className="text-[#FF6B00] font-bold">✓</span> {f}
            </div>
          ))}
        </div>
      </div>

      {/* Right — form */}
      <div className="flex w-full flex-col items-center justify-center bg-white px-6 py-12 lg:w-1/2">
        <Link href="/" className="mb-6 flex items-center gap-2 lg:hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FF6B00] text-white font-bold text-sm">T</div>
          <span className="text-xl font-bold text-gray-900">TernoTrip</span>
        </Link>

        <div className="w-full max-w-md">
          <h1 className="mb-1 text-2xl font-extrabold text-gray-900">Create account</h1>
          <p className="mb-8 text-sm text-gray-500">
            Already have an account?{' '}
            <Link href={`/auth/login?returnUrl=${encodeURIComponent(returnUrl)}`} className="font-medium text-[#FF6B00] hover:underline">
              Sign in
            </Link>
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            {serverError && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {serverError}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <Input label="First Name" placeholder="Rahul" error={errors.firstName?.message} required {...register('firstName')} />
              <Input label="Last Name" placeholder="Sharma" error={errors.lastName?.message} required {...register('lastName')} />
            </div>
            <Input label="Email" type="email" placeholder="you@example.com" error={errors.email?.message} required {...register('email')} />
            <Input label="Password" type="password" placeholder="Min. 8 characters" error={errors.password?.message} required {...register('password')} />
            <Input label="Confirm Password" type="password" placeholder="Repeat password" error={errors.confirmPassword?.message} required {...register('confirmPassword')} />

            <label className="flex items-start gap-2 cursor-pointer text-sm">
              <input type="checkbox" className="mt-0.5 accent-[#FF6B00]" {...register('terms')} />
              <span className="text-gray-600">
                I agree to the <span className="text-[#FF6B00]">Terms of Service</span> and <span className="text-[#FF6B00]">Privacy Policy</span>
              </span>
            </label>
            {errors.terms && <p className="text-xs text-red-600">{errors.terms.message}</p>}

            <Button type="submit" variant="primary" size="lg" loading={isSubmitting} className="w-full">
              Create Account
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
