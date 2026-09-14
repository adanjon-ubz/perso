'use client';

import { Card, CardHeader } from '@/components/ui/Card';
import { formatCurrency, formatPercent } from '@/lib/utils/format';
import type { SimulationResult } from '@/types/models';

export function ResultsPanel({ result }: { result: SimulationResult }) {
  const { pnl, breakEven, cashFlow, returnOnEquity } = result;
  const revenue = pnl.revenue.totalRevenueTTC;

  const ratios = [
    {
      label: 'Coût matière',
      value: revenue > 0 ? pnl.variableCosts.foodPurchases / revenue : 0,
    },
    {
      label: 'Masse salariale',
      value: revenue > 0 ? pnl.laborCosts.totalEmployerCost / revenue : 0,
    },
    {
      label: 'Loyer',
      value: revenue > 0 ? pnl.fixedCosts.rent / revenue : 0,
    },
  ];

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-emerald-700 to-emerald-900 text-white">
        <CardHeader title="Résultat estimé" subtitle="Projection annuelle" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Metric label="CA annuel" value={formatCurrency(revenue, true)} />
          <Metric label="EBITDA" value={formatCurrency(pnl.ebitda, true)} hint={formatPercent(pnl.ebitdaMargin)} />
          <Metric label="Résultat net" value={formatCurrency(pnl.netIncome, true)} hint={formatPercent(pnl.netMargin)} />
          <Metric label="Break-even" value={formatPercent(breakEven.breakEvenOccupancy)} hint={`${Math.round(breakEven.breakEvenCoversPerDay)} couverts / jour`} />
          <Metric label="Cash-flow opérationnel" value={formatCurrency(cashFlow.operatingCashFlow, true)} />
          <Metric label="Rentabilité capitaux" value={formatPercent(returnOnEquity)} />
        </div>
      </Card>

      <Card>
        <CardHeader title="Structure des coûts" subtitle="En % du chiffre d'affaires" />
        <div className="grid gap-3 md:grid-cols-3">
          {ratios.map((ratio) => (
            <div key={ratio.label} className="rounded-xl bg-slate-50 px-4 py-3">
              <p className="text-sm text-slate-500">{ratio.label}</p>
              <p className="text-2xl font-bold text-slate-900">{formatPercent(ratio.value)}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function Metric({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div>
      <p className="text-sm text-emerald-100">{label}</p>
      <p className="mt-1 text-3xl font-bold">{value}</p>
      {hint ? <p className="mt-1 text-sm text-emerald-100">{hint}</p> : null}
    </div>
  );
}
