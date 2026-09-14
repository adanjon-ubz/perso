import { calculateBreakEven } from '@/lib/engine/break-even';
import { calculatePnL } from '@/lib/engine/pnl';
import { getAverageTicketTTC } from '@/lib/engine/revenue';
import type { DriverImpact, SensitivityCell, SimulationInput } from '@/types/models';

export function calculateSensitivity(input: SimulationInput): SensitivityCell[] {
  const baseTicket = getAverageTicketTTC(input.profile);
  const tickets = [
    baseTicket - 6,
    baseTicket - 3,
    baseTicket,
    baseTicket + 3,
    baseTicket + 6,
  ].filter((ticket) => ticket > 0);

  const occupancies = [0.4, 0.5, 0.6, 0.7, 0.8];
  const cells: SensitivityCell[] = [];

  for (const occupancy of occupancies) {
    for (const ticket of tickets) {
      const adjustedInput: SimulationInput = {
        ...input,
        profile: {
          ...input.profile,
          ticketBreakdown: scaleTicketBreakdown(input.profile.ticketBreakdown, ticket),
        },
      };

      const pnl = calculatePnL(adjustedInput, occupancy);
      cells.push({
        occupancy,
        ticket,
        netIncome: pnl.netIncome,
      });
    }
  }

  return cells;
}

function scaleTicketBreakdown(
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

export function calculateDrivers(input: SimulationInput): DriverImpact[] {
  const base = calculatePnL(input);

  const scenarios: Array<{ id: string; label: string; mutate: (draft: SimulationInput) => void }> =
    [
      {
        id: 'occupancy',
        label: '+10 points de remplissage',
        mutate: (draft) => {
          draft.profile.occupancyRate = Math.min(1, draft.profile.occupancyRate + 0.1);
        },
      },
      {
        id: 'ticket',
        label: '+5 € de ticket moyen',
        mutate: (draft) => {
          draft.profile.ticketBreakdown = scaleTicketBreakdown(
            draft.profile.ticketBreakdown,
            getAverageTicketTTC(draft.profile) + 5,
          );
        },
      },
      {
        id: 'food_cost',
        label: '+5 % de coût matière',
        mutate: (draft) => {
          draft.operating.foodCostRate += 0.05;
        },
      },
      {
        id: 'labor',
        label: '+10 % de masse salariale',
        mutate: (draft) => {
          draft.staff = draft.staff.map((member) => ({
            ...member,
            grossMonthlySalary: member.grossMonthlySalary * 1.1,
          }));
        },
      },
      {
        id: 'rent',
        label: '+20 % de loyer',
        mutate: (draft) => {
          draft.operating.rentMonthly *= 1.2;
        },
      },
    ];

  const drivers = scenarios.map((scenario) => {
    const draft: SimulationInput = JSON.parse(JSON.stringify(input));
    scenario.mutate(draft);
    const result = calculatePnL(draft);
    const impact = result.netIncome - base.netIncome;

    return {
      id: scenario.id,
      label: scenario.label,
      impact,
      direction: impact >= 0 ? 'positive' : 'negative',
    } satisfies DriverImpact;
  });

  return drivers.sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));
}

export function calculateOccupancyCurve(input: SimulationInput) {
  const points = [];

  for (let occupancy = 0.1; occupancy <= 1; occupancy += 0.05) {
    const pnl = calculatePnL(input, occupancy);
    points.push({
      occupancy,
      netIncome: pnl.netIncome,
      ebitda: pnl.ebitda,
      revenue: pnl.revenue.totalRevenue,
      coversPerDay: pnl.revenue.coversPerDay,
    });
  }

  return points;
}

export function calculateBreakEvenCurve(input: SimulationInput) {
  const breakEven = calculateBreakEven(input);
  const points = calculateOccupancyCurve(input).map((point) => {
    const { revenue, variableCosts, laborCosts, fixedCosts } = calculatePnL(input, point.occupancy);
    const totalCosts =
      variableCosts.total + laborCosts.totalEmployerCost + fixedCosts.total;

    return {
      occupancy: point.occupancy,
      revenue: revenue.totalRevenue,
      totalCosts,
      netIncome: point.netIncome,
      breakEvenRevenue: breakEven.breakEvenRevenue,
    };
  });

  return points;
}
