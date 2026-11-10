'use client';
import { useState, useEffect } from 'react';

export interface Destination {
  id: string;
  name: string;
  subtitle: string;
  images: string[];
  badge?: 'Popular' | 'Trending' | 'Top Rated';
}

const LS_KEY = 'terno_destinations_v2';

export const DEFAULT_DESTINATIONS: Destination[] = [
  {
    id: '1',
    name: 'kashmir',
    subtitle: 'Himachal Pradesh',
    images: [
      'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&q=80',
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&q=80',
    ],
    badge: 'Popular',
  },
  {
    id: '2',
    name: 'Goa',
    subtitle: 'Beach Paradise',
    images: [
      'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=600&q=80',
      'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600&q=80',
    ],
    badge: 'Trending',
  },
  {
    id: '3',
    name: 'Agra',
    subtitle: 'Land of Royals',
    images: [
      'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=600&q=80',
      'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=600&q=80',
    ],
    badge: 'Top Rated',
  },
  {
    id: '4',
    name: 'Kerala',
    subtitle: "God's Own Country",
    images: [
      'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=600&q=80',
      'https://images.unsplash.com/photo-1593693411515-c20261bcad6e?w=600&q=80',
    ],
  },
  {
    id: '5',
    name: 'Delhi',
    subtitle: 'Heart of India',
    images: [
      'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=600&q=80',
      'https://images.unsplash.com/photo-1558024564-9eb56a57b747?w=600&q=80',
    ],
  },
  {
    id: '6',
    name: 'Ladakh',
    subtitle: 'Land of High Passes',
    images: [
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&q=80',
      'https://images.unsplash.com/photo-1626015365107-ac15a89e8c33?w=600&q=80',
    ],
    badge: 'Popular',
  },
  {
    id: '7',
    name: 'Rishikesh',
    subtitle: 'Yoga & Adventure',
    images: [
      'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&q=80',
      'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&q=80',
    ],
  },
  {
    id: '8',
    name: 'Andaman',
    subtitle: 'Tropical Paradise',
    images: [
      'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&q=80',
      'https://images.unsplash.com/photo-1598091383021-15ddea10925d?w=600&q=80',
    ],
    badge: 'Trending',
  },
];

export function getDestinations(): Destination[] {
  if (typeof window === 'undefined') return DEFAULT_DESTINATIONS;
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return DEFAULT_DESTINATIONS;
    const parsed = JSON.parse(raw) as Destination[];
    return parsed.map((d) => ({
      ...d,
      images: Array.isArray(d.images) ? d.images : (d as any).image ? [(d as any).image] : [],
    }));
  } catch {
    return DEFAULT_DESTINATIONS;
  }
}

export function saveDestinations(dests: Destination[]): void {
  localStorage.setItem(LS_KEY, JSON.stringify(dests));
  window.dispatchEvent(new CustomEvent('destinations-updated'));
}

export function useDestinations(): Destination[] {
  const [destinations, setDestinations] = useState<Destination[]>(DEFAULT_DESTINATIONS);

  useEffect(() => {
    setDestinations(getDestinations());
    const handler = () => setDestinations(getDestinations());
    window.addEventListener('destinations-updated', handler);
    return () => window.removeEventListener('destinations-updated', handler);
  }, []);

  return destinations;
}
