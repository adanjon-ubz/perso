import {
  GROSS_EMPLOYER_RATE,
  HCR_MEAL_BENEFIT,
  MONTHLY_LEGAL_HOURS,
  RGDU,
  RGDU_ELIGIBLE_CONTRIBUTIONS,
  STAFF_ROLE_HCR_POSITION,
  WORKED_DAYS_PER_YEAR,
  hcrMonthlyFloor,
} from '@/data/france-benchmarks';
import type { LaborCosts, StaffCostLine, StaffMember, StaffRoleId } from '@/types/models';

/** Cotisations patronales restant dues même au niveau du SMIC. */
const IRREDUCIBLE_EMPLOYER_RATE = GROSS_EMPLOYER_RATE - RGDU_ELIGIBLE_CONTRIBUTIONS;

/**
 * Coefficient de réduction générale dégressive unique (RGDU) applicable à une
 * rémunération annuelle brute, pour un employeur de moins de 50 salariés.
 *
 * Coefficient = Tmin + Tdelta × [0,5 × (3 × SMIC de référence / rémunération − 1)]^1,75
 *
 * La réduction est maximale au niveau du SMIC et s'annule à 3 SMIC.
 */
export function calculateRgduCoefficient(annualGrossSalary: number): number {
  if (annualGrossSalary <= 0) return 0;

  const ceiling = RGDU.ceilingSmicMultiple * RGDU.annualReferenceSmic;
  if (annualGrossSalary >= ceiling) return 0;

  const ratio = 0.5 * (ceiling / annualGrossSalary - 1);
  const coefficient = RGDU.tMin + RGDU.tDelta * Math.pow(ratio, RGDU.exponent);

  return Math.min(RGDU.maxCoefficient, Math.max(0, coefficient));
}

/**
 * Taux de charges patronales effectif estimé, exprimé en % du brut.
 * Estimation paramétrique : ce n'est pas un calcul de paie opposable.
 */
export function calculateEmployerCostRate(grossMonthlySalary: number): number {
  const coefficient = calculateRgduCoefficient(grossMonthlySalary * 12);
  return Math.max(IRREDUCIBLE_EMPLOYER_RATE, GROSS_EMPLOYER_RATE - coefficient);
}

/** Minimum conventionnel HCR applicable au poste, primauté du SMIC incluse. */
export function getConventionalMinimum(role: StaffRoleId): number {
  const { level, step } = STAFF_ROLE_HCR_POSITION[role];
  return hcrMonthlyFloor(level, step);
}

export function calculateStaffLine(member: StaffMember): StaffCostLine {
  const fte = member.weeklyHours / 35;
  const headcountFte = member.count * fte;

  const grossAnnualSalary = member.grossMonthlySalary * 12 * headcountFte;
  const employerCostRate = calculateEmployerCostRate(member.grossMonthlySalary);

  // Avantage en nature nourriture : entre dans l'assiette de cotisations et
  // représente un coût réel pour l'employeur qui fournit le repas.
  const mealBenefit =
    member.mealsPerDay * HCR_MEAL_BENEFIT * WORKED_DAYS_PER_YEAR * headcountFte;

  const contributionBase = grossAnnualSalary + mealBenefit;
  const annualEmployerCost = contributionBase * (1 + employerCostRate);
  const conventionalMinimum = getConventionalMinimum(member.role);

  return {
    role: member.role,
    count: member.count,
    fte: headcountFte,
    grossAnnualSalary,
    mealBenefit,
    employerCostRate,
    employerContributions: contributionBase * employerCostRate,
    annualEmployerCost,
    conventionalMinimum,
    belowConventionalMinimum: member.grossMonthlySalary < conventionalMinimum,
    hourlyGross:
      member.weeklyHours > 0 ? member.grossMonthlySalary / MONTHLY_LEGAL_HOURS : 0,
  };
}

export function calculateLaborCost(staff: StaffMember[]): LaborCosts {
  const lines = staff.map(calculateStaffLine);

  return {
    lines,
    totalHeadcount: lines.reduce((sum, line) => sum + line.count, 0),
    totalFte: lines.reduce((sum, line) => sum + line.fte, 0),
    totalGross: lines.reduce((sum, line) => sum + line.grossAnnualSalary, 0),
    totalEmployerCost: lines.reduce((sum, line) => sum + line.annualEmployerCost, 0),
    hasSalaryBelowMinimum: lines.some((line) => line.belowConventionalMinimum),
  };
}
