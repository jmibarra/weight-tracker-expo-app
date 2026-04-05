import { DarkTheme, DefaultTheme, ThemeProvider as NativeThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { ThemeProvider as AppThemeProvider, useTheme } from '@/context/ThemeContext';
import { migrateDbIfNeeded } from '@/db/database';
import { MeasurementsRepository } from '@/db/repositories/MeasurementsRepository';
import { SettingsRepository } from '@/db/repositories/SettingsRepository';
import { I18nProvider } from '@/i18n/I18nContext';
import { SQLiteProvider, useSQLiteContext } from 'expo-sqlite';
import { useEffect } from 'react';

import * as QuickActions from 'expo-quick-actions';
import { useQuickActionRouting } from 'expo-quick-actions/router';

// ... 

export const unstable_settings = {
  anchor: '(tabs)',
};

function InnerLayout() {
    useQuickActionRouting();
    const { isDark } = useTheme();
    const db = useSQLiteContext();

    useEffect(() => {
        // Set Quick Actions
        QuickActions.setItems([
          {
            id: 'add-weight',
            title: 'Añadir Peso',
            icon: 'add_weight_icon',
            params: { href: '/modal' },
          }
        ]);

        const runMigration = async () => {
            try {
                const settingsRepo = new SettingsRepository(db);
                const migrated = await settingsRepo.getSetting('migration_dates_fixed_v1');
                
                if (!migrated) {
                    console.log('Running date format migration...');
                    const measureRepo = new MeasurementsRepository(db);
                    const count = await measureRepo.fixDateFormats();
                    await settingsRepo.setSetting('migration_dates_fixed_v1', 'true');
                    console.log(`Date migration completed. Fixed ${count} records.`);
                }
            } catch (error) {
                console.error('Migration failed:', error);
            }
        };

        runMigration();
    }, [db]);

    return (
        <NativeThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
            <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="modal" options={{ presentation: 'modal', headerShown: false }} />
            </Stack>
            <StatusBar style={isDark ? "light" : "dark"} />
        </NativeThemeProvider>
    );
}

export default function RootLayout() {
  return (
    <SQLiteProvider databaseName="weight_tracker.db" onInit={migrateDbIfNeeded} useSuspense>
      <AppThemeProvider>
          <I18nProvider>
            <InnerLayout />
          </I18nProvider>
      </AppThemeProvider>
    </SQLiteProvider>
  );
}
