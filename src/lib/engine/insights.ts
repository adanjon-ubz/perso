import { BENCHMARKS } from '@/data/france-benchmarks';
import type { BreakEvenResult, Insight, PnLResult } from '@/types/models';

export function generateInsights(pnl: PnLResult, breakEven: BreakEvenResult): Insight[] {
  const insights: Insight[] = [];
  const revenue = pnl.revenue.totalRevenue;

  const laborShare = revenue > 0 ? pnl.laborCosts.totalEmployerCost / revenue : 0;
  const rentShare = revenue > 0 ? pnl.fixedCosts.rent / revenue : 0;
  const foodShare = revenue > 0 ? pnl.variableCosts.foodPurchases / revenue : 0;

  if (laborShare > 0.4) {
    insights.push({
      id: 'labor-high',
      level: 'warning',
      message:
        'Votre masse salariale est élevée par rapport aux benchmarks du secteur (33 % en moyenne FIDUCIAL).',
    });
  }

  if (rentShare > 0.1) {
    insights.push({
      id: 'rent-high',
      level: 'warning',
      message: 'Votre loyer représente une part importante du chiffre d’affaires (> 10 %).',
    });
  }

  if (breakEven.breakEvenOccupancy > 0.75) {
    insights.push({
      id: 'break-even-high',
      level: 'danger',
      message:
        'Votre modèle nécessite un niveau de fréquentation élevé pour être rentable (> 75 %).',
    });
  }

  if (pnl.netMargin > 0.08) {
    insights.push({
      id: 'net-margin-good',
      level: 'success',
      message:
        'Votre scénario présente une bonne rentabilité selon les hypothèses retenues (> 8 % de marge nette).',
    });
  } else if (pnl.netMargin < BENCHMARKS.netMargin.value) {
    insights.push({
      id: 'net-margin-low',
      level: 'info',
      message:
        'La marge nette est inférieure au benchmark indicatif du panel (5 % FIDUCIAL 2026).',
    });
  }

  if (foodShare > 0.35) {
    insights.push({
      id: 'food-cost-high',
      level: 'warning',
      message: 'Le coût matière dépasse la fourchette haute habituelle (35 % du CA).',
    });
  }

  if (pnl.ebitdaMargin < BENCHMARKS.ebitdaMargin.low) {
    insights.push({
      id: 'ebitda-low',
      level: 'warning',
      message: 'La marge EBITDA est inférieure aux benchmarks du secteur (8-22 %).',
    });
  }

  if (insights.length === 0) {
    insights.push({
      id: 'balanced',
      level: 'info',
      message: 'Le modèle paraît équilibré sur les principaux ratios de gestion.',
    });
  }

  return insights;
}
