import { describe, expect, it } from 'vitest';
import {
  GROSS_EMPLOYER_RATE,
  HCR_MEAL_BENEFIT,
  RGDU,
  SMIC_HOURLY_GROSS,
  SMIC_MONTHLY_GROSS,
  WORKED_DAYS_PER_YEAR,
  hcrMonthlyFloor,
} from '@/data/france-benchmarks';
import { DEMO_SCENARIOS, createDefaultSimulation } from '@/data/presets';
import {
  calculateBreakEven,
  calculateCashFlow,
  calculateCorporateTax,
  calculateCovers,
  calculateDepreciation,
  calculateEmployerCostRate,
  calculateFinancingCosts,
  calculateLaborCost,
  calculatePnL,
  calculateRevenue,
  calculateVariableCosts,
} from '@/lib/engine';
import { calculateRgduCoefficient, calculateStaffLine } from '@/lib/engine/labor';
import { getChannelMix } from '@/lib/engine/revenue';
import type { SimulationInput, StaffMember } from '@/types/models';

const baseInput = DEMO_SCENARIOS.lyonTraditional;

function withInput(patch: (draft: SimulationInput) => void): SimulationInput {
  const draft = JSON.parse(JSON.stringify(baseInput)) as SimulationInput;
  patch(draft);
  return draft;
}

describe('couverts', () => {
  it('enchaîne places, services, jours et semaines', () => {
    const covers = calculateCovers({
      ...baseInput.profile,
      seatingCapacity: 50,
      occupancyRate: 0.6,
      servicesPerDay: 2,
      openingDaysPerWeek: 6,
      openingWeeksPerYear: 50,
    });

    expect(covers.coversPerService).toBe(30);
    expect(covers.coversPerDay).toBe(60);
    expect(covers.coversPerWeek).toBe(360);
    expect(covers.annualCovers).toBe(18_000);
    expect(covers.openingDaysPerYear).toBe(300);
  });

  it('accepte un taux de remplissage ponctuel sans modifier le profil', () => {
    const covers = calculateCovers(baseInput.profile, 0.5);
    expect(covers.coversPerDay).toBe(baseInput.profile.seatingCapacity * 0.5 * 2);
  });
});

describe('chiffre d’affaires', () => {
  it('convertit les couverts en CA TTC puis HT', () => {
    const revenue = calculateRevenue(baseInput);
    const ticket = revenue.averageTicketTTC;

    expect(revenue.totalRevenueTTC).toBeCloseTo(revenue.annualCovers * ticket, 6);
    expect(revenue.totalRevenue).toBeLessThan(revenue.totalRevenueTTC);
    expect(revenue.vatCollected).toBeCloseTo(revenue.totalRevenueTTC - revenue.totalRevenue, 6);
  });

  it('répartit le CA entre salle, emporté et livraison sans en créer', () => {
    const input = withInput((draft) => {
      draft.profile.takeawayShare = 0.2;
      draft.profile.deliveryShare = 0.3;
    });
    const revenue = calculateRevenue(input);
    const sum =
      revenue.dineInRevenue + revenue.takeawayRevenue + revenue.deliveryRevenue;

    expect(sum).toBeCloseTo(revenue.totalRevenue, 6);
    expect(revenue.takeawayRevenue / revenue.totalRevenueTTC).toBeCloseTo(0.2 / 1.1, 3);
  });

  it('plafonne la part hors salle à 95 % du chiffre d’affaires', () => {
    const mix = getChannelMix({ ...baseInput.profile, takeawayShare: 0.6, deliveryShare: 0.6 });

    expect(mix.dineIn).toBeCloseTo(0.05, 6);
    expect(mix.takeaway + mix.delivery).toBeCloseTo(0.95, 6);
  });

  it('applique 20 % de TVA sur l’alcool et 10 % sur la nourriture', () => {
    const input = withInput((draft) => {
      draft.profile.takeawayShare = 0;
      draft.profile.deliveryShare = 0;
      draft.profile.ticketBreakdown = {
        food: 20,
        beverages: 0,
        alcohol: 10,
        dessert: 0,
        other: 0,
      };
    });
    const revenue = calculateRevenue(input);

    expect(revenue.foodRevenue).toBeCloseTo((revenue.annualCovers * 20) / 1.1, 4);
    expect(revenue.alcoholRevenue).toBeCloseTo((revenue.annualCovers * 10) / 1.2, 4);
  });
});

describe('coût matière', () => {
  it('applique le taux d’achat à chaque famille de revenus', () => {
    const revenue = calculateRevenue(baseInput);
    const variable = calculateVariableCosts(revenue, baseInput.operating);

    expect(variable.foodPurchases).toBeCloseTo(
      (revenue.foodRevenue + revenue.takeawayRevenue + revenue.deliveryRevenue) *
        baseInput.operating.foodCostRate,
      6,
    );
    expect(variable.beveragePurchases).toBeCloseTo(
      (revenue.beverageRevenue + revenue.alcoholRevenue) * baseInput.operating.beverageCostRate,
      6,
    );
  });

  it('ne facture la commission plateforme que sur la livraison', () => {
    const revenue = calculateRevenue(baseInput);
    const variable = calculateVariableCosts(revenue, baseInput.operating);

    expect(variable.platformCommissions).toBeCloseTo(
      revenue.deliveryRevenue * baseInput.operating.platformCommissionRate,
      6,
    );
  });
});

describe('coût employeur', () => {
  it('applique la formule RGDU officielle', () => {
    const annualGross = 24_000;
    const expected =
      RGDU.tMin +
      RGDU.tDelta *
        Math.pow(0.5 * ((3 * RGDU.annualReferenceSmic) / annualGross - 1), RGDU.exponent);

    expect(calculateRgduCoefficient(annualGross)).toBeCloseTo(Math.min(RGDU.maxCoefficient, expected), 10);
  });

  it('atteint le coefficient maximal au niveau du SMIC', () => {
    expect(calculateRgduCoefficient(RGDU.annualReferenceSmic)).toBeCloseTo(RGDU.maxCoefficient, 10);
  });

  it('supprime la réduction à partir de 3 SMIC', () => {
    expect(calculateRgduCoefficient(3 * RGDU.annualReferenceSmic)).toBe(0);
    expect(calculateEmployerCostRate((3 * RGDU.annualReferenceSmic) / 12)).toBeCloseTo(
      GROSS_EMPLOYER_RATE,
      10,
    );
  });

  it('reste dégressif entre le SMIC et 3 SMIC', () => {
    const atSmic = calculateEmployerCostRate(SMIC_MONTHLY_GROSS);
    const atMiddle = calculateEmployerCostRate(2800);
    const atHigh = calculateEmployerCostRate(4500);

    expect(atSmic).toBeLessThan(atMiddle);
    expect(atMiddle).toBeLessThan(atHigh);
    expect(atSmic).toBeGreaterThan(0.03);
    expect(atSmic).toBeLessThan(0.12);
  });
});

describe('masse salariale', () => {
  const member: StaffMember = {
    id: 'test',
    role: 'cook',
    count: 2,
    grossMonthlySalary: 2300,
    employmentType: 'full_time',
    weeklyHours: 35,
    mealsPerDay: 1,
  };

  it('calcule le brut annuel à partir du brut mensuel et des ETP', () => {
    const line = calculateStaffLine(member);

    expect(line.fte).toBe(2);
    expect(line.grossAnnualSalary).toBe(2300 * 12 * 2);
  });

  it('proratise le temps partiel', () => {
    const line = calculateStaffLine({ ...member, count: 1, weeklyHours: 17.5 });

    expect(line.fte).toBe(0.5);
    expect(line.grossAnnualSalary).toBe(2300 * 12 * 0.5);
  });

  it('valorise l’avantage nourriture au minimum garanti', () => {
    const line = calculateStaffLine({ ...member, count: 1, mealsPerDay: 2 });

    expect(line.mealBenefit).toBeCloseTo(2 * HCR_MEAL_BENEFIT * WORKED_DAYS_PER_YEAR, 6);
  });

  it('signale un salaire sous le minimum conventionnel', () => {
    const below = calculateStaffLine({ ...member, grossMonthlySalary: 1500 });
    const above = calculateStaffLine(member);

    expect(below.belowConventionalMinimum).toBe(true);
    expect(above.belowConventionalMinimum).toBe(false);
    expect(below.conventionalMinimum).toBeGreaterThanOrEqual(
      SMIC_HOURLY_GROSS * 151.67 - 0.01,
    );
  });

  it('agrège les lignes en total chargé', () => {
    const labor = calculateLaborCost([member, { ...member, id: 'b', role: 'waiter', count: 1 }]);

    expect(labor.lines).toHaveLength(2);
    expect(labor.totalHeadcount).toBe(3);
    expect(labor.totalEmployerCost).toBeGreaterThan(labor.totalGross);
  });

  it('respecte la primauté du SMIC sur la grille HCR', () => {
    // Le niveau I-1 conventionnel (12,00 €) est inférieur au SMIC 2026.
    expect(hcrMonthlyFloor('I', 1)).toBeCloseTo(SMIC_HOURLY_GROSS * 151.67, 2);
    expect(hcrMonthlyFloor('V', 3)).toBeGreaterThan(SMIC_MONTHLY_GROSS);
  });
});

describe('amortissements', () => {
  it('amortit chaque catégorie sur sa durée d’usage', () => {
    const input = withInput((draft) => {
      draft.capex = {
        kitchenEquipment: 70_000,
        furniture: 20_000,
        fitout: 50_000,
        pos: 5_000,
        signage: 5_000,
        otherEquipment: 10_000,
      };
      draft.usefulLife = {
        kitchenEquipment: 7,
        furniture: 10,
        fitout: 10,
        pos: 5,
        signage: 10,
        otherEquipment: 5,
      };
    });

    const depreciation = calculateDepreciation(input);

    expect(depreciation.kitchenEquipment).toBe(10_000);
    expect(depreciation.fitout).toBe(5_000);
    expect(depreciation.total).toBe(10_000 + 2_000 + 5_000 + 1_000 + 500 + 2_000);
  });
});

describe('financement', () => {
  it('calcule les intérêts sur l’encours moyen et amortit le capital', () => {
    const input = withInput((draft) => {
      draft.financing = { equity: 50_000, debt: 100_000, interestRate: 0.05, loanDurationYears: 10 };
    });

    const financing = calculateFinancingCosts(input);

    // Encours moyen d'un amortissement linéaire : 100 000 × 11 / 20 = 55 000.
    expect(financing.averageOutstandingDebt).toBe(55_000);
    expect(financing.annualInterest).toBeCloseTo(2_750, 6);
    expect(financing.annualPrincipalRepayment).toBe(10_000);
  });

  it('renvoie des flux nuls sans emprunt', () => {
    const input = withInput((draft) => {
      draft.financing = { equity: 100_000, debt: 0, interestRate: 0.05, loanDurationYears: 7 };
    });

    expect(calculateFinancingCosts(input).annualInterest).toBe(0);
  });
});

describe('impôt sur les sociétés', () => {
  it('applique le taux réduit puis le taux normal', () => {
    expect(calculateCorporateTax(30_000, 0.25, 0.15, 42_500)).toBeCloseTo(4_500, 6);
    expect(calculateCorporateTax(100_000, 0.25, 0.15, 42_500)).toBeCloseTo(
      42_500 * 0.15 + 57_500 * 0.25,
      6,
    );
  });

  it('n’impose pas un résultat déficitaire', () => {
    expect(calculateCorporateTax(-20_000, 0.25, 0.15, 42_500)).toBe(0);
  });
});

describe('compte de résultat', () => {
  it('enchaîne marge brute, EBITDA et résultat net', () => {
    const pnl = calculatePnL(baseInput);

    expect(pnl.grossMargin).toBeCloseTo(pnl.revenue.totalRevenue - pnl.variableCosts.total, 6);
    expect(pnl.ebitda).toBeCloseTo(
      pnl.grossMargin - pnl.laborCosts.totalEmployerCost - pnl.fixedCosts.total,
      6,
    );
    expect(pnl.operatingResult).toBeCloseTo(pnl.ebitda - pnl.depreciation.total, 6);
    expect(pnl.preTaxIncome).toBeCloseTo(
      pnl.operatingResult - pnl.financing.annualInterest,
      6,
    );
    expect(pnl.netIncome).toBeCloseTo(pnl.preTaxIncome - pnl.corporateTax, 6);
  });

  it('exclut le remboursement du capital du résultat', () => {
    const withLoan = calculatePnL(
      withInput((draft) => {
        draft.financing = { equity: 0, debt: 200_000, interestRate: 0, loanDurationYears: 5 };
      }),
    );

    expect(withLoan.financing.annualPrincipalRepayment).toBe(40_000);
    expect(withLoan.financing.annualInterest).toBe(0);
    expect(withLoan.preTaxIncome).toBeCloseTo(withLoan.operatingResult, 6);
  });

  it('réintègre les amortissements dans le cash-flow', () => {
    const pnl = calculatePnL(baseInput);
    const cashFlow = calculateCashFlow(baseInput, pnl);

    expect(cashFlow.operatingCashFlow).toBeCloseTo(pnl.netIncome + pnl.depreciation.total, 6);
    expect(cashFlow.freeCashFlow).toBeCloseTo(
      cashFlow.operatingCashFlow - pnl.financing.annualPrincipalRepayment,
      6,
    );
  });
});

describe('seuil de rentabilité', () => {
  it('annule le résultat avant impôt au taux de remplissage du point mort', () => {
    const breakEven = calculateBreakEven(baseInput);
    expect(breakEven.isAchievable).toBe(true);

    const atBreakEven = calculatePnL(baseInput, breakEven.breakEvenOccupancy);
    expect(Math.abs(atBreakEven.preTaxIncome)).toBeLessThan(1);
  });

  it('retrouve le CA d’équilibre par la marge sur coûts variables', () => {
    const breakEven = calculateBreakEven(baseInput);

    expect(breakEven.breakEvenRevenue).toBeCloseTo(
      breakEven.fixedCostBase / breakEven.contributionMarginRate,
      6,
    );
  });

  it('signale un modèle hors capacité plutôt que de plafonner à 100 %', () => {
    const unreachable = calculateBreakEven(
      withInput((draft) => {
        draft.operating.rentMonthly = 80_000;
      }),
    );

    expect(unreachable.isAchievable).toBe(false);
    expect(unreachable.breakEvenOccupancy).toBeGreaterThan(1);
  });

  it('reste cohérent entre couverts annuels et couverts par jour', () => {
    const breakEven = calculateBreakEven(baseInput);
    const openingDays =
      baseInput.profile.openingDaysPerWeek * baseInput.profile.openingWeeksPerYear;

    expect(breakEven.breakEvenCoversPerDay * openingDays).toBeCloseTo(
      breakEven.breakEvenCoversAnnual,
      4,
    );
  });
});

describe('cas limites', () => {
  it('ne produit pas de NaN sans activité', () => {
    const empty = createDefaultSimulation({ seatingCapacity: 0, occupancyRate: 0 });
    const pnl = calculatePnL(empty);

    expect(Number.isNaN(pnl.netIncome)).toBe(false);
    expect(pnl.revenue.totalRevenue).toBe(0);
    expect(pnl.netMargin).toBe(0);
  });
});
