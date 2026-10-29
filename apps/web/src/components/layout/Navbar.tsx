'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell, Menu, X, User, LogOut, Briefcase, ChevronDown, LayoutDashboard } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useUnreadCount } from '@/hooks/useNotifications';

const NAV_LINKS = [
  { href: '/#upcoming',     label: 'Upcoming Trips' },
  { href: '/#destinations', label: 'Destinations' },
  { href: '/#completed',    label: 'Completed' },
  { href: '/#reviews',      label: 'Reviews' },
  { href: '/#blog',         label: 'Blog' },
];

/* ── Logo component ─────────────────────────────────────────────────────── */
function TernoLogo() {
  return (
    <Link href="/" className="flex items-center gap-0 shrink-0">
      {/* Bird SVG — no box, no border, just the bird floating freely like demo */}
      <img
        src="/images/logo.jpeg"
        alt="TernoTrip"
        width={52}
        height={44}
        className="object-contain"
        style={{ display: 'block' }}
      />
      {/* "Terno" navy + "Trip" orange — tight to the bird */}
      <span className="text-xl font-extrabold leading-none tracking-tight -ml-1">
        <span style={{ color: '#1B2E6B' }}>Terno</span>
        <span style={{ color: '#FF4500' }}>Trip</span>
      </span>
    </Link>
  );
}

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
    /* WHITE navbar — exactly like screenshot */
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="mx-auto flex h-14 max-w-container items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* ── Logo ─────────────────────────────────────────────── */}
        <TernoLogo />

        {/* ── Desktop Nav (center) ─────────────────────────────── */}
        <nav className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-gray-600 hover:text-[#FF6B00] transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* ── Right side ───────────────────────────────────────── */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <>
              {/* Notification bell */}
              <Link
                href="/notifications"
                className="relative p-2 text-gray-500 hover:text-[#FF6B00] rounded-full hover:bg-orange-50"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>

              {/* User dropdown */}
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 rounded-full border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-100 text-[#FF6B00] text-xs font-bold">
                    {user?.firstName?.[0]?.toUpperCase() ?? 'U'}
                  </div>
                  <span className="max-w-[100px] truncate">{user?.firstName}</span>
                  <ChevronDown className="h-3 w-3" />
                </button>

                {dropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                    <div className="absolute right-0 top-full z-20 mt-2 w-48 rounded-xl border border-gray-100 bg-white py-1 shadow-lg">
                      <Link href="/bookings" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        <Briefcase className="h-4 w-4" /> My Bookings
                      </Link>
                      <Link href="/profile" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        <User className="h-4 w-4" /> Profile
                      </Link>
                      {user?.role === 'admin' && (
                        <Link href="/admin" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-[#1B2E6B] hover:bg-blue-50">
                          <LayoutDashboard className="h-4 w-4" /> Admin Dashboard
                        </Link>
                      )}
                      <hr className="my-1 border-gray-100" />
                      <button onClick={handleLogout} className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                        <LogOut className="h-4 w-4" /> Logout
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            /* Guest — show Login link */
            <Link
              href="/auth/login"
              className="text-sm font-medium text-gray-600 hover:text-[#FF6B00] transition-colors"
            >
              Log In
            </Link>
          )}

          {/* Orange "Book Now" button — exact style from screenshot */}
          <Link
            href="/trips"
            className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-bold text-white transition-colors"
            style={{ backgroundColor: '#FF6B00' }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#E65100')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FF6B00')}
          >
            🚌 Book Now
          </Link>
        </div>

        {/* ── Mobile hamburger ─────────────────────────────────── */}
        <button
          className="md:hidden rounded-md p-2 text-gray-600 hover:bg-gray-100"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* ── Mobile menu ──────────────────────────────────────────── */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3">
          <nav className="flex flex-col gap-1 mb-3">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-orange-50 hover:text-[#FF6B00]"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <hr className="mb-3 border-gray-100" />

          {isAuthenticated ? (
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700">
                <div className="h-7 w-7 rounded-full bg-orange-100 flex items-center justify-center text-[#FF6B00] text-xs font-bold">
                  {user?.firstName?.[0]?.toUpperCase()}
                </div>
                {user?.firstName} {user?.lastName}
              </div>
              <Link href="/bookings" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50">My Bookings</Link>
              <Link href="/notifications" onClick={() => setMobileOpen(false)} className="flex justify-between rounded-lg px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                Notifications {unreadCount > 0 && <span className="rounded-full bg-red-500 px-1.5 text-[10px] text-white">{unreadCount}</span>}
              </Link>
              <Link href="/profile" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50">Profile</Link>
              {user?.role === 'admin' && (
                <Link href="/admin" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold text-[#1B2E6B] hover:bg-blue-50">
                  <LayoutDashboard className="h-4 w-4" /> Admin Dashboard
                </Link>
              )}
              <button onClick={async () => { await handleLogout(); setMobileOpen(false); }} className="rounded-lg px-3 py-2.5 text-left text-sm text-red-600 hover:bg-red-50">Logout</button>
            </div>
          ) : (
            /* Guest mobile — show login link */
            <Link
              href="/auth/login"
              onClick={() => setMobileOpen(false)}
              className="rounded-lg border border-gray-200 px-3 py-2.5 text-center text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Log In
            </Link>
          )}

          <Link
            href="/trips"
            onClick={() => setMobileOpen(false)}
            className="mt-2 flex items-center justify-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-bold text-white"
            style={{ backgroundColor: '#FF6B00' }}
          >
            🚌 Book Now
          </Link>
        </div>
      )}
    </header>
  );
}
