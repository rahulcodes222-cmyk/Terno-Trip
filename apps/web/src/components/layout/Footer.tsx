'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import SiteLogo from '@/components/ui/SiteLogo';

export default function Footer() {
  const [email, setEmail]         = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) { setSubmitted(true); setEmail(''); }
  };

  return (
    <footer>
      {/* ── Newsletter band ──────────────────────────────────────────── */}
      <div className="bg-[#0A1628] py-12">
        <div className="mx-auto max-w-xl px-4 text-center sm:px-6">
          <p className="mb-1 text-xs font-bold uppercase tracking-widest text-[#FF6B00]">Stay in the loop</p>
          <h2 className="mb-2 text-2xl font-extrabold text-white">
            Get exclusive India travel deals
          </h2>
          <p className="mb-6 text-sm text-gray-400">
            Early-bird offers, trip stories, and travel tips — straight to your inbox.
          </p>

          {submitted ? (
            <p className="inline-block rounded-xl bg-[#FF6B00]/20 border border-[#FF6B00]/30 px-6 py-3 text-sm font-medium text-[#FF6B00]">
              You&apos;re on the list! Deals coming soon. 🎉
            </p>
          ) : (
            <form onSubmit={handleSubscribe} className="flex flex-col gap-3 sm:flex-row">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="flex-1 rounded-xl bg-white/10 border border-white/20 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-[#FF6B00] focus:outline-none focus:ring-1 focus:ring-[#FF6B00]"
              />
              <button
                type="submit"
                className="rounded-xl bg-[#FF6B00] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#E65100] transition-colors whitespace-nowrap"
              >
                Notify Me
              </button>
            </form>
          )}
        </div>
      </div>

      {/* ── Main footer ──────────────────────────────────────────────── */}
      <div className="bg-[#0D1B2A] py-12">
        <div className="mx-auto max-w-container px-4 sm:px-6">
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {/* Brand */}
            <div className="col-span-2 sm:col-span-1">
              <SiteLogo size="sm" dark className="mb-3" />
              <p className="text-sm text-gray-500 leading-relaxed">
                India&apos;s favourite small-group tour company. Authentic, curated, unforgettable.
              </p>
            </div>

            {/* Explore */}
            <div>
              <h4 className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">Explore</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><Link href="/#upcoming"     className="hover:text-[#FF6B00]">Upcoming Trips</Link></li>
                <li><Link href="/#destinations" className="hover:text-[#FF6B00]">Destinations</Link></li>
                <li><Link href="/#completed"    className="hover:text-[#FF6B00]">Completed Trips</Link></li>
                <li><Link href="/#reviews"      className="hover:text-[#FF6B00]">Reviews</Link></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">Company</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><span className="cursor-default">About Us</span></li>
                <li><span className="cursor-default">Careers</span></li>
                <li><span className="cursor-default">Blog</span></li>
                <li><span className="cursor-default">Contact</span></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">Support</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><span className="cursor-default">Help Centre</span></li>
                <li><span className="cursor-default">Cancellation Policy</span></li>
                <li><Link href="/terms" className="hover:text-[#FF6B00]">Terms of Service</Link></li>
                <li><Link href="/privacy" className="hover:text-[#FF6B00]">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-10 border-t border-white/10 pt-6 text-center text-xs text-gray-600">
            © {new Date().getFullYear()} TernoTrip. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
