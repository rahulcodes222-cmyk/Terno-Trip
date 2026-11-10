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
  sm: { img: 36, text: 'text-xl' },
  md: { img: 44, text: 'text-2xl' },
  lg: { img: 56, text: 'text-3xl' },
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

  // Split name for stylish two-tone brand like "Terno" + "Trip"
  const splitAt = name.toLowerCase().indexOf('trip');
  const part1 = splitAt > 0 ? name.slice(0, splitAt) : name;
  const part2 = splitAt > 0 ? name.slice(splitAt) : '';

  const content = (
    <div className={`flex items-center gap-2 shrink-0 ${className}`}>
      {logo && (
        <img
          src={logo}
          alt={name}
          width={img}
          height={img}
          className="object-contain max-h-9 w-auto"
          style={{ display: 'block' }}
          onError={(e) => {
            // Hide image if broken/missing
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
      )}
      <span className={`${text} font-black tracking-tight select-none flex items-baseline font-sans`}>
        <span className={dark ? 'text-white' : 'text-gray-900'}>{part1}</span>
        {part2 && <span className="text-[#FFA300]">{part2}</span>}
        <span className="text-[10px] font-bold text-[#FFA300] ml-0.5 tracking-normal">™</span>
      </span>
    </div>
  );

  if (!linked) return content;
  return <Link href="/">{content}</Link>;
}
