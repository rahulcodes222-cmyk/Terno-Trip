'use client';

import React from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 text-center">
      <h2 className="mb-2 text-2xl font-bold text-gray-900">Something went wrong</h2>
      <p className="mb-6 text-sm text-gray-500">{error.message ?? 'An unexpected error occurred.'}</p>
      <button
        onClick={reset}
        className="rounded-xl bg-[#FF6B00] px-8 py-3 text-sm font-semibold text-white hover:bg-[#E65100]"
      >
        Try Again
      </button>
    </div>
  );
}
