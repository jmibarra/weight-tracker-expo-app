import * as SQLite from 'expo-sqlite';

export async function migrateDbIfNeeded(db: SQLite.SQLiteDatabase) {
  const DATABASE_VERSION = 1;
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
    
    // Update version
    await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
  }
}
