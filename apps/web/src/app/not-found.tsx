import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#FF6B00] text-white text-2xl font-bold">
        T
      </div>
      <h1 className="mb-2 text-6xl font-extrabold text-gray-200">404</h1>
      <h2 className="mb-2 text-2xl font-bold text-gray-900">Page Not Found</h2>
      <p className="mb-8 max-w-sm text-gray-500">
        Looks like this trail doesn&apos;t exist. Let&apos;s head back to safety.
      </p>
      <Link
        href="/"
        className="rounded-xl bg-[#FF6B00] px-8 py-3 text-sm font-semibold text-white hover:bg-[#E65100]"
      >
        Back to Home
      </Link>
    </div>
  );
}
