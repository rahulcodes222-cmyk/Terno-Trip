import React from 'react';
import { cn, getStatusColor } from '@/lib/utils';

interface BadgeProps {
  status: string;
  className?: string;
}

export default function Badge({ status, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold',
        getStatusColor(status),
        className
      )}
    >
      {status}
    </span>
  );
}
