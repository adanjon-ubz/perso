import {
  calculateCostsSnapshot,
  calculateDepreciation,
  calculateFinancingCosts,
} from '@/lib/engine/costs';
import type { BreakEvenResult, SimulationInput } from '@/types/models';

/**
 * Seuil de rentabilité avant impôt : niveau d'activité auquel la marge sur
 * coûts variables couvre exactement les charges fixes (personnel, charges
 * d'exploitation, amortissements et intérêts).
 *
 * La masse salariale est traitée comme une charge fixe : à court terme, une
 * variation de fréquentation ne modifie pas l'effectif en place.
 */
export function calculateBreakEven(input: SimulationInput): BreakEvenResult {
  const { revenue, variableCosts, laborCosts, fixedCosts } = calculateCostsSnapshot(input);
  const depreciation = calculateDepreciation(input);
  const financing = calculateFinancingCosts(input);

  const fixedCostBase =
    laborCosts.totalEmployerCost +
    fixedCosts.total +
    depreciation.total +
    financing.annualInterest;

  const variableCostRate =
    revenue.totalRevenue > 0 ? variableCosts.total / revenue.totalRevenue : 0;
  const contributionMarginRate = 1 - variableCostRate;

  if (contributionMarginRate <= 0) {
    return {
      breakEvenRevenue: Infinity,
      breakEvenCoversAnnual: Infinity,
      breakEvenCoversPerDay: Infinity,
      breakEvenOccupancy: Infinity,
      isAchievable: false,
      fixedCostBase,
      variableCostRate,
      contributionMarginRate,
    };
  }

  const breakEvenRevenue = fixedCostBase / contributionMarginRate;
  const revenuePerCover =
    revenue.annualCovers > 0 ? revenue.totalRevenue / revenue.annualCovers : 0;

  if (revenuePerCover <= 0) {
    return {
      breakEvenRevenue,
      breakEvenCoversAnnual: Infinity,
      breakEvenCoversPerDay: Infinity,
      breakEvenOccupancy: Infinity,
      isAchievable: false,
      fixedCostBase,
      variableCostRate,
      contributionMarginRate,
    };
  }

  const breakEvenCoversAnnual = breakEvenRevenue / revenuePerCover;
  const breakEvenCoversPerDay =
    revenue.openingDaysPerYear > 0 ? breakEvenCoversAnnual / revenue.openingDaysPerYear : Infinity;

  const dailyCapacity = input.profile.seatingCapacity * input.profile.servicesPerDay;
  const breakEvenOccupancy =
    dailyCapacity > 0 ? breakEvenCoversPerDay / dailyCapacity : Infinity;

  return {
    breakEvenRevenue,
    breakEvenCoversAnnual,
    breakEvenCoversPerDay,
    breakEvenOccupancy,
    isAchievable: Number.isFinite(breakEvenOccupancy) && breakEvenOccupancy <= 1,
    fixedCostBase,
    variableCostRate,
    contributionMarginRate,
  };
}
