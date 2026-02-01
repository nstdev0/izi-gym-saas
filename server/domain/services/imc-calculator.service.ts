export class IMCCalculator {
  static calculate(weight: number, height: number): number | null {
    if (!weight || !height) return null;

    // Determine if height is in cm or meters.
    // If height > 3, assume cm.
    // Typical height in m is 0.5 - 2.5.
    // Typical height in cm is 50 - 250.
    const heightInMeters = height > 3 ? height / 100 : height;

    const imc = weight / (heightInMeters * heightInMeters);
    return parseFloat(imc.toFixed(2));
  }
}
