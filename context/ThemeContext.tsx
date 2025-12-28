import { Colors } from '@/constants/Colors';
import { SettingsRepository } from '@/db/repositories/SettingsRepository';
import { useSQLiteContext } from 'expo-sqlite';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';

type ThemeType = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  colors: typeof Colors.dark;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [theme, setThemeState] = useState<ThemeType>('dark'); // Default to dark for consistency with previous version, or 'system'
  const db = useSQLiteContext();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const loadTheme = async () => {
        try {
            const repo = new SettingsRepository(db);
            const savedTheme = await repo.getSetting('theme');
            if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system')) {
                setThemeState(savedTheme as ThemeType);
            }
        } catch (e) {
            console.error("Failed to load theme setting", e);
        } finally {
            setLoaded(true);
        }
    };
    loadTheme();
  }, [db]);

  const setTheme = async (newTheme: ThemeType) => {
      setThemeState(newTheme);
      try {
          const repo = new SettingsRepository(db);
          await repo.setSetting('theme', newTheme);
      } catch (e) {
          console.error("Failed to save theme setting", e);
      }
  };

  const activeTheme = theme === 'system' ? (systemColorScheme || 'dark') : theme;
  const colors = Colors[activeTheme];

  // If not loaded yet, maybe return null or just render with default to avoid flicker?
  // We'll render, it might flicker from dark->light if default is wrong. 
  // Since original app was dark-only, default 'dark' is safe.

  return (
    <ThemeContext.Provider value={{
      theme,
      setTheme,
      colors,
      isDark: activeTheme === 'dark'
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
