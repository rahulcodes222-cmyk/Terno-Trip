'use client';
import { useState, useEffect } from 'react';

export interface Destination {
  id: string;
  name: string;
  subtitle: string;
  image: string;
  badge?: 'Popular' | 'Trending' | 'Top Rated';
}

const LS_KEY = 'terno_destinations';

export const DEFAULT_DESTINATIONS: Destination[] = [
  { id: '1', name: 'Manali',    subtitle: 'Himachal Pradesh',    image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=600&q=80', badge: 'Popular'   },
  { id: '2', name: 'Goa',       subtitle: 'Beach Paradise',      image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600&q=80', badge: 'Trending'  },
  { id: '3', name: 'Agra',      subtitle: 'Land of Royals',      image: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=600&q=80', badge: 'Top Rated' },
  { id: '4', name: 'Kerala',    subtitle: "God's Own Country",   image: 'https://images.unsplash.com/photo-1593693411515-c20261bcad6e?w=600&q=80'                     },
  { id: '5', name: 'Delhi',     subtitle: 'Heart of India',      image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=600&q=80'                     },
  { id: '6', name: 'Ladakh',    subtitle: 'Land of High Passes', image: 'https://images.unsplash.com/photo-1626015365107-ac15a89e8c33?w=600&q=80', badge: 'Popular'   },
  { id: '7', name: 'Rishikesh', subtitle: 'Yoga & Adventure',    image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&q=80'                       },
  { id: '8', name: 'Andaman',   subtitle: 'Tropical Paradise',   image: 'https://images.unsplash.com/photo-1598091383021-15ddea10925d?w=600&q=80', badge: 'Trending'  },
];

export function getDestinations(): Destination[] {
  if (typeof window === 'undefined') return DEFAULT_DESTINATIONS;
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return DEFAULT_DESTINATIONS;
    return JSON.parse(raw) as Destination[];
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
