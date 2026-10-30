'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { LayoutDashboard, MapPin, Briefcase, Bus, Home, LogOut, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/trips', label: 'Trips', icon: MapPin },
  { href: '/admin/master',   label: 'Master Dashboard', icon: Bus         },
  { href: '/admin/bookings', label: 'Bookings',         icon: Briefcase   },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || (user?.role !== 'admin' && user?.role !== 'master'))) {
      router.replace('/auth/login?returnUrl=/admin');
    }
    // Masters can only access /admin/master — redirect them if they try other pages
    if (!isLoading && isAuthenticated && user?.role === 'master') {
      const allowedPaths = ['/admin/master'];
      if (!allowedPaths.some(p => pathname.startsWith(p))) {
        router.replace('/admin/master');
      }
    }
  }, [isLoading, isAuthenticated, user, router, pathname]);

  if (isLoading) {
    return <LoadingSpinner fullPage />;
  }

  if (!isAuthenticated || (user?.role !== 'admin' && user?.role !== 'master')) {
    return null;
  }

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-30 flex w-60 flex-col bg-[#1B2E6B] text-white transition-transform duration-200 md:static md:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="flex h-14 items-center gap-2 px-4 shrink-0">
          <img
            src="/images/logo.svg"
            alt="TernoTrip"
            width={40}
            height={32}
            className="object-contain"
          />
          <span className="text-lg font-extrabold leading-none tracking-tight">
            <span className="text-white">Terno</span>
            <span style={{ color: '#FF6B00' }}>Trip</span>
          </span>
        </div>

        {/* Nav items — admins see all, masters see only Master Dashboard */}
        <nav className="flex-1 overflow-y-auto py-4">
          {NAV_ITEMS
            .filter(item => user?.role === 'master' ? item.href === '/admin/master' : true)
            .map(({ href, label, icon: Icon }) => {
            const isActive = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors hover:bg-white/10',
                  isActive
                    ? 'border-l-4 border-[#FF6B00] bg-white/10 text-white'
                    : 'border-l-4 border-transparent text-white/70'
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* User info + logout */}
        <div className="border-t border-white/10 px-4 py-3 shrink-0 space-y-1">
          {/* Back to site */}
          <Link
            href="/"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/60 transition-colors hover:bg-white/10 hover:text-white"
          >
            <Home className="h-4 w-4" />
            Back to Site
          </Link>
          <div className="px-3 py-1 truncate text-xs font-medium text-white/50">
            {(user as unknown as { name?: string })?.name ?? user?.firstName ?? 'Admin'}
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile top bar */}
        <header className="flex h-14 items-center gap-3 border-b border-gray-200 bg-white px-4 md:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-md p-1.5 text-gray-600 hover:bg-gray-100"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="text-base font-semibold text-[#1B2E6B]">Admin</span>
        </header>

        <main className="flex-1 overflow-y-auto bg-[#F5F7FA]">{children}</main>
      </div>
    </div>
  );
}
