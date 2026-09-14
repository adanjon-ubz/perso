import { calculateLaborCost } from '@/lib/engine/labor';
import { calculateRevenue } from '@/lib/engine/revenue';
import type {
  DepreciationBreakdown,
  FinancingCosts,
  FixedCosts,
  OperatingAssumptions,
  RevenueBreakdown,
  SimulationInput,
  VariableCosts,
} from '@/types/models';

export function calculateVariableCosts(
  revenue: RevenueBreakdown,
  operating: OperatingAssumptions,
): VariableCosts {
  const foodPurchases =
    (revenue.foodRevenue + revenue.takeawayRevenue + revenue.deliveryRevenue) *
    operating.foodCostRate;
  const beveragePurchases =
    (revenue.beverageRevenue + revenue.alcoholRevenue) * operating.beverageCostRate;
  const packaging =
    (revenue.takeawayRevenue + revenue.deliveryRevenue) * operating.packagingCostRate;
  const platformCommissions = revenue.deliveryRevenue * operating.platformCommissionRate;
  const paymentFees = revenue.totalRevenue * operating.paymentFeeRate;

  return {
    foodPurchases,
    beveragePurchases,
    packaging,
    platformCommissions,
    paymentFees,
    total: foodPurchases + beveragePurchases + packaging + platformCommissions + paymentFees,
  };
}

export function calculateFixedCosts(operating: OperatingAssumptions): FixedCosts {
  const rent = operating.rentMonthly * 12;
  const rentCharges = operating.rentChargesMonthly * 12;
  const utilities = operating.utilitiesMonthly * 12;
  const insurance = operating.insuranceMonthly * 12;
  const accounting = operating.accountingMonthly * 12;
  const software = operating.softwareMonthly * 12;
  const telecom = operating.telecomMonthly * 12;
  const cleaning = operating.cleaningMonthly * 12;
  const maintenance = operating.maintenanceMonthly * 12;
  const marketing = operating.marketingMonthly * 12;
  const banking = operating.bankingMonthly * 12;
  const taxesAndDuties = operating.taxesAndDutiesMonthly * 12;
  const miscellaneous = operating.miscellaneousMonthly * 12;

  const total =
    rent +
    rentCharges +
    utilities +
    insurance +
    accounting +
    software +
    telecom +
    cleaning +
    maintenance +
    marketing +
    banking +
    taxesAndDuties +
    miscellaneous;

  return {
    rent,
    rentCharges,
    utilities,
    insurance,
    accounting,
    software,
    telecom,
    cleaning,
    maintenance,
    marketing,
    banking,
    taxesAndDuties,
    miscellaneous,
    total,
  };
}

export function calculateDepreciation(input: SimulationInput): DepreciationBreakdown {
  const { capex, usefulLife } = input;

  const kitchenEquipment = capex.kitchenEquipment / usefulLife.kitchenEquipment;
  const furniture = capex.furniture / usefulLife.furniture;
  const fitout = capex.fitout / usefulLife.fitout;
  const pos = capex.pos / usefulLife.pos;
  const signage = capex.signage / usefulLife.signage;
  const otherEquipment = capex.otherEquipment / usefulLife.otherEquipment;

  const total =
    kitchenEquipment + furniture + fitout + pos + signage + otherEquipment;

  return {
    kitchenEquipment,
    furniture,
    fitout,
    pos,
    signage,
    otherEquipment,
    total,
  };
}

/**
 * Coût du financement sur une année d'exploitation « de croisière ».
 *
 * L'amortissement du capital étant linéaire, l'encours moyen sur la durée du
 * prêt vaut dette × (n + 1) / (2n). Retenir cet encours plutôt que la dette
 * initiale évite de surestimer les intérêts sur toute la durée du prêt.
 */
export function calculateFinancingCosts(input: SimulationInput): FinancingCosts {
  const { debt, interestRate, loanDurationYears } = input.financing;

  if (debt <= 0 || loanDurationYears <= 0) {
    return {
      annualInterest: 0,
      annualPrincipalRepayment: 0,
      averageOutstandingDebt: 0,
      totalInterestOverLoan: 0,
    };
  }

  const averageOutstandingDebt = (debt * (loanDurationYears + 1)) / (2 * loanDurationYears);
  const annualInterest = averageOutstandingDebt * interestRate;

  return {
    annualInterest,
    annualPrincipalRepayment: debt / loanDurationYears,
    averageOutstandingDebt,
    totalInterestOverLoan: annualInterest * loanDurationYears,
  };
}

export function getTotalCapex(input: SimulationInput): number {
  const { capex } = input;
  return (
    capex.kitchenEquipment +
    capex.furniture +
    capex.fitout +
    capex.pos +
    capex.signage +
    capex.otherEquipment
  );
}

export function calculateCostsSnapshot(input: SimulationInput, occupancyRate?: number) {
  const revenue = calculateRevenue(input, occupancyRate);
  const variableCosts = calculateVariableCosts(revenue, input.operating);
  const laborCosts = calculateLaborCost(input.staff);
  const fixedCosts = calculateFixedCosts(input.operating);

  return {
    revenue,
    variableCosts,
    laborCosts,
    fixedCosts,
  };
}
