import React from 'react';

interface ReviewCardProps {
  stars: number;
  text: string;
  initials: string;
  name: string;
  meta: string;
}

export default function ReviewCard({ stars, text, initials, name, meta }: ReviewCardProps) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      {/* Stars */}
      <div className="mb-3 flex gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i} className={i < stars ? 'text-primary' : 'text-gray-300'}>
            ★
          </span>
        ))}
      </div>

      {/* Quote */}
      <p className="mb-4 text-sm italic text-gray-700">{text}</p>

      {/* Author */}
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-700">
          {initials}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">{name}</p>
          <p className="text-xs text-gray-500">{meta}</p>
        </div>
      </div>
    </div>
  );
}
