'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import PageLayout from '@/components/layout/PageLayout';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import apiClient from '@/lib/api-client';

// ─── Profile Schema ───────────────────────────────────────────────────────────
const profileSchema = z.object({
  firstName: z.string().min(2, 'At least 2 characters'),
  lastName: z.string().min(2, 'At least 2 characters'),
  phone: z.string().optional(),
  nationality: z.string().optional(),
});
type ProfileForm = z.infer<typeof profileSchema>;

// ─── Password Schema ──────────────────────────────────────────────────────────
const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
  .refine((d) => d.currentPassword !== d.newPassword, {
    message: 'New password must differ from current password',
    path: ['newPassword'],
  });
type PasswordForm = z.infer<typeof passwordSchema>;

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}

function ProfileContent() {
  const { user, refetch } = useAuth();

  // Profile form state
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  // Password form state
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // ── Profile form ──────────────────────────────────────────────────────────
  const {
    register: regProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors, isSubmitting: profileSubmitting },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName ?? '',
      lastName: user?.lastName ?? '',
    },
  });

  const onProfileSubmit = async (data: ProfileForm) => {
    setProfileSuccess('');
    setProfileError('');
    try {
      // User-service stores a single "name" field
      await apiClient.put('/api/v1/users/profile', {
        name: `${data.firstName} ${data.lastName}`.trim(),
        phone: data.phone,
        nationality: data.nationality,
      });
      refetch();
      setProfileSuccess('Profile updated successfully!');
    } catch {
      setProfileError('Failed to update profile. Please try again.');
    }
  };

  // ── Password form ─────────────────────────────────────────────────────────
  const {
    register: regPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors, isSubmitting: passwordSubmitting },
  } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  const onPasswordSubmit = async (data: PasswordForm) => {
    setPasswordSuccess('');
    setPasswordError('');
    try {
      await apiClient.patch('/api/v1/auth/change-password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      resetPasswordForm();
      setPasswordSuccess(
        'Password changed! You have been logged out of all other devices.'
      );
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? 'Failed to change password. Please try again.';
      setPasswordError(msg);
    }
  };

  return (
    <PageLayout>
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Profile & Settings</h1>

        {/* ── Avatar ─────────────────────────────────────────────────────── */}
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FF6B00] text-white text-2xl font-bold select-none">
            {user?.firstName?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <div>
            <p className="font-semibold text-gray-900">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
        </div>

        {/* ── Personal Information ────────────────────────────────────────── */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-semibold text-gray-900">Personal Information</h2>

          <form
            onSubmit={handleProfileSubmit(onProfileSubmit)}
            noValidate
            className="space-y-4"
          >
            {profileSuccess && (
              <div className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700 border border-green-200">
                ✓ {profileSuccess}
              </div>
            )}
            {profileError && (
              <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-200">
                {profileError}
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="First Name"
                error={profileErrors.firstName?.message}
                {...regProfile('firstName')}
              />
              <Input
                label="Last Name"
                error={profileErrors.lastName?.message}
                {...regProfile('lastName')}
              />
            </div>

            <Input
              label="Email"
              type="email"
              value={user?.email ?? ''}
              disabled
              hint="Email cannot be changed"
            />

            <Input
              label="Phone Number"
              type="tel"
              placeholder="+91 98765 43210"
              {...regProfile('phone')}
            />

            <Input
              label="Nationality"
              placeholder="Indian"
              {...regProfile('nationality')}
            />

            <Button
              type="submit"
              variant="primary"
              loading={profileSubmitting}
              className="mt-2"
            >
              Save Changes
            </Button>
          </form>
        </div>

        {/* ── Security — Password Change ──────────────────────────────────── */}
        <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="mb-1 font-semibold text-gray-900">Security</h2>
          <p className="mb-5 text-sm text-gray-500">
            Change your password. You will be logged out of all other devices.
          </p>

          <form
            onSubmit={handlePasswordSubmit(onPasswordSubmit)}
            noValidate
            className="space-y-4"
          >
            {passwordSuccess && (
              <div className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700 border border-green-200">
                ✓ {passwordSuccess}
              </div>
            )}
            {passwordError && (
              <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-200">
                {passwordError}
              </div>
            )}

            <Input
              label="Current Password"
              type="password"
              placeholder="Enter your current password"
              error={passwordErrors.currentPassword?.message}
              required
              {...regPassword('currentPassword')}
            />

            <Input
              label="New Password"
              type="password"
              placeholder="Min. 8 characters"
              error={passwordErrors.newPassword?.message}
              required
              hint="Must be at least 8 characters and different from current password"
              {...regPassword('newPassword')}
            />

            <Input
              label="Confirm New Password"
              type="password"
              placeholder="Repeat your new password"
              error={passwordErrors.confirmPassword?.message}
              required
              {...regPassword('confirmPassword')}
            />

            <Button
              type="submit"
              variant="secondary"
              loading={passwordSubmitting}
            >
              Change Password
            </Button>
          </form>
        </div>

        {/* ── Danger Zone ─────────────────────────────────────────────────── */}
        <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 p-6">
          <h2 className="mb-1 font-semibold text-red-800">Account</h2>
          <p className="mb-4 text-sm text-red-600">
            Need to delete your account? Contact our support team.
          </p>
          <a
            href="mailto:support@terno.in"
            className="text-sm font-medium text-red-700 underline hover:text-red-900"
          >
            Contact support →
          </a>
        </div>
      </div>
    </PageLayout>
  );
}
