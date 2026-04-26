/**
 * Claves centralizadas para la tabla de settings en SQLite.
 * Evita el uso de strings mágicos dispersos por la app.
 */
export const SETTINGS_KEYS = {
  HEIGHT: 'height',
  SEX: 'sex',
  TARGET_WEIGHT: 'targetWeight',
  SHOW_TREND_LINE: 'showTrendLine',
  THEME: 'theme',
  LANGUAGE: 'language',
  DATE_FORMAT: 'dateFormat',
  MIGRATION_DATES_FIXED_V1: 'migration_dates_fixed_v1',
} as const;

export type SettingsKey = typeof SETTINGS_KEYS[keyof typeof SETTINGS_KEYS];
