import React from 'react';
import { cn } from '@/lib/utils';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const visiblePages = pages.filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1
  );

  return (
    <nav className="flex items-center justify-center gap-1" aria-label="Pagination">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="rounded-md border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="Previous page"
      >
        ‹
      </button>

      {visiblePages.map((p, i) => {
        const prevPage = visiblePages[i - 1];
        const showEllipsis = prevPage !== undefined && p - prevPage > 1;
        return (
          <React.Fragment key={p}>
            {showEllipsis && (
              <span className="px-2 py-2 text-sm text-gray-500">…</span>
            )}
            <button
              onClick={() => onPageChange(p)}
              className={cn(
                'rounded-md px-3 py-2 text-sm border',
                p === page
                  ? 'border-[#FF6B00] bg-[#FF6B00] text-white'
                  : 'border-gray-300 hover:bg-gray-50 text-gray-700'
              )}
              aria-current={p === page ? 'page' : undefined}
            >
              {p}
            </button>
          </React.Fragment>
        );
      })}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        className="rounded-md border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="Next page"
      >
        ›
      </button>
    </nav>
  );
}
