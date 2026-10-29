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
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white transition-shadow hover:shadow-md">
      {/* Image */}
      <div className="relative h-48 w-full overflow-hidden">
        <img
          src={image}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
        />
      </div>

      {/* Content */}
      <div className="p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">{tag}</p>
        <h3 className="mt-1 line-clamp-2 font-semibold text-gray-900">{title}</h3>
        <Link
          href={href}
          className="mt-3 block text-sm font-medium text-primary hover:underline"
        >
          Read story ↗
        </Link>
      </div>
    </div>
  );
}
