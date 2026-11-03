import { useState, useEffect } from 'react';
import { getSiteSettings, DEFAULT_SETTINGS, type SiteSettings } from '@/lib/site-settings';

export function useSiteSettings(): SiteSettings {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    setSettings(getSiteSettings());

    const handler = (e: Event) => {
      setSettings((e as CustomEvent<SiteSettings>).detail);
    };
    window.addEventListener('site-settings-updated', handler);
    return () => window.removeEventListener('site-settings-updated', handler);
  }, []);

  return settings;
}
