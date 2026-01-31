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
    const result = await this.db.getAllAsync<{ date: string }>(
      `SELECT DISTINCT date FROM measurements ORDER BY date ASC`,
    );

    if (!result || result.length === 0) {
      return { currentStreak: 0, longestStreak: 0, longestStreakEndDate: null };
    }

    let currentStreak = 0;
    let longestStreak = 0;
    let longestStreakEndDate = null;

    let tempStreak = 0;
    let prevDate: Date | null = null;
    let lastDateProcessed: Date | null = null;

    for (const row of result) {
      // Assuming date is in YYYY-MM-DD format
      const [year, month, day] = row.date.split("-").map(Number);
      const currDate = new Date(year, month - 1, day); // Local time
      lastDateProcessed = currDate;

      if (prevDate) {
        const diffTime = currDate.getTime() - prevDate.getTime();
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          tempStreak++;
        } else {
          // Streak broken
          if (tempStreak > longestStreak) {
            longestStreak = tempStreak;
            longestStreakEndDate = prevDate.toISOString().split("T")[0];
          }
          tempStreak = 1; // Reset to 1 (current day counts)
        }
      } else {
        tempStreak = 1;
      }

      prevDate = currDate;
    }

    // Check last streak
    if (tempStreak > longestStreak) {
      longestStreak = tempStreak;
      // Using normalized string from our manual date construction
      if (prevDate) {
        const y = prevDate.getFullYear();
        const m = String(prevDate.getMonth() + 1).padStart(2, "0");
        const d = String(prevDate.getDate()).padStart(2, "0");
        longestStreakEndDate = `${y}-${m}-${d}`;
      }
    }

    // Determine if current streak is active
    // Active if last record is today or yesterday
    const now = new Date();
    // Reset hours to compare dates only
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // We used local time construction for lastDateProcessed above, so it's comparable
    if (lastDateProcessed) {
      const diffTime = today.getTime() - lastDateProcessed.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays <= 1) {
        currentStreak = tempStreak;
      } else {
        currentStreak = 0;
      }
    }

    return { currentStreak, longestStreak, longestStreakEndDate };
  }
}
