'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell, Menu, X, User, LogOut, Briefcase, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useUnreadCount } from '@/hooks/useNotifications';

const navLinks = [
  { href: '/#upcoming',      label: 'Upcoming Trips' },
  { href: '/#destinations',  label: 'Destinations' },
  { href: '/#completed',     label: 'Completed' },
  { href: '/#reviews',       label: 'Reviews' },
  { href: '/#blog',          label: 'Blog' },
];

export default function Navbar() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const { data: unreadCount = 0 } = useUnreadCount();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setDropdownOpen(false);
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-[#0A0A0A]">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white font-bold text-sm">
            T
          </div>
          <span className="text-xl font-bold text-white">TernoTrip</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-white/80 hover:text-primary transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Right */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <>
              {/* Notifications Bell */}
              <Link
                href="/notifications"
                className="relative p-2 text-white/70 hover:text-white rounded-full hover:bg-white/10"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>

              {/* User Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 rounded-full border border-white/20 px-3 py-1.5 text-sm font-medium text-white hover:bg-white/10"
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-100 text-primary-700 text-xs font-bold">
                    {user?.firstName?.[0]?.toUpperCase() ?? 'U'}
                  </div>
                  <span className="max-w-[100px] truncate">{user?.firstName}</span>
                  <ChevronDown className="h-3 w-3" />
                </button>

                {dropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setDropdownOpen(false)}
                    />
                    <div className="absolute right-0 top-full z-20 mt-2 w-48 rounded-xl border border-gray-100 bg-white py-1 shadow-lg">
                      <Link
                        href="/bookings"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <Briefcase className="h-4 w-4" /> My Bookings
                      </Link>
                      <Link
                        href="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <User className="h-4 w-4" /> Profile
                      </Link>
                      <hr className="my-1 border-gray-100" />
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="h-4 w-4" /> Logout
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Book Now CTA */}
              <Link
                href="/trips"
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-600 transition-colors"
              >
                📞 Book Now
              </Link>
            </>
          ) : (
            <Link
              href="/trips"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-600 transition-colors"
            >
              📞 Book Now
            </Link>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden rounded-md p-2 text-white hover:bg-white/10"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-[#0A0A0A] border-t border-white/10 px-4 py-4">
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <hr className="my-3 border-white/10" />

          {isAuthenticated ? (
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white">
                <div className="h-7 w-7 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-xs font-bold">
                  {user?.firstName?.[0]?.toUpperCase()}
                </div>
                {user?.firstName} {user?.lastName}
              </div>
              <Link href="/bookings" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2.5 text-sm text-white/80 hover:bg-white/10">
                My Bookings
              </Link>
              <Link href="/notifications" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2.5 text-sm text-white/80 hover:bg-white/10 flex justify-between">
                Notifications
                {unreadCount > 0 && <span className="rounded-full bg-red-500 px-1.5 text-[10px] text-white">{unreadCount}</span>}
              </Link>
              <Link href="/profile" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2.5 text-sm text-white/80 hover:bg-white/10">
                Profile
              </Link>
              <button
                onClick={async () => { await handleLogout(); setMobileOpen(false); }}
                className="rounded-lg px-3 py-2.5 text-left text-sm text-red-400 hover:bg-white/10"
              >
                Logout
              </button>
              <Link
                href="/trips"
                onClick={() => setMobileOpen(false)}
                className="mt-2 rounded-lg bg-primary px-4 py-2.5 text-center text-sm font-semibold text-white"
              >
                📞 Book Now
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Link
                href="/trips"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg bg-primary px-4 py-2.5 text-center text-sm font-semibold text-white"
              >
                📞 Book Now
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
