import { IIMCCalculator } from "@/server/application/services/imc-calculator.interface";

export class IMCCalculator implements IIMCCalculator {
  calculate(weight: number, height: number): number | null {
    if (!weight || !height) return null;

    const heightInMeters = height > 3 ? height / 100 : height;

    const imc = weight / (heightInMeters * heightInMeters);
    return parseFloat(imc.toFixed(2));
  }
}
