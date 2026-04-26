import { useMemo } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import { MeasurementsRepository } from '@/db/repositories/MeasurementsRepository';
import { SettingsRepository } from '@/db/repositories/SettingsRepository';

/**
 * Hook centralizado para acceder a los repositorios de la app.
 * Memoiza las instancias para evitar crear objetos nuevos en cada render.
 */
export function useRepositories() {
  const db = useSQLiteContext();

  return useMemo(() => ({
    measurements: new MeasurementsRepository(db),
    settings: new SettingsRepository(db),
  }), [db]);
}
