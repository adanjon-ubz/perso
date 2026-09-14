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

export function calculateFinancingCosts(input: SimulationInput): FinancingCosts {
  const { financing } = input;
  const annualInterest = financing.debt * financing.interestRate;
  const annualPrincipalRepayment =
    financing.loanDurationYears > 0 ? financing.debt / financing.loanDurationYears : 0;

  return {
    annualInterest,
    annualPrincipalRepayment,
    remainingDebt: Math.max(0, financing.debt - annualPrincipalRepayment),
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
