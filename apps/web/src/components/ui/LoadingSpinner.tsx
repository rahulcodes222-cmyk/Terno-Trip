import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  fullPage?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function LoadingSpinner({
  fullPage = false,
  size = 'md',
  className,
}: LoadingSpinnerProps) {
  const sizeMap = { sm: 'h-5 w-5', md: 'h-8 w-8', lg: 'h-12 w-12' };

  const spinner = (
    <svg
      className={cn('animate-spin text-[#FF6B00]', sizeMap[size], className)}
      fill="none"
      viewBox="0 0 24 24"
      aria-label="Loading"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );

  if (fullPage) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">{spinner}</div>
    );
  }

  return spinner;
}
