import { describe, expect, it } from 'vitest';
import { DEMO_SCENARIOS } from '@/data/presets';
import {
  calculateBreakEven,
  calculateLaborCost,
  calculatePnL,
  calculateRevenue,
  runSimulation,
} from '@/lib/engine';
import {
  calculateDepreciation,
  calculateFinancingCosts,
  calculateVariableCosts,
} from '@/lib/engine/costs';
import { calculateEmployerCostRate } from '@/lib/engine/labor';
import { calculateCorporateTax } from '@/lib/engine/pnl';

describe('moteur financier', () => {
  it('calcule le chiffre d affaires et les couverts', () => {
    const input = DEMO_SCENARIOS.lyonTraditional;
    const revenue = calculateRevenue(input);

    expect(revenue.coversPerService).toBeCloseTo(input.profile.seatingCapacity * input.profile.occupancyRate);
    expect(revenue.coversPerDay).toBeCloseTo(revenue.coversPerService * input.profile.servicesPerDay);
    expect(revenue.annualCovers).toBeGreaterThan(0);
    const channelMultiplier = 1 + input.profile.takeawayShare + input.profile.deliveryShare;
    expect(revenue.totalRevenueTTC).toBeCloseTo(
      revenue.annualCovers * revenue.averageTicketTTC * channelMultiplier,
      0,
    );
  });

  it('calcule les coûts employeur avec une fourchette réaliste', () => {
    const rate = calculateEmployerCostRate(2100);
    expect(rate).toBeGreaterThanOrEqual(0.06);
    expect(rate).toBeLessThanOrEqual(0.46);

    const labor = calculateLaborCost(DEMO_SCENARIOS.lyonTraditional.staff);
    expect(labor.totalEmployerCost).toBeGreaterThan(labor.totalGross);
  });

  it('applique la réduction de charges de façon dégressive', () => {
    expect(calculateEmployerCostRate(1900)).toBeLessThan(
      calculateEmployerCostRate(3000),
    );
    expect(calculateEmployerCostRate(6000)).toBeCloseTo(0.46);
  });

  it('calcule le food cost sur le CA nourriture HT', () => {
    const input = DEMO_SCENARIOS.lyonTraditional;
    const revenue = calculateRevenue(input);
    const costs = calculateVariableCosts(revenue, input.operating);

    expect(costs.foodPurchases).toBeCloseTo(
      (revenue.foodRevenue + revenue.takeawayRevenue + revenue.deliveryRevenue) *
        input.operating.foodCostRate,
    );
  });

  it('calcule amortissements et intérêts séparément du principal', () => {
    const input = DEMO_SCENARIOS.lyonTraditional;
    const depreciation = calculateDepreciation(input);
    const financing = calculateFinancingCosts(input);

    expect(depreciation.total).toBeGreaterThan(0);
    expect(financing.annualInterest).toBeCloseTo(
      input.financing.debt * input.financing.interestRate,
    );
    expect(financing.annualPrincipalRepayment).toBeCloseTo(
      input.financing.debt / input.financing.loanDurationYears,
    );
  });

  it('applique le barème PME de l’impôt sur les sociétés', () => {
    expect(calculateCorporateTax(-10_000, 0.25, 0.15, 42_500)).toBe(0);
    expect(calculateCorporateTax(40_000, 0.25, 0.15, 42_500)).toBe(6_000);
    expect(calculateCorporateTax(50_000, 0.25, 0.15, 42_500)).toBe(8_250);
  });

  it('calcule un P&L cohérent pour le restaurant lyonnais', () => {
    const pnl = calculatePnL(DEMO_SCENARIOS.lyonTraditional);

    expect(pnl.revenue.totalRevenue).toBeGreaterThan(500_000);
    expect(pnl.grossMargin).toBeLessThan(pnl.revenue.totalRevenue);
    expect(pnl.ebitda).toBeLessThan(pnl.grossMargin);
    expect(pnl.netIncome).toBeLessThan(pnl.preTaxIncome);
  });

  it('calcule un break-even inférieur à 100 % de remplissage pour un modèle sain', () => {
    const breakEven = calculateBreakEven(DEMO_SCENARIOS.lyonTraditional);

    expect(breakEven.breakEvenOccupancy).toBeGreaterThan(0);
    expect(breakEven.breakEvenOccupancy).toBeLessThan(1);
    expect(breakEven.breakEvenCoversPerDay).toBeGreaterThan(0);
  });

  it('produit des scénarios économiquement ordonnés', () => {
    const result = runSimulation(DEMO_SCENARIOS.lyonTraditional);
    const pessimistic = result.scenarios.find((scenario) => scenario.id === 'pessimistic');
    const optimistic = result.scenarios.find((scenario) => scenario.id === 'optimistic');

    expect(pessimistic).toBeDefined();
    expect(optimistic).toBeDefined();
    expect(optimistic!.pnl.netIncome).toBeGreaterThan(pessimistic!.pnl.netIncome);
  });
});

describe('scénarios de démonstration', () => {
  it('petit restaurant parisien : CA élevé, loyer significatif', () => {
    const result = runSimulation(DEMO_SCENARIOS.parisTraditional);
    const rentShare = result.pnl.fixedCosts.rent / result.pnl.revenue.totalRevenue;

    expect(result.pnl.revenue.totalRevenue).toBeGreaterThan(600_000);
    expect(rentShare).toBeGreaterThan(0.03);
  });

  it('restaurant traditionnel ville moyenne : modèle plus accessible', () => {
    const result = runSimulation(DEMO_SCENARIOS.lyonTraditional);

    expect(result.breakEven.breakEvenOccupancy).toBeLessThan(0.85);
    expect(result.pnl.netMargin).toBeGreaterThan(-0.05);
  });

  it('fast food : ticket plus bas mais meilleur remplissage', () => {
    const result = runSimulation(DEMO_SCENARIOS.mediumCityFastFood);

    expect(result.pnl.revenue.averageTicketTTC).toBeLessThan(25);
    expect(result.pnl.revenue.coversPerDay).toBeGreaterThan(20);
  });
});
