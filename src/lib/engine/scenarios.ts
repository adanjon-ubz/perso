import { calculateBreakEven } from '@/lib/engine/break-even';
import { calculateCashFlow, calculatePnL } from '@/lib/engine/pnl';
import { getAverageTicketTTC } from '@/lib/engine/revenue';
import type { ScenarioResult, SimulationInput } from '@/types/models';

function cloneInput(input: SimulationInput): SimulationInput {
  return JSON.parse(JSON.stringify(input)) as SimulationInput;
}

/**
 * Écarts appliqués aux hypothèses centrales pour construire les deux scénarios
 * encadrants. Ils restent volontairement modérés : l'objectif est de tester la
 * robustesse du modèle, pas de simuler une rupture d'activité.
 */
export const SCENARIO_DELTAS = {
  pessimistic: {
    occupancyPoints: -0.12,
    ticketFactor: 0.92,
    foodCostPoints: 0.03,
    salaryFactor: 1.05,
  },
  optimistic: {
    occupancyPoints: 0.1,
    ticketFactor: 1.08,
    foodCostPoints: -0.02,
    /** Meilleure productivité : même service avec moins d'heures payées. */
    hoursFactor: 0.95,
  },
} as const;

export function calculateScenarios(input: SimulationInput): ScenarioResult[] {
  const down = SCENARIO_DELTAS.pessimistic;
  const pessimistic = cloneInput(input);
  pessimistic.profile.occupancyRate = Math.max(
    0.05,
    input.profile.occupancyRate + down.occupancyPoints,
  );
  pessimistic.profile.ticketBreakdown = scaleTicket(
    pessimistic.profile.ticketBreakdown,
    getAverageTicketTTC(input.profile) * down.ticketFactor,
  );
  pessimistic.operating.foodCostRate += down.foodCostPoints;
  pessimistic.staff = pessimistic.staff.map((member) => ({
    ...member,
    grossMonthlySalary: member.grossMonthlySalary * down.salaryFactor,
  }));

  const up = SCENARIO_DELTAS.optimistic;
  const optimistic = cloneInput(input);
  optimistic.profile.occupancyRate = Math.min(1, input.profile.occupancyRate + up.occupancyPoints);
  optimistic.profile.ticketBreakdown = scaleTicket(
    optimistic.profile.ticketBreakdown,
    getAverageTicketTTC(input.profile) * up.ticketFactor,
  );
  optimistic.operating.foodCostRate = Math.max(
    0.1,
    input.operating.foodCostRate + up.foodCostPoints,
  );
  optimistic.staff = optimistic.staff.map((member) => ({
    ...member,
    weeklyHours: member.weeklyHours * up.hoursFactor,
  }));

  const definitions = [
    { id: 'pessimistic' as const, label: 'Pessimiste', data: pessimistic },
    { id: 'base' as const, label: 'Base', data: input },
    { id: 'optimistic' as const, label: 'Optimiste', data: optimistic },
  ];

  return definitions.map((scenario) => {
    const pnl = calculatePnL(scenario.data);
    const breakEven = calculateBreakEven(scenario.data);
    const cashFlow = calculateCashFlow(scenario.data, pnl);

    return {
      id: scenario.id,
      label: scenario.label,
      pnl,
      breakEven,
      cashFlow,
    };
  });
}

function scaleTicket(
  breakdown: SimulationInput['profile']['ticketBreakdown'],
  targetTotal: number,
) {
  const currentTotal =
    breakdown.food +
    breakdown.beverages +
    breakdown.alcohol +
    breakdown.dessert +
    breakdown.other;

  if (currentTotal <= 0) {
    return { ...breakdown, food: targetTotal };
  }

  const ratio = targetTotal / currentTotal;
  return {
    food: breakdown.food * ratio,
    beverages: breakdown.beverages * ratio,
    alcohol: breakdown.alcohol * ratio,
    dessert: breakdown.dessert * ratio,
    other: breakdown.other * ratio,
  };
}
