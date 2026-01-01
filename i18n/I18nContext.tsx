import { SettingsRepository } from '@/db/repositories/SettingsRepository';
import { useSQLiteContext } from 'expo-sqlite';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Locale, TranslationKeys, translations } from './translations';

// Create Context
interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => Promise<void>;
  t: TranslationKeys;
  dateFormat: 'dd/MM/yyyy' | 'MM/dd/yyyy';
  setDateFormat: (format: 'dd/MM/yyyy' | 'MM/dd/yyyy') => Promise<void>;
  formatDate: (dateString: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en'); 
  const [dateFormat, setDateFormatState] = useState<'dd/MM/yyyy' | 'MM/dd/yyyy'>('dd/MM/yyyy');
  const db = useSQLiteContext();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
        try {
            const repo = new SettingsRepository(db);
            const savedLocale = await repo.getSetting('language');
            const savedDateFormat = await repo.getSetting('dateFormat');

            if (savedLocale && (savedLocale === 'en' || savedLocale === 'es')) {
                setLocaleState(savedLocale as Locale);
            } else {
                 setLocaleState('en'); 
            }

            if (savedDateFormat && (savedDateFormat === 'dd/MM/yyyy' || savedDateFormat === 'MM/dd/yyyy')) {
                setDateFormatState(savedDateFormat as 'dd/MM/yyyy' | 'MM/dd/yyyy');
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoaded(true);
        }
    };
    loadSettings();
  }, [db]);

  const setLocale = async (newLocale: Locale) => {
    setLocaleState(newLocale);
    try {
        const repo = new SettingsRepository(db);
        await repo.setSetting('language', newLocale);
    } catch (e) {
        console.error(e);
    }
  };

  const setDateFormat = async (newFormat: 'dd/MM/yyyy' | 'MM/dd/yyyy') => {
      setDateFormatState(newFormat);
      try {
          const repo = new SettingsRepository(db);
          await repo.setSetting('dateFormat', newFormat);
      } catch (e) {
          console.error(e);
      }
  };

  const formatDate = (dateString: string) => {
      // Input is always YYYY-MM-DD (ISO)
      const parts = dateString.split('-');
      if (parts.length !== 3) return dateString;

      const [year, month, day] = parts;
      
      if (dateFormat === 'dd/MM/yyyy') {
          return `${day}/${month}/${year}`;
      } else {
          return `${month}/${day}/${year}`;
      }
  };

  const t = translations[locale];

  if (!loaded) return null; // Or a splash

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, dateFormat, setDateFormat, formatDate }}>
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
