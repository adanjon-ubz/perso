import { calculateBreakEven } from '@/lib/engine/break-even';
import { getTotalCapex } from '@/lib/engine/costs';
import { generateInsights } from '@/lib/engine/insights';
import { calculateLaborCost } from '@/lib/engine/labor';
import { calculateCashFlow, calculatePnL } from '@/lib/engine/pnl';
import { calculateRevenue } from '@/lib/engine/revenue';
import { calculateScenarios } from '@/lib/engine/scenarios';
import {
  calculateDrivers,
  calculateOccupancyCurve,
  calculateSensitivity,
} from '@/lib/engine/sensitivity';
import type { SimulationInput, SimulationResult } from '@/types/models';

export function runSimulation(input: SimulationInput): SimulationResult {
  const pnl = calculatePnL(input);
  const breakEven = calculateBreakEven(input);
  const cashFlow = calculateCashFlow(input, pnl);
  const drivers = calculateDrivers(input);
  const insights = generateInsights(pnl, breakEven);
  const scenarios = calculateScenarios(input);
  const sensitivity = calculateSensitivity(input);
  const occupancyCurve = calculateOccupancyCurve(input);
  const totalCapex = getTotalCapex(input);
  const returnOnEquity =
    input.financing.equity > 0 ? pnl.netIncome / input.financing.equity : 0;

  return {
    pnl,
    breakEven,
    cashFlow,
    drivers,
    insights,
    scenarios,
    sensitivity,
    occupancyCurve,
    totalCapex,
    returnOnEquity,
  };
}

export {
  calculateBreakEven,
  calculateDrivers,
  calculateLaborCost,
  calculateOccupancyCurve,
  calculatePnL,
  calculateRevenue,
  calculateScenarios,
  calculateSensitivity,
  generateInsights,
  getTotalCapex,
};
