'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface TripImageGalleryProps {
  images: string[];
  title: string;
}

export default function TripImageGallery({ images, title }: TripImageGalleryProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const allImages = images.length > 0 ? images : [`https://picsum.photos/seed/${title}/800/600`];

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div className="relative h-64 w-full overflow-hidden rounded-2xl sm:h-80 lg:h-96">
        <Image
          src={allImages[activeIdx]}
          alt={`${title} — image ${activeIdx + 1}`}
          fill
          className="object-cover transition-opacity duration-300"
          priority
          sizes="(max-width: 768px) 100vw, 70vw"
        />
      </div>

      {/* Thumbnails */}
      {allImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {allImages.map((img, i) => (
            <button
              key={i}
              onClick={() => setActiveIdx(i)}
              className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                i === activeIdx ? 'border-[#FF6B00]' : 'border-transparent opacity-70 hover:opacity-100'
              }`}
              aria-label={`View image ${i + 1}`}
            >
              <Image src={img} alt="" fill className="object-cover" sizes="96px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
