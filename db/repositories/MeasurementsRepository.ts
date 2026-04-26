import { SQLiteDatabase } from "expo-sqlite";

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
      [
        date,
        weight,
        waist ?? null,
        hip ?? null,
        legs ?? null,
        bmi ?? null,
        Date.now(),
      ],
    );
    return result.lastInsertRowId;
  }

  async getMeasurements(): Promise<Measurement[]> {
    return await this.db.getAllAsync<Measurement>(
      `SELECT * FROM measurements ORDER BY date DESC`,
    );
  }

  async getMeasurementsForChart(): Promise<Measurement[]> {
    return await this.db.getAllAsync<Measurement>(
      `SELECT * FROM measurements ORDER BY date ASC`,
    );
  }

  async getLatestMeasurement(): Promise<Measurement | null> {
    return await this.db.getFirstAsync<Measurement>(
      `SELECT * FROM measurements ORDER BY date DESC LIMIT 1`,
    );
  }

  async count(): Promise<number> {
    const result = await this.db.getFirstAsync<{ count: number }>(
      `SELECT COUNT(*) as count FROM measurements`,
    );
    return result?.count ?? 0;
  }

  async deleteAll() {
    await this.db.runAsync("DELETE FROM measurements");
  }

  async deleteMeasurement(id: number) {
    await this.db.runAsync("DELETE FROM measurements WHERE id = ?", [id]);
  }

  async getMeasurementById(id: number): Promise<Measurement | null> {
    return await this.db.getFirstAsync<Measurement>(
      `SELECT * FROM measurements WHERE id = ?`,
      [id],
    );
  }

  async getMeasurementByDate(date: string): Promise<Measurement | null> {
    return await this.db.getFirstAsync<Measurement>(
      `SELECT * FROM measurements WHERE date = ?`,
      [date],
    );
  }

  async updateMeasurement(measurement: Measurement) {
    if (!measurement.id) throw new Error("ID required for update");
    const { id, date, weight, waist, hip, legs, bmi } = measurement;
    await this.db.runAsync(
      `UPDATE measurements SET date = ?, weight = ?, waist = ?, hip = ?, legs = ?, bmi = ? WHERE id = ?`,
      [date, weight, waist ?? null, hip ?? null, legs ?? null, bmi ?? null, id],
    );
  }

  async fixDateFormats(): Promise<number> {
    const allMeasurements = await this.getMeasurements();
    let fixedCount = 0;

    for (const m of allMeasurements) {
      if (!m.id) continue;

      // Check if date is in YYYY-MM-DD format with padding
      const parts = m.date.split("-");
      if (parts.length === 3) {
        const year = parts[0];
        const month = parts[1].padStart(2, "0");
        const day = parts[2].padStart(2, "0");

        const newDate = `${year}-${month}-${day}`;

        if (newDate !== m.date) {
          await this.db.runAsync(
            `UPDATE measurements SET date = ? WHERE id = ?`,
            [newDate, m.id],
          );
          fixedCount++;
        }
      }
    }
    return fixedCount;
  }
  async getStreaks(): Promise<{
    currentStreak: number;
    longestStreak: number;
    longestStreakEndDate: string | null;
  }> {
    const query = `
      WITH distinct_dates AS (
        SELECT DISTINCT date FROM measurements WHERE date IS NOT NULL
      ),
      grouped_dates AS (
        SELECT 
          date,
          CAST(julianday(date) AS INTEGER) - row_number() OVER (ORDER BY date ASC) AS grp
        FROM distinct_dates
      ),
      streaks AS (
        SELECT 
          COUNT(*) as streak_length,
          MAX(date) as end_date
        FROM grouped_dates
        GROUP BY grp
      )
      SELECT streak_length, end_date 
      FROM streaks 
      ORDER BY end_date DESC
    `;

    try {
      const result = await this.db.getAllAsync<{ streak_length: number; end_date: string }>(query);

      if (!result || result.length === 0) {
        return { currentStreak: 0, longestStreak: 0, longestStreakEndDate: null };
      }

      let longestStreak = 0;
      let longestStreakEndDate: string | null = null;
      let currentStreak = 0;

      const toIsoDateString = (d: Date) => {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      };

      const today = new Date();
      const todayStr = toIsoDateString(today);

      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);
      const yesterdayStr = toIsoDateString(yesterday);

      for (const row of result) {
        if (row.streak_length > longestStreak) {
          longestStreak = row.streak_length;
          longestStreakEndDate = row.end_date;
        }
      }

      // result is ordered by end_date DESC, so result[0] is the latest streak
      const latestStreak = result[0];
      if (latestStreak.end_date === todayStr || latestStreak.end_date === yesterdayStr) {
        currentStreak = latestStreak.streak_length;
      }

      return { currentStreak, longestStreak, longestStreakEndDate };
    } catch (e) {
      console.warn("Error calculating streaks with SQL window functions:", e);
      return { currentStreak: 0, longestStreak: 0, longestStreakEndDate: null };
    }
  }
}
