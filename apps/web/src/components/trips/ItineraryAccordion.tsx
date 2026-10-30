'use client';

import React, { useState } from 'react';
import { ChevronDown, MapPin, Bed } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ITripItineraryDay } from '@/types';

interface ItineraryAccordionProps {
  itinerary: ITripItineraryDay[];
}

export default function ItineraryAccordion({ itinerary }: ItineraryAccordionProps) {
  const [openDay, setOpenDay] = useState<number | null>(0);

  if (!itinerary.length) {
    return <p className="text-sm text-gray-500">Itinerary details coming soon.</p>;
  }

  return (
    <div className="space-y-2">
      {itinerary.map((day, i) => (
        <div key={i} className="overflow-hidden rounded-xl border border-gray-100">
          <button
            onClick={() => setOpenDay(openDay === i ? null : i)}
            className={cn(
              'flex w-full items-center justify-between px-4 py-3 text-left transition-colors',
              openDay === i ? 'bg-orange-50' : 'bg-white hover:bg-gray-50'
            )}
          >
            <div className="flex items-center gap-3">
              <span className={cn(
                'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                openDay === i ? 'bg-[#FF6B00] text-white' : 'bg-gray-100 text-gray-600'
              )}>
                {day.day}
              </span>
              <span className="font-medium text-gray-900 text-sm">{day.title}</span>
            </div>
            <ChevronDown
              className={cn(
                'h-4 w-4 shrink-0 text-gray-400 transition-transform duration-200',
                openDay === i && 'rotate-180'
              )}
            />
          </button>

          {openDay === i && (
            <div className="border-t border-gray-100 bg-white px-4 py-4 space-y-3">
              <p className="text-sm text-gray-600">{day.description}</p>
              {day.activities.length > 0 && (
                <ul className="space-y-1.5">
                  {day.activities.map((act, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-gray-700">
                      <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#FF6B00]" />
                      {act}
                    </li>
                  ))}
                </ul>
              )}
              {day.accommodation && (
                <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-700">
                  <Bed className="h-4 w-4 shrink-0" />
                  <span>{day.accommodation}</span>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
