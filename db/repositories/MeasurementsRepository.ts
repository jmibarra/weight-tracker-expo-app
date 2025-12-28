import { SQLiteDatabase } from 'expo-sqlite';

export interface Measurement {
    id?: number;
    date: string;
    weight: number;
    waist?: number;
    hip?: number;
    legs?: number;
    bmi?: number;
    created_at?: number;
}

export class MeasurementsRepository {
    constructor(private db: SQLiteDatabase) {}

    async addMeasurement(measurement: Measurement) {
        const { date, weight, waist, hip, legs, bmi } = measurement;
        const result = await this.db.runAsync(
            `INSERT INTO measurements (date, weight, waist, hip, legs, bmi, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [date, weight, waist ?? null, hip ?? null, legs ?? null, bmi ?? null, Date.now()]
        );
        return result.lastInsertRowId;
    }

    async getMeasurements(): Promise<Measurement[]> {
        return await this.db.getAllAsync<Measurement>(
            `SELECT * FROM measurements ORDER BY date DESC`
        );
    }
    
    async getMeasurementsForChart(): Promise<Measurement[]> {
         return await this.db.getAllAsync<Measurement>(
            `SELECT * FROM measurements ORDER BY date ASC`
        );
    }

    async getLatestMeasurement(): Promise<Measurement | null> {
        return await this.db.getFirstAsync<Measurement>(
            `SELECT * FROM measurements ORDER BY date DESC LIMIT 1`
        );
    }

    async deleteAll() {
        await this.db.runAsync('DELETE FROM measurements');
    }
}
