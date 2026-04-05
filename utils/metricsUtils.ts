import { Measurement } from "@/db/repositories/MeasurementsRepository";

export interface PeriodAverages {
  weight: number;
  waist: number;
  hip: number;
  legs: number;
  count: number;
}

export interface MetricDifference {
  absolute: number;
  percentage: number;
}

export interface PeriodComparison {
  current: PeriodAverages;
  previous: PeriodAverages;
  differences: {
    weight: MetricDifference;
    waist: MetricDifference;
    hip: MetricDifference;
    legs: MetricDifference;
  };
}

export function getAveragesForMeasurements(measurements: Measurement[]): PeriodAverages {
  if (!measurements || measurements.length === 0) {
    return { weight: 0, waist: 0, hip: 0, legs: 0, count: 0 };
  }

  let weightSum = 0, waistSum = 0, hipSum = 0, legsSum = 0;
  let weightCount = 0, waistCount = 0, hipCount = 0, legsCount = 0;

  for (const m of measurements) {
    if (m.weight) { weightSum += m.weight; weightCount++; }
    if (m.waist) { waistSum += m.waist; waistCount++; }
    if (m.hip) { hipSum += m.hip; hipCount++; }
    if (m.legs) { legsSum += m.legs; legsCount++; }
  }

  return {
    weight: weightCount > 0 ? weightSum / weightCount : 0,
    waist: waistCount > 0 ? waistSum / waistCount : 0,
    hip: hipCount > 0 ? hipSum / hipCount : 0,
    legs: legsCount > 0 ? legsSum / legsCount : 0,
    count: measurements.length,
  };
}

const calculateDiff = (current: number, previous: number): MetricDifference => {
  if (previous === 0 || current === 0) {
    return { absolute: 0, percentage: 0 };
  }
  const absolute = current - previous;
  const percentage = (absolute / previous) * 100;
  return { absolute, percentage };
};

export function comparePeriods(currentMs: Measurement[], previousMs: Measurement[]): PeriodComparison {
  const current = getAveragesForMeasurements(currentMs);
  const previous = getAveragesForMeasurements(previousMs);

  return {
    current,
    previous,
    differences: {
      weight: calculateDiff(current.weight, previous.weight),
      waist: calculateDiff(current.waist, previous.waist),
      hip: calculateDiff(current.hip, previous.hip),
      legs: calculateDiff(current.legs, previous.legs),
    }
  };
}

// Helper to get start of week (Monday)
function getMonday(d: Date) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(date.setDate(diff));
}

export interface WeeklyAverageData {
  label: string; 
  value: number;
}

export function getWeeklyAverages(measurements: Measurement[], maxWeeks: number = 12): WeeklyAverageData[] {
  if (!measurements || measurements.length === 0) return [];

  // Group by week start (YYYY-MM-DD of the Monday)
  const grouped: Record<string, Measurement[]> = {};
  
  for (const m of measurements) {
    const [year, month, day] = m.date.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    const monday = getMonday(date);
    
    // Format YYYY-MM-DD
    const y = monday.getFullYear();
    const mo = String(monday.getMonth() + 1).padStart(2, "0");
    const d = String(monday.getDate()).padStart(2, "0");
    const mondayStr = `${y}-${mo}-${d}`;
    
    // UI Label e.g. "DD/MM"
    const labelStr = `${d}/${mo}`;

    if (!grouped[mondayStr]) {
      grouped[mondayStr] = [];
      // attach label property dynamically
      (grouped[mondayStr] as any).label = labelStr; 
    }
    grouped[mondayStr].push(m);
  }

  // Sort chronologically
  const sortedKeys = Object.keys(grouped).sort();
  // Take only last maxWeeks
  const recentKeys = sortedKeys.slice(-maxWeeks);

  return recentKeys.map(key => {
    const ms = grouped[key];
    const avg = getAveragesForMeasurements(ms);
    return {
      label: (ms as any).label,
      value: Number(avg.weight.toFixed(1)),
    };
  });
}

// Function to filter by month and year
export function getMeasurementsForMonth(measurements: Measurement[], year: number, monthZeroIndexed: number): Measurement[] {
  return measurements.filter(m => {
    const [y, mo] = m.date.split("-").map(Number);
    return y === year && (mo - 1) === monthZeroIndexed;
  });
}

// Function to filter by year
export function getMeasurementsForYear(measurements: Measurement[], year: number): Measurement[] {
  return measurements.filter(m => {
    const [y] = m.date.split("-").map(Number);
    return y === year;
  });
}
