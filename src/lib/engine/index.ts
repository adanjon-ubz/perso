import { calculateBreakEven } from '@/lib/engine/break-even';
import {
  calculateDepreciation,
  calculateFinancingCosts,
  calculateFixedCosts,
  calculateVariableCosts,
  getTotalCapex,
} from '@/lib/engine/costs';
import { generateInsights } from '@/lib/engine/insights';
import { calculateEmployerCostRate, calculateLaborCost } from '@/lib/engine/labor';
import { calculateCashFlow, calculateCorporateTax, calculatePnL } from '@/lib/engine/pnl';
import { calculateCovers, calculateRevenue } from '@/lib/engine/revenue';
import { calculateScenarios } from '@/lib/engine/scenarios';
import {
  calculateDrivers,
  calculateOccupancyCurve,
  calculateSensitivity,
} from '@/lib/engine/sensitivity';
import type {
  PnLResult,
  SimulationInput,
  SimulationRatios,
  SimulationResult,
} from '@/types/models';

function calculateRatios(
  input: SimulationInput,
  pnl: PnLResult,
  operatingCashFlow: number,
  totalCapex: number,
): SimulationRatios {
  const revenue = pnl.revenue.totalRevenue;
  const share = (value: number) => (revenue > 0 ? value / revenue : 0);

  return {
    monthlyRevenue: revenue / 12,
    coversPerDay: pnl.revenue.coversPerDay,
    foodCostShare: share(pnl.variableCosts.foodPurchases + pnl.variableCosts.beveragePurchases),
    variableCostShare: share(pnl.variableCosts.total),
    laborShare: share(pnl.laborCosts.totalEmployerCost),
    rentShare: share(pnl.fixedCosts.rent + pnl.fixedCosts.rentCharges),
    primeCost: share(pnl.variableCosts.total + pnl.laborCosts.totalEmployerCost),
    returnOnEquity: input.financing.equity > 0 ? pnl.netIncome / input.financing.equity : 0,
    paybackYears: operatingCashFlow > 0 ? totalCapex / operatingCashFlow : Infinity,
  };
}

export function runSimulation(input: SimulationInput): SimulationResult {
  const pnl = calculatePnL(input);
  const breakEven = calculateBreakEven(input);
  const cashFlow = calculateCashFlow(input, pnl);
  const totalCapex = getTotalCapex(input);

  return {
    pnl,
    breakEven,
    cashFlow,
    ratios: calculateRatios(input, pnl, cashFlow.operatingCashFlow, totalCapex),
    drivers: calculateDrivers(input),
    insights: generateInsights(pnl, breakEven),
    scenarios: calculateScenarios(input),
    sensitivity: calculateSensitivity(input),
    occupancyCurve: calculateOccupancyCurve(input),
    totalCapex,
  };
}

export {
  calculateBreakEven,
  calculateCashFlow,
  calculateCorporateTax,
  calculateCovers,
  calculateDepreciation,
  calculateDrivers,
  calculateEmployerCostRate,
  calculateFinancingCosts,
  calculateFixedCosts,
  calculateLaborCost,
  calculateOccupancyCurve,
  calculatePnL,
  calculateRevenue,
  calculateScenarios,
  calculateSensitivity,
  calculateVariableCosts,
  generateInsights,
  getTotalCapex,
};
