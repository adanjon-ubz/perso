import {
  calculateCostsSnapshot,
  calculateDepreciation,
  calculateFinancingCosts,
  getTotalCapex,
} from '@/lib/engine/costs';
import type { CashFlowResult, PnLResult, SimulationInput } from '@/types/models';

export function calculateCorporateTax(
  preTaxIncome: number,
  taxRate: number,
  reducedRate: number,
  threshold: number,
): number {
  if (preTaxIncome <= 0) return 0;

  const reducedPart = Math.min(preTaxIncome, threshold);
  const standardPart = Math.max(0, preTaxIncome - threshold);

  return reducedPart * reducedRate + standardPart * taxRate;
}

export function calculatePnL(input: SimulationInput, occupancyRate?: number): PnLResult {
  const { revenue, variableCosts, laborCosts, fixedCosts } = calculateCostsSnapshot(
    input,
    occupancyRate,
  );
  const depreciation = calculateDepreciation(input);
  const financing = calculateFinancingCosts(input);

  const grossMargin = revenue.totalRevenue - variableCosts.total;
  const grossMarginRate = revenue.totalRevenue > 0 ? grossMargin / revenue.totalRevenue : 0;
  const ebitda = grossMargin - laborCosts.totalEmployerCost - fixedCosts.total;
  const ebitdaMargin = revenue.totalRevenue > 0 ? ebitda / revenue.totalRevenue : 0;
  const operatingResult = ebitda - depreciation.total;
  const preTaxIncome = operatingResult - financing.annualInterest;
  const corporateTax = calculateCorporateTax(
    preTaxIncome,
    input.tax.corporateTaxRate,
    input.tax.reducedCorporateTaxRate,
    input.tax.reducedCorporateTaxThreshold,
  );
  const netIncome = preTaxIncome - corporateTax;
  const netMargin = revenue.totalRevenue > 0 ? netIncome / revenue.totalRevenue : 0;

  return {
    revenue,
    variableCosts,
    grossMargin,
    grossMarginRate,
    laborCosts,
    fixedCosts,
    ebitda,
    ebitdaMargin,
    depreciation,
    operatingResult,
    financing,
    preTaxIncome,
    corporateTax,
    netIncome,
    netMargin,
  };
}

export function calculateCashFlow(input: SimulationInput, pnl: PnLResult): CashFlowResult {
  const operatingCashFlow = pnl.netIncome + pnl.depreciation.total;
  const investingCashFlow = -getTotalCapex(input);
  const financingCashFlow =
    input.financing.equity +
    input.financing.debt -
    pnl.financing.annualPrincipalRepayment;

  return {
    operatingCashFlow,
    investingCashFlow,
    financingCashFlow,
    netCashFlow: operatingCashFlow + investingCashFlow + financingCashFlow,
  };
}
