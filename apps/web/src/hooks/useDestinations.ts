'use client';
import { useState, useEffect } from 'react';

export interface Destination {
  id: string;
  name: string;
  subtitle: string;
  images: string[];
  badge?: 'Popular' | 'Trending' | 'Top Rated';
}

const LS_KEY = 'terno_destinations';

export const DEFAULT_DESTINATIONS: Destination[] = [
  {
    id: '1',
    name: 'Manali',
    subtitle: 'Himachal Pradesh',
    images: [
      'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=600&q=80',
      'https://images.unsplash.com/photo-1580385778939-1cbb09814e0e?w=600&q=80',
      'https://images.unsplash.com/photo-1571586992748-20322d999731?w=600&q=80',
    ],
    badge: 'Popular',
  },
  {
    id: '2',
    name: 'Goa',
    subtitle: 'Beach Paradise',
    images: [
      'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600&q=80',
      'https://images.unsplash.com/photo-1571003124884-357f08e2051d?w=600&q=80',
      'https://images.unsplash.com/photo-1559827260-dc66d52719d2?w=600&q=80',
    ],
    badge: 'Trending',
  },
  {
    id: '3',
    name: 'Agra',
    subtitle: 'Land of Royals',
    images: [
      'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=600&q=80',
      'https://images.unsplash.com/photo-1565606887445-c12ef02857a4?w=600&q=80',
    ],
    badge: 'Top Rated',
  },
  {
    id: '4',
    name: 'Kerala',
    subtitle: "God's Own Country",
    images: [
      'https://images.unsplash.com/photo-1593693411515-c20261bcad6e?w=600&q=80',
      'https://images.unsplash.com/photo-1587103171191-0cb1e939e66d?w=600&q=80',
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
      'https://images.unsplash.com/photo-1626015365107-ac15a89e8c33?w=600&q=80',
      'https://images.unsplash.com/photo-1583328713761-5e06f21b121a?w=600&q=80',
    ],
    badge: 'Popular',
  },
  {
    id: '7',
    name: 'Rishikesh',
    subtitle: 'Yoga & Adventure',
    images: [
      'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&q=80',
      'https://images.unsplash.com/photo-1541044375375-0923d21d5c0f?w=600&q=80',
    ],
  },
  {
    id: '8',
    name: 'Andaman',
    subtitle: 'Tropical Paradise',
    images: [
      'https://images.unsplash.com/photo-1598091383021-15ddea10925d?w=600&q=80',
      'https://images.unsplash.com/photo-1587485997135-932b4e4cfc81?w=600&q=80',
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
    // Backward-compat: migrate old single-image entries to images array
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
