'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubmitted(true);
      setEmail('');
    }
  };

  return (
    <footer>
      {/* Newsletter band */}
      <div className="bg-primary py-10 text-white">
        <div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
          <h2 className="mb-2 text-2xl font-extrabold">Get exclusive India travel deals</h2>
          <p className="mb-6 text-primary-100">
            Subscribe for early-bird offers, trip stories, and travel tips.
          </p>
          {submitted ? (
            <p className="rounded-xl bg-white/20 px-6 py-3 font-medium text-white">
              You&#39;re on the list! Deals coming soon. 🎉
            </p>
          ) : (
            <form onSubmit={handleSubscribe} className="flex flex-col gap-3 sm:flex-row">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="flex-1 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
              />
              <button
                type="submit"
                className="rounded-lg bg-white px-6 py-2.5 text-sm font-bold text-primary hover:bg-primary-50 transition-colors"
              >
                Subscribe
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Main footer */}
      <div className="bg-[#0A0A0A] py-12 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {/* Brand */}
            <div className="col-span-1 sm:col-span-2 lg:col-span-1">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white font-bold text-sm">
                  T
                </div>
                <span className="text-xl font-bold text-white">TernoTrip</span>
              </div>
              <p className="text-sm text-gray-400">
                Discover India&apos;s best tour packages — Himalayas, Goa, Kerala, Rajasthan and more.
              </p>
            </div>

            {/* Explore */}
            <div>
              <h3 className="mb-3 text-sm font-semibold text-white">Explore</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/trips" className="hover:text-primary transition-colors">All Packages</Link></li>
                <li><Link href="/trips?category=Adventure" className="hover:text-primary transition-colors">Adventure</Link></li>
                <li><Link href="/trips?category=Beach" className="hover:text-primary transition-colors">Beach</Link></li>
                <li><Link href="/trips?category=Cultural" className="hover:text-primary transition-colors">Cultural</Link></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="mb-3 text-sm font-semibold text-white">Company</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><span className="cursor-default">About Us</span></li>
                <li><span className="cursor-default">Contact</span></li>
                <li><span className="cursor-default">Careers</span></li>
                <li><span className="cursor-default">Blog</span></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="mb-3 text-sm font-semibold text-white">Support</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><span className="cursor-default">Help Centre</span></li>
                <li><span className="cursor-default">Terms of Service</span></li>
                <li><span className="cursor-default">Privacy Policy</span></li>
                <li><span className="cursor-default">Cancellation Policy</span></li>
              </ul>
            </div>
          </div>

          <div className="mt-10 border-t border-gray-800 pt-6 text-center text-xs text-gray-500">
            © {new Date().getFullYear()} TernoTrip. All rights reserved. Built with ❤️ for travellers.
          </div>
        </div>
      </div>
    </footer>
  );
}
