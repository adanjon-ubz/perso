import {
  calculateCostsSnapshot,
  calculateDepreciation,
  calculateFinancingCosts,
} from '@/lib/engine/costs';
import { calculateCovers } from '@/lib/engine/revenue';
import type { BreakEvenResult, SimulationInput } from '@/types/models';

export function calculateBreakEven(input: SimulationInput): BreakEvenResult {
  const { revenue, variableCosts, laborCosts, fixedCosts } = calculateCostsSnapshot(input);
  const depreciation = calculateDepreciation(input);
  const financing = calculateFinancingCosts(input);
  const totalFixedCosts =
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
      breakEvenOccupancy: 1,
      variableCostRate,
      contributionMarginRate,
    };
  }

  const breakEvenRevenue = totalFixedCosts / contributionMarginRate;
  const revenuePerBaseCover =
    revenue.annualCovers > 0 ? revenue.totalRevenue / revenue.annualCovers : 0;
  const breakEvenCoversAnnual =
    revenuePerBaseCover > 0 ? breakEvenRevenue / revenuePerBaseCover : Infinity;
  const openingDays = input.profile.openingDaysPerWeek * input.profile.openingWeeksPerYear;
  const breakEvenCoversPerDay =
    openingDays > 0 ? breakEvenCoversAnnual / openingDays : Infinity;

  const currentCovers = calculateCovers(input.profile);
  const breakEvenOccupancy =
    currentCovers.coversPerService > 0
      ? breakEvenCoversPerDay /
        (input.profile.servicesPerDay * input.profile.seatingCapacity)
      : 1;

  return {
    breakEvenRevenue,
    breakEvenCoversAnnual,
    breakEvenCoversPerDay,
    breakEvenOccupancy: Math.min(1, Math.max(0, breakEvenOccupancy)),
    variableCostRate,
    contributionMarginRate,
  };
}
