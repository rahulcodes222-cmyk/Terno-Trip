'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { getSiteSettings } from '@/lib/site-settings';

type Settings = {
  logoUrl: string;
};

const SettingsContext = createContext<{ settings: Settings | null; refresh: () => void }>({
  settings: null,
  refresh: () => {}
});

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Settings | null>(null);

  const fetch = async () => {
    try {
      const data = getSiteSettings();
      setSettings(data);
    } catch (e) {
      console.error('Failed to load settings', e);
    }
  };

  useEffect(() => {
    fetch();
    // Listen for site-settings updates from other parts of the app (admin settings page)
    const handler = () => {
      fetch();
    };
    window.addEventListener('site-settings-updated', handler);
    return () => {
      window.removeEventListener('site-settings-updated', handler);
    };
  }, []);

  const refresh = () => fetch();

  return (
    <SettingsContext.Provider value={{ settings, refresh }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
