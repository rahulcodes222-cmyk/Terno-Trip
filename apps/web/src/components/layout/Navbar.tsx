'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Bell, Menu, X, User, LogOut, Briefcase, ChevronDown, LayoutDashboard, Heart } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useUnreadCount } from '@/hooks/useNotifications';
import SiteLogo from '@/components/ui/SiteLogo';

const NAV_LINKS = [
  { href: '/#how-it-works', label: 'How it works?' },
  { href: '/#about',        label: 'About' },
  { href: '/#help',         label: 'Help' },
];

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  const { data: unreadCount = 0 } = useUnreadCount();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const isHome = pathname === '/';

  const handleLogout = async () => {
    await logout();
    setDropdownOpen(false);
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-[#14181F]/90 backdrop-blur-md border-b border-white/10 text-white transition-all">
      <div className="mx-auto flex h-16 max-w-container items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* ── Logo ─────────────────────────────────────────────── */}
        <div className="flex items-center gap-8">
          <SiteLogo size="md" dark />
        </div>

        {/* ── Desktop Nav (center) ─────────────────────────────── */}
        <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-gray-300">
          <Link
            href="/#how-it-works"
            className="flex items-center gap-1 hover:text-white transition-colors"
          >
            How it works? <ChevronDown className="h-3 w-3 opacity-70" />
          </Link>
          <Link href="/#about" className="hover:text-white transition-colors">
            About
          </Link>
          <Link href="/#help" className="hover:text-white transition-colors">
            Help
          </Link>
          <Link href="/trips" className="flex items-center gap-1.5 hover:text-[#FFA300] transition-colors">
            <Heart className="h-4 w-4 text-[#FFA300]" />
            Wishlist
          </Link>
        </nav>

        {/* ── Right side ───────────────────────────────────────── */}
        <div className="hidden md:flex items-center gap-3">
          {/* Become a Partner button */}
          <Link
            href="/#partner"
            className="rounded-full bg-[#1F242D] hover:bg-[#2A313D] border border-white/15 px-4 py-2 text-xs font-semibold text-white transition-colors"
          >
            Become a Partner
          </Link>

          {isAuthenticated ? (
            <>
              {/* Notification bell */}
              <Link
                href="/notifications"
                className="relative p-2 text-gray-300 hover:text-[#FFA300] rounded-full hover:bg-white/10 transition-colors"
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
                  className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-white/15 transition-colors"
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#FFA300] text-gray-950 text-xs font-bold">
                    {user?.firstName?.[0]?.toUpperCase() ?? 'U'}
                  </div>
                  <span className="max-w-[100px] truncate">{user?.firstName || user?.email?.split('@')[0]}</span>
                  <ChevronDown className="h-3 w-3 opacity-70" />
                </button>

                {dropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                    <div className="absolute right-0 top-full z-20 mt-2 w-52 rounded-2xl border border-gray-100 bg-white py-1.5 shadow-xl text-gray-800">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-xs font-bold text-gray-900 truncate">{user?.firstName} {user?.lastName}</p>
                        <p className="text-[11px] text-gray-400 truncate">{user?.email}</p>
                      </div>
                      <Link href="/bookings" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-gray-700 hover:bg-gray-50">
                        <Briefcase className="h-4 w-4 text-[#FFA300]" /> My Bookings
                      </Link>
                      <Link href="/profile" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-gray-700 hover:bg-gray-50">
                        <User className="h-4 w-4 text-gray-400" /> Profile
                      </Link>
                      {user?.role === 'admin' && (
                        <Link href="/admin" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-blue-600 hover:bg-blue-50">
                          <LayoutDashboard className="h-4 w-4" /> Admin Dashboard
                        </Link>
                      )}
                      <hr className="my-1 border-gray-100" />
                      <button onClick={handleLogout} className="flex w-full items-center gap-2 px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50">
                        <LogOut className="h-4 w-4" /> Logout
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            /* Guest — Golden Login as Traveler button from screenshot */
            <Link
              href="/auth/login"
              className="flex items-center gap-1.5 rounded-full px-5 py-2 text-xs font-extrabold text-gray-950 transition-all shadow-sm hover:brightness-105 active:scale-95"
              style={{ backgroundColor: '#FFA300' }}
            >
              Login as Traveler
            </Link>
          )}
        </div>

        {/* ── Mobile Right Actions (Avatar + Golden Hamburger from Screenshot) ── */}
        <div className="flex md:hidden items-center gap-2.5">
          {/* User Initial Circle (Pink from mobile screenshot) */}
          <Link
            href={isAuthenticated ? "/profile" : "/auth/login"}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F472B6] text-white text-xs font-bold shadow-sm select-none"
            aria-label="Account"
          >
            {user?.firstName?.[0]?.toUpperCase() || 'R'}
          </Link>

          {/* Golden Hamburger Button */}
          <button
            className="flex h-8 w-8 items-center justify-center rounded-xl text-gray-950 shadow-sm transition-transform active:scale-90"
            style={{ backgroundColor: '#FFA300' }}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* ── Mobile menu ──────────────────────────────────────────── */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-white/10 bg-[#14181F] px-4 py-4 text-white">
          <nav className="flex flex-col gap-2 mb-4">
            <Link href="/#how-it-works" onClick={() => setMobileOpen(false)} className="py-2 text-sm text-gray-200">
              How it works?
            </Link>
            <Link href="/#about" onClick={() => setMobileOpen(false)} className="py-2 text-sm text-gray-200">
              About
            </Link>
            <Link href="/#help" onClick={() => setMobileOpen(false)} className="py-2 text-sm text-gray-200">
              Help
            </Link>
            <Link href="/trips" onClick={() => setMobileOpen(false)} className="py-2 text-sm text-[#FFA300] flex items-center gap-2">
              <Heart className="h-4 w-4" /> Wishlist
            </Link>
          </nav>
          <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
            <Link
              href="/#partner"
              onClick={() => setMobileOpen(false)}
              className="w-full text-center rounded-full bg-[#1F242D] border border-white/15 px-4 py-2.5 text-xs font-semibold"
            >
              Become a Partner
            </Link>
            {isAuthenticated ? (
              <>
                <Link
                  href="/bookings"
                  onClick={() => setMobileOpen(false)}
                  className="w-full text-center rounded-full bg-white/10 px-4 py-2.5 text-xs font-semibold"
                >
                  My Bookings
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-center rounded-full bg-red-600/20 text-red-400 px-4 py-2 text-xs font-semibold"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                href="/auth/login"
                onClick={() => setMobileOpen(false)}
                className="w-full text-center rounded-full bg-[#FFA300] text-gray-950 px-4 py-2.5 text-xs font-bold"
              >
                Login as Traveler
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

