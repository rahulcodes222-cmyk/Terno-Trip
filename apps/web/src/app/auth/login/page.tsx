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

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});
type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [serverError, setServerError] = useState('');
  const returnUrl = searchParams.get('returnUrl') ?? '/';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginForm) => {
    setServerError('');
    try {
      await login(data.email, data.password);

      // Booking intent — restore trip booking flow
      const intent = getBookingIntent();
      if (intent) {
        clearBookingIntent();
        router.push(`/checkout?tripSlug=${intent.tripSlug}&date=${intent.departureDate}&travellers=${intent.travellersCount}`);
        return;
      }

      // Role-based redirect after login
      // We read the user from AuthContext after invalidation — use a small delay
      // Instead, check the returnUrl or role from the fresh /me call
      // The AuthContext already refetches after login — we get role from URL or default
      if (returnUrl && returnUrl !== '/') {
        router.push(returnUrl);
        return;
      }

      // Fetch user role to decide where to redirect
      const { data: meRes } = await import('@/lib/api-client').then(m =>
        m.default.get('/api/v1/auth/me')
      );
      const role = meRes?.data?.user?.role ?? meRes?.data?.role ?? 'user';

      if (role === 'admin') {
        router.push('/admin');
      } else if (role === 'master') {
        router.push('/admin/master');
      } else {
        router.push('/');
      }
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Invalid email or password.';
      setServerError(message);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left — branding panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center bg-[#0A0A0A] px-12">
        <Link href="/" className="mb-12 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FF6B00] text-white font-bold">
            T
          </div>
          <span className="text-2xl font-bold text-white">TernoTrip</span>
        </Link>
        <h2 className="mb-4 text-4xl font-extrabold text-white leading-tight">
          Your Next Adventure<br />
          <span className="text-[#FF6B00]">Awaits</span>
        </h2>
        <p className="text-gray-400">
          Sign in to access your bookings, manage trips, and discover new destinations across India.
        </p>
        {/* decorative images */}
        <div className="mt-10 grid grid-cols-2 gap-3 opacity-60">
          <img src="https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=400" alt="Manali" className="rounded-xl h-28 w-full object-cover" />
          <img src="https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=400" alt="Goa" className="rounded-xl h-28 w-full object-cover" />
        </div>
      </div>

      {/* Right — form panel */}
      <div className="flex w-full flex-col items-center justify-center bg-white px-6 py-12 lg:w-1/2">
        {/* Mobile logo */}
        <Link href="/" className="mb-8 flex items-center gap-2 lg:hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FF6B00] text-white font-bold text-sm">T</div>
          <span className="text-xl font-bold text-gray-900">TernoTrip</span>
        </Link>

        <div className="w-full max-w-md">
          <h1 className="mb-1 text-2xl font-extrabold text-gray-900">Welcome back</h1>
          <p className="mb-8 text-sm text-gray-500">
            Don&apos;t have an account?{' '}
            <Link href={`/auth/register?returnUrl=${encodeURIComponent(returnUrl)}`} className="font-medium text-[#FF6B00] hover:underline">
              Sign up free
            </Link>
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            {serverError && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {serverError}
              </div>
            )}

            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              required
              {...register('email')}
            />
            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              error={errors.password?.message}
              required
              {...register('password')}
            />

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer text-gray-600">
                <input type="checkbox" className="accent-[#FF6B00]" />
                Remember me
              </label>
              <span className="text-gray-400 cursor-not-allowed">Forgot password?</span>
            </div>

            <Button type="submit" variant="primary" size="lg" loading={isSubmitting} className="w-full">
              Sign In
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
