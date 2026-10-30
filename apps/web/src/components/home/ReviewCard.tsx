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
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-card hover:shadow-card-hover transition-shadow">
      {/* Stars — orange like demo */}
      <div className="mb-3 flex gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i} className={`text-base ${i < stars ? 'text-[#FF6B00]' : 'text-gray-200'}`}>
            ★
          </span>
        ))}
      </div>

      {/* Quote */}
      <p className="mb-4 text-sm leading-relaxed text-gray-600 italic">{text}</p>

      {/* Author */}
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#FF6B00] text-xs font-bold text-white">
          {initials}
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">{name}</p>
          <p className="text-xs text-gray-500">{meta}</p>
        </div>
      </div>
    </div>
  );
}
