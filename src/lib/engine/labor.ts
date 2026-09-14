import { HCR_MEAL_ALLOWANCE_2026, SMIC_MONTHLY_GROSS_2026 } from '@/data/france-benchmarks';
import type { StaffMember, StaffCostLine } from '@/types/models';

/**
 * Approximation paramétrique du taux patronal effectif pour une PME < 50 salariés.
 * Une base de cotisations de 46 % est diminuée d'une RGDU approchée, dégressive
 * jusqu'à 3 SMIC. Ce n'est pas un calcul de paie opposable.
 */
export function calculateEmployerCostRate(grossMonthlySalary: number): number {
  const smicRatio = Math.max(1, grossMonthlySalary / SMIC_MONTHLY_GROSS_2026);
  const grossEmployerRate = 0.46;
  if (smicRatio >= 3) return grossEmployerRate;

  const taperBase = Math.max(0, 0.5 * (3 / smicRatio - 1));
  const estimatedReduction = Math.min(
    0.3981,
    0.02 + 0.3781 * Math.pow(taperBase, 1.75),
  );

  return Math.max(0.06, grossEmployerRate - estimatedReduction);
}

export function calculateStaffLine(member: StaffMember): StaffCostLine {
  const fteMultiplier = member.weeklyHours / 35;

  const grossAnnualSalary =
    member.grossMonthlySalary * 12 * member.count * fteMultiplier;
  const employerCostRate = calculateEmployerCostRate(member.grossMonthlySalary);
  const mealCostAnnual =
    member.mealsPerDay * HCR_MEAL_ALLOWANCE_2026 * 260 * member.count * fteMultiplier;
  const annualEmployerCost = grossAnnualSalary * (1 + employerCostRate) + mealCostAnnual;

  return {
    role: member.role,
    count: member.count,
    grossAnnualSalary,
    employerCostRate,
    annualEmployerCost,
  };
}

export function calculateLaborCost(staff: StaffMember[]) {
  const lines = staff.map(calculateStaffLine);
  const totalGross = lines.reduce((sum, line) => sum + line.grossAnnualSalary, 0);
  const totalEmployerCost = lines.reduce((sum, line) => sum + line.annualEmployerCost, 0);

  return {
    lines,
    totalGross,
    totalEmployerCost,
  };
}
