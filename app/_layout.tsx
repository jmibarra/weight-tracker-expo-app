import { DarkTheme, DefaultTheme, ThemeProvider as NativeThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { ThemeProvider as AppThemeProvider, useTheme } from '@/context/ThemeContext';
import { migrateDbIfNeeded } from '@/db/database';
import { I18nProvider } from '@/i18n/I18nContext';
import { SQLiteProvider } from 'expo-sqlite';

export const unstable_settings = {
  anchor: '(tabs)',
};

function InnerLayout() {
    const { isDark } = useTheme();

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
