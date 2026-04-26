import * as SQLite from 'expo-sqlite';

export async function migrateDbIfNeeded(db: SQLite.SQLiteDatabase) {
  const DATABASE_VERSION = 2;
  // Get user_version of the DB
  let { user_version: currentDbVersion } = await db.getFirstAsync<{ user_version: number }>(
    'PRAGMA user_version'
  ) || { user_version: 0 };

  if (currentDbVersion >= DATABASE_VERSION) {
    return;
  }

  if (currentDbVersion === 0) {
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY NOT NULL,
        value TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS measurements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        weight REAL NOT NULL,
        waist REAL,
        hip REAL,
        legs REAL,
        bmi REAL,
        created_at INTEGER NOT NULL
      );
    `);
    currentDbVersion = 1;
  }

  // Migración v1 -> v2: Índice en columna date para optimizar queries
  if (currentDbVersion === 1) {
    await db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_measurements_date ON measurements(date);
    `);
  }

  // Actualizar versión de la base de datos
  await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
}
