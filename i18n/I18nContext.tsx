import { SettingsRepository } from '@/db/repositories/SettingsRepository';
import { useSQLiteContext } from 'expo-sqlite';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Locale, TranslationKeys, translations } from './translations';

// Create Context
interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => Promise<void>;
  t: TranslationKeys;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en'); 
  const db = useSQLiteContext();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadLocale();
  }, []);

  const loadLocale = async () => {
    try {
        const repo = new SettingsRepository(db);
        const savedLocale = await repo.getSetting('language');
        if (savedLocale && (savedLocale === 'en' || savedLocale === 'es')) {
            setLocaleState(savedLocale as Locale);
        } else {
             // Fallback detection logic if needed, simplify to EN for now or ES default requested?
             // User asked for option to select, implies default might be EN or system.
             setLocaleState('en'); 
        }
    } catch (e) {
        console.error(e);
    } finally {
        setLoaded(true);
    }
  };

  const setLocale = async (newLocale: Locale) => {
    setLocaleState(newLocale);
    try {
        const repo = new SettingsRepository(db);
        await repo.setSetting('language', newLocale);
    } catch (e) {
        console.error(e);
    }
  };

  const t = translations[locale];

  if (!loaded) return null; // Or a splash

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
