'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getSiteSettings, DEFAULT_SETTINGS } from '@/lib/site-settings';

interface SiteLogoProps {
  size?: 'sm' | 'md' | 'lg';
  dark?: boolean;
  linked?: boolean;
  className?: string;
}

const SIZE = {
  sm: { img: 36, text: 'text-base' },
  md: { img: 48, text: 'text-xl'   },
  lg: { img: 64, text: 'text-2xl'  },
};

export default function SiteLogo({ size = 'md', dark = false, linked = true, className = '' }: SiteLogoProps) {
  const [logoUrl, setLogoUrl]   = useState(DEFAULT_SETTINGS.logoUrl);
  const [siteName, setSiteName] = useState(DEFAULT_SETTINGS.siteName);

  useEffect(() => {
    // Read from localStorage on client mount
    const s = getSiteSettings();
    setLogoUrl(s.logoUrl || DEFAULT_SETTINGS.logoUrl);
    setSiteName(s.siteName || DEFAULT_SETTINGS.siteName);

    // Listen for admin updates
    const handler = (e: Event) => {
      const updated = (e as CustomEvent).detail;
      if (updated?.logoUrl)  setLogoUrl(updated.logoUrl);
      if (updated?.siteName) setSiteName(updated.siteName);
    };
    window.addEventListener('site-settings-updated', handler);
    return () => window.removeEventListener('site-settings-updated', handler);
  }, []);

  const { img, text } = SIZE[size];
  const logo = logoUrl || '/images/logo.svg';
  const name = siteName || 'TernoTrip';

  // Split "TernoTrip" → "Terno" + "Trip"
  const splitAt = name.indexOf('Trip');
  const part1 = splitAt > 0 ? name.slice(0, splitAt) : name;
  const part2 = splitAt > 0 ? name.slice(splitAt) : '';

  const content = (
    <div className={`flex items-center gap-0 shrink-0 ${className}`}>
      <img
        src={logo}
        alt={name}
        width={img}
        height={img}
        className="object-contain"
        style={{ display: 'block' }}
      />
      <span className={`${text} font-extrabold leading-none tracking-tight -ml-1`}>
        <span style={{ color: dark ? '#FFFFFF' : '#1B2E6B' }}>{part1}</span>
        {part2 && <span style={{ color: '#FF4500' }}>{part2}</span>}
      </span>
    </div>
  );

  if (!linked) return content;
  return <Link href="/">{content}</Link>;
}
