import React from 'react';
import Link from 'next/link';

interface BlogCardProps {
  image: string;
  tag: string;
  title: string;
  href: string;
}

export default function BlogCard({ image, tag, title, href }: BlogCardProps) {
  return (
    <Link
      href={href}
      className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-card hover:shadow-card-hover transition-shadow"
    >
      {/* Image — 220px height */}
      <div className="relative overflow-hidden" style={{ height: '220px' }}>
        <img
          src={image}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        {/* Tag pill on image */}
        <span className="absolute left-3 top-3 rounded-full bg-black/50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm">
          {tag}
        </span>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="mb-3 text-sm font-bold leading-snug text-gray-900 line-clamp-2 group-hover:text-[#FF6B00] transition-colors flex-1">
          {title}
        </h3>
        <span className="text-xs font-semibold" style={{ color: '#FF6B00' }}>
          Read story ↗
        </span>
      </div>
    </Link>
  );
}
