import { BENCHMARKS } from '@/data/france-benchmarks';
import type { BreakEvenResult, Insight, PnLResult } from '@/types/models';

const LEVEL_ORDER: Record<Insight['level'], number> = {
  danger: 0,
  warning: 1,
  success: 2,
  info: 3,
};

/**
 * Lecture automatique des ratios de gestion, comparés aux repères sectoriels.
 * Chaque message reste indicatif : il signale un écart, pas une erreur.
 */
export function generateInsights(pnl: PnLResult, breakEven: BreakEvenResult): Insight[] {
  const insights: Insight[] = [];
  const revenue = pnl.revenue.totalRevenue;

  if (revenue <= 0) {
    return [
      {
        id: 'no-revenue',
        level: 'info',
        message: 'Renseignez une capacité, un ticket moyen et un taux de remplissage pour lancer la simulation.',
      },
    ];
  }

  const laborShare = pnl.laborCosts.totalEmployerCost / revenue;
  const rentShare = pnl.fixedCosts.rent / revenue;
  const foodShare = pnl.variableCosts.foodPurchases / revenue;
  const primeCost = laborShare + pnl.variableCosts.total / revenue;

  if (!breakEven.isAchievable) {
    insights.push({
      id: 'break-even-unreachable',
      level: 'danger',
      message:
        'Le point mort n’est pas atteignable à pleine capacité : même à 100 % de remplissage, les charges ne sont pas couvertes. Revoyez le ticket moyen, la capacité ou la structure de coûts.',
    });
  } else if (breakEven.breakEvenOccupancy > 0.75) {
    insights.push({
      id: 'break-even-high',
      level: 'danger',
      message: `Votre modèle exige ${Math.round(
        breakEven.breakEvenOccupancy * 100,
      )} % de remplissage pour être rentable : c’est un niveau de fréquentation élevé, peu de marge d’erreur.`,
    });
  }

  if (pnl.laborCosts.hasSalaryBelowMinimum) {
    insights.push({
      id: 'salary-below-minimum',
      level: 'danger',
      message:
        'Au moins un salaire est inférieur au minimum applicable (SMIC ou minimum conventionnel HCR pour ce niveau de poste).',
    });
  }

  if (laborShare > 0.4) {
    insights.push({
      id: 'labor-high',
      level: 'warning',
      message: `Masse salariale à ${Math.round(laborShare * 100)} % du CA, au-dessus du repère sectoriel (${Math.round(
        BENCHMARKS.laborCostShare.value * 100,
      )} % en moyenne, jusqu’à ${Math.round(BENCHMARKS.laborCostShare.high * 100)} %).`,
    });
  }

  if (rentShare > 0.1) {
    insights.push({
      id: 'rent-high',
      level: 'warning',
      message: `Le loyer pèse ${Math.round(rentShare * 100)} % du chiffre d’affaires, contre ${Math.round(
        BENCHMARKS.rentShare.value * 100,
      )} % en moyenne dans le panel FIDUCIAL.`,
    });
  }

  if (foodShare > BENCHMARKS.foodCostTraditional.high) {
    insights.push({
      id: 'food-cost-high',
      level: 'warning',
      message: `Le coût matière atteint ${Math.round(
        foodShare * 100,
      )} % du CA, au-delà de la fourchette habituelle (26 % à 36 %).`,
    });
  }

  if (primeCost > BENCHMARKS.primeCostTarget.high) {
    insights.push({
      id: 'prime-cost-high',
      level: 'warning',
      message: `Coût matière et personnel cumulés à ${Math.round(
        primeCost * 100,
      )} % du CA : au-delà de 70 %, il reste peu de marge pour absorber le loyer et les charges fixes.`,
    });
  }

  if (pnl.ebitdaMargin < BENCHMARKS.ebitdaMargin.low) {
    insights.push({
      id: 'ebitda-low',
      level: 'warning',
      message: `Marge d’EBITDA de ${Math.round(pnl.ebitdaMargin * 100)} %, sous le repère sectoriel (${Math.round(
        BENCHMARKS.ebitdaMargin.low * 100,
      )} % à ${Math.round(BENCHMARKS.ebitdaMargin.high * 100)} %).`,
    });
  }

  if (pnl.netMargin > 0.08) {
    insights.push({
      id: 'net-margin-good',
      level: 'success',
      message: `Marge nette de ${Math.round(
        pnl.netMargin * 100,
      )} % : le scénario est confortablement rentable au regard des hypothèses retenues.`,
    });
  } else if (pnl.netIncome < 0) {
    insights.push({
      id: 'net-loss',
      level: 'danger',
      message: 'Le scénario est déficitaire : le résultat net est négatif avec ces hypothèses.',
    });
  }

  if (insights.length === 0) {
    insights.push({
      id: 'balanced',
      level: 'info',
      message: 'Les principaux ratios de gestion se situent dans les fourchettes du secteur.',
    });
  }

  return insights.sort((a, b) => LEVEL_ORDER[a.level] - LEVEL_ORDER[b.level]);
}
