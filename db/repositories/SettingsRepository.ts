import { SQLiteDatabase } from 'expo-sqlite';

export class SettingsRepository {
    constructor(private db: SQLiteDatabase) {}

    async getSetting(key: string): Promise<string | null> {
        const result = await this.db.getFirstAsync<{ value: string }>(
            `SELECT value FROM settings WHERE key = ?`,
            [key]
        );
        return result ? result.value : null;
    }

    async setSetting(key: string, value: string) {
        await this.db.runAsync(
            `INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)`,
            [key, value]
        );
    }
    
    async getAllSettings(): Promise<Record<string, string>> {
        const rows = await this.db.getAllAsync<{ key: string, value: string }>(
            `SELECT key, value FROM settings`
        );
        const settings: Record<string, string> = {};
        rows.forEach(row => {
            settings[row.key] = row.value;
        });
        return settings;
    }
}
