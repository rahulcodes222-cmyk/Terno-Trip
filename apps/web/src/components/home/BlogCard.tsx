'use client';

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
      className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-xl transition-all duration-300"
    >
      {/* Image container */}
      <div className="relative h-52 sm:h-56 w-full overflow-hidden bg-gray-100">
        <img
          src={image}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {/* Semi-transparent dark pill tag */}
        <div className="absolute left-3 top-3 z-10">
          <span className="inline-block rounded-full bg-black/60 backdrop-blur-md px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
            {tag}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <h3 className="text-sm sm:text-base font-extrabold text-gray-900 group-hover:text-[#FFA300] transition-colors line-clamp-2 leading-snug">
          {title}
        </h3>
        <div className="mt-3 flex items-center gap-1 text-xs font-bold text-[#FFA300]">
          <span>Read story</span>
          <span className="text-sm">↗</span>
        </div>
      </div>
    </Link>
  );
}
