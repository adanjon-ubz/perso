import { calculateBreakEven } from '@/lib/engine/break-even';
import { calculateCashFlow, calculatePnL } from '@/lib/engine/pnl';
import { getAverageTicketTTC } from '@/lib/engine/revenue';
import type { ScenarioResult, SimulationInput } from '@/types/models';

function cloneInput(input: SimulationInput): SimulationInput {
  return JSON.parse(JSON.stringify(input)) as SimulationInput;
}

export function calculateScenarios(input: SimulationInput): ScenarioResult[] {
  const pessimistic = cloneInput(input);
  pessimistic.profile.occupancyRate = Math.max(0.2, input.profile.occupancyRate - 0.12);
  pessimistic.profile.ticketBreakdown = scaleTicket(
    pessimistic.profile.ticketBreakdown,
    getAverageTicketTTC(input.profile) * 0.92,
  );
  pessimistic.operating.foodCostRate += 0.03;
  pessimistic.staff = pessimistic.staff.map((member) => ({
    ...member,
    grossMonthlySalary: member.grossMonthlySalary * 1.05,
  }));

  const optimistic = cloneInput(input);
  optimistic.profile.occupancyRate = Math.min(1, input.profile.occupancyRate + 0.1);
  optimistic.profile.ticketBreakdown = scaleTicket(
    optimistic.profile.ticketBreakdown,
    getAverageTicketTTC(input.profile) * 1.08,
  );
  optimistic.operating.foodCostRate = Math.max(0.2, input.operating.foodCostRate - 0.02);
  optimistic.operating.marketingMonthly *= 1.2;

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
