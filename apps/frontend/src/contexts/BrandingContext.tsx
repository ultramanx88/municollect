'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface BrandingSettings {
  logo: string;
  favicon: string;
  splashBackground: string;
  municipalityName: string;
}

interface BrandingContextType {
  settings: BrandingSettings;
  updateSettings: (newSettings: Partial<BrandingSettings>) => void;
  resetSettings: () => void;
}

const defaultSettings: BrandingSettings = {
  logo: 'https://placehold.co/120x120/3498db/ffffff?text=LOGO',
  favicon: '/favicon.ico',
  splashBackground: '/bg-01.jpg',
  municipalityName: 'เทศบาลตำบลตัวอย่าง',
};

const BrandingContext = createContext<BrandingContextType | undefined>(undefined);

export function BrandingProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<BrandingSettings>(defaultSettings);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('brandingSettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...defaultSettings, ...parsed });
      } catch (error) {
        console.error('Failed to parse branding settings:', error);
      }
    }
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('brandingSettings', JSON.stringify(settings));
    
    // Update favicon dynamically
    const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
    if (favicon) {
      favicon.href = settings.favicon;
    }

    // Update document title
    document.title = `MuniCollect - ${settings.municipalityName}`;
  }, [settings]);

  const updateSettings = (newSettings: Partial<BrandingSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  return (
    <BrandingContext.Provider value={{ settings, updateSettings, resetSettings }}>
      {children}
    </BrandingContext.Provider>
  );
}

export function useBranding() {
  const context = useContext(BrandingContext);
  if (context === undefined) {
    throw new Error('useBranding must be used within a BrandingProvider');
  }
  return context;
}