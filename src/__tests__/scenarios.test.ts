import { describe, expect, it } from 'vitest';
import { BENCHMARKS, TICKET_BY_TYPE, getTicketBenchmark } from '@/data/france-benchmarks';
import { DEMO_SCENARIOS } from '@/data/presets';
import { runSimulation } from '@/lib/engine';
import type { SimulationInput } from '@/types/models';

/**
 * Cohérence économique des scénarios de référence : les ratios doivent rester
 * dans les fourchettes observées par l'Observatoire FIDUCIAL de la restauration.
 */
const REFERENCE_CASES = [
  { label: 'petit restaurant parisien', input: DEMO_SCENARIOS.parisBistro },
  { label: 'restaurant traditionnel en ville moyenne', input: DEMO_SCENARIOS.mediumCityTraditional },
  { label: 'fast food', input: DEMO_SCENARIOS.fastFood },
] as const;

describe.each(REFERENCE_CASES)('scénario : $label', ({ input }) => {
  const result = runSimulation(input);
  const { pnl, ratios, breakEven } = result;

  it('dégage un chiffre d’affaires strictement positif', () => {
    expect(pnl.revenue.totalRevenue).toBeGreaterThan(0);
    expect(pnl.revenue.coversPerDay).toBeGreaterThan(0);
  });

  it('place le coût matière dans la fourchette du secteur', () => {
    expect(ratios.foodCostShare).toBeGreaterThan(0.2);
    expect(ratios.foodCostShare).toBeLessThan(0.4);
  });

  it('place la masse salariale dans la fourchette du secteur', () => {
    expect(ratios.laborShare).toBeGreaterThanOrEqual(BENCHMARKS.laborCostShare.low - 0.02);
    expect(ratios.laborShare).toBeLessThanOrEqual(BENCHMARKS.laborCostShare.high + 0.02);
  });

  it('garde le prime cost sous le seuil de viabilité', () => {
    expect(ratios.primeCost).toBeLessThan(0.78);
  });

  it('atteint un point mort réalisable', () => {
    expect(breakEven.isAchievable).toBe(true);
    expect(breakEven.breakEvenOccupancy).toBeGreaterThan(0.2);
    expect(breakEven.breakEvenOccupancy).toBeLessThan(0.9);
  });

  it('dégage un EBITDA positif aux hypothèses par défaut', () => {
    expect(pnl.ebitda).toBeGreaterThan(0);
  });

  it('ordonne correctement les soldes intermédiaires', () => {
    expect(pnl.grossMargin).toBeGreaterThan(pnl.ebitda);
    expect(pnl.ebitda).toBeGreaterThanOrEqual(pnl.operatingResult);
    expect(pnl.operatingResult).toBeGreaterThanOrEqual(pnl.preTaxIncome);
    expect(pnl.netIncome).toBeLessThanOrEqual(pnl.preTaxIncome);
  });
});

describe('monotonie du modèle', () => {
  const input = DEMO_SCENARIOS.lyonTraditional;

  it('améliore le résultat quand le remplissage augmente', () => {
    const curve = runSimulation(input).occupancyCurve;

    for (let index = 1; index < curve.length; index += 1) {
      expect(curve[index].netIncome).toBeGreaterThan(curve[index - 1].netIncome);
      expect(curve[index].revenue).toBeGreaterThan(curve[index - 1].revenue);
    }
  });

  it('dégrade le résultat quand le loyer augmente', () => {
    const pricier: SimulationInput = {
      ...input,
      operating: { ...input.operating, rentMonthly: input.operating.rentMonthly * 2 },
    };

    expect(runSimulation(pricier).pnl.netIncome).toBeLessThan(runSimulation(input).pnl.netIncome);
  });
});

describe('scénarios pessimiste / base / optimiste', () => {
  const { scenarios } = runSimulation(DEMO_SCENARIOS.lyonTraditional);
  const [pessimistic, base, optimistic] = scenarios;

  it('produit les trois cas dans l’ordre attendu', () => {
    expect(scenarios.map((scenario) => scenario.id)).toEqual([
      'pessimistic',
      'base',
      'optimistic',
    ]);
  });

  it('encadre le cas central', () => {
    expect(pessimistic.pnl.netIncome).toBeLessThan(base.pnl.netIncome);
    expect(optimistic.pnl.netIncome).toBeGreaterThan(base.pnl.netIncome);
  });

  it('exige un point mort plus élevé dans le cas pessimiste', () => {
    expect(pessimistic.breakEven.breakEvenOccupancy).toBeGreaterThan(
      optimistic.breakEven.breakEvenOccupancy,
    );
  });
});

describe('drivers de rentabilité', () => {
  const { drivers } = runSimulation(DEMO_SCENARIOS.lyonTraditional);

  it('couvre les cinq leviers attendus', () => {
    expect(drivers.map((driver) => driver.id).sort()).toEqual([
      'food_cost',
      'labor',
      'occupancy',
      'rent',
      'ticket',
    ]);
  });

  it('trie par impact décroissant en valeur absolue', () => {
    const impacts = drivers.map((driver) => Math.abs(driver.impact));
    expect([...impacts].sort((a, b) => b - a)).toEqual(impacts);
  });

  it('oriente correctement chaque levier', () => {
    const byId = Object.fromEntries(drivers.map((driver) => [driver.id, driver.impact]));

    expect(byId.occupancy).toBeGreaterThan(0);
    expect(byId.ticket).toBeGreaterThan(0);
    expect(byId.food_cost).toBeLessThan(0);
    expect(byId.labor).toBeLessThan(0);
    expect(byId.rent).toBeLessThan(0);
  });
});

describe('matrice de sensibilité', () => {
  const { sensitivity, pnl } = runSimulation(DEMO_SCENARIOS.lyonTraditional);

  it('encadre le scénario courant', () => {
    const occupancies = sensitivity.map((cell) => cell.occupancy);
    const tickets = sensitivity.map((cell) => cell.ticket);
    const currentOccupancy = DEMO_SCENARIOS.lyonTraditional.profile.occupancyRate;

    expect(Math.min(...occupancies)).toBeLessThan(currentOccupancy);
    expect(Math.max(...occupancies)).toBeGreaterThan(currentOccupancy);
    expect(Math.min(...tickets)).toBeLessThan(pnl.revenue.averageTicketTTC);
    expect(Math.max(...tickets)).toBeGreaterThan(pnl.revenue.averageTicketTTC);
  });

  it('croît avec le ticket moyen à remplissage constant', () => {
    const row = sensitivity
      .filter((cell) => cell.occupancy === sensitivity[0].occupancy)
      .sort((a, b) => a.ticket - b.ticket);

    for (let index = 1; index < row.length; index += 1) {
      expect(row[index].netIncome).toBeGreaterThan(row[index - 1].netIncome);
    }
  });
});

describe('effet de la localisation', () => {
  it('renchérit le ticket à Paris et l’allège en ville moyenne', () => {
    const paris = getTicketBenchmark('traditional', 'paris', 'city_center').value;
    const national = TICKET_BY_TYPE.traditional.value;
    const mediumCity = getTicketBenchmark('traditional', 'medium_city', 'periphery').value;

    expect(paris).toBeGreaterThan(national);
    expect(mediumCity).toBeLessThan(national);
  });

  it('laisse le centre-ville d’une ville de référence au niveau du benchmark', () => {
    expect(getTicketBenchmark('traditional', 'marseille', 'city_center').value).toBe(
      TICKET_BY_TYPE.traditional.value,
    );
  });

  it('atténue l’écart territorial pour la restauration rapide', () => {
    const ecart = (type: 'traditional' | 'fast_food') => {
      const base = TICKET_BY_TYPE[type].value;
      return getTicketBenchmark(type, 'paris', 'premium_center').value / base - 1;
    };

    expect(ecart('fast_food')).toBeGreaterThan(0);
    expect(ecart('fast_food')).toBeLessThan(ecart('traditional'));
  });

  it('signale l’ajustement comme une hypothèse et non comme un benchmark', () => {
    expect(getTicketBenchmark('traditional', 'paris', 'city_center').type).toBe('hypothesis');
  });
});

describe('insights', () => {
  it('alerte sur un loyer disproportionné', () => {
    const input = DEMO_SCENARIOS.lyonTraditional;
    const { insights } = runSimulation({
      ...input,
      operating: { ...input.operating, rentMonthly: input.operating.rentMonthly * 3 },
    });

    expect(insights.some((insight) => insight.id === 'rent-high')).toBe(true);
  });

  it('salue une marge nette confortable', () => {
    const { insights, pnl } = runSimulation(DEMO_SCENARIOS.mediumCityTraditional);

    expect(pnl.netMargin).toBeGreaterThan(0.08);
    expect(insights.some((insight) => insight.id === 'net-margin-good')).toBe(true);
  });

  it('détecte un salaire sous le minimum applicable', () => {
    const input = DEMO_SCENARIOS.lyonTraditional;
    const { insights } = runSimulation({
      ...input,
      staff: input.staff.map((member) => ({ ...member, grossMonthlySalary: 1200 })),
    });

    expect(insights.some((insight) => insight.id === 'salary-below-minimum')).toBe(true);
  });
});
