export class ImcCalculator {
  static calculate(weightKg: number, heightCm: number): number {
    if (heightCm <= 0) return 0;
    const heightM = heightCm / 100;
    const bmi = weightKg / (heightM * heightM);
    return parseFloat(bmi.toFixed(2));
  }
}
