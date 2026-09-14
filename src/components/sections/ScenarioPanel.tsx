'use client';

import { Card, CardHeader } from '@/components/ui/Card';
import { formatCurrency, formatPercent } from '@/lib/utils/format';
import type { ScenarioResult } from '@/types/models';

export function ScenarioPanel({ scenarios }: { scenarios: ScenarioResult[] }) {
  return (
    <Card>
      <CardHeader title="Scénarios" subtitle="Pessimiste / Base / Optimiste" />
      <div className="grid gap-4 lg:grid-cols-3">
        {scenarios.map((scenario) => (
          <div key={scenario.id} className="rounded-2xl border border-slate-200 p-4">
            <h4 className="text-base font-semibold text-slate-900">{scenario.label}</h4>
            <div className="mt-4 space-y-2 text-sm">
              <Row label="CA" value={formatCurrency(scenario.pnl.revenue.totalRevenue, true)} />
              <Row label="EBITDA" value={formatCurrency(scenario.pnl.ebitda, true)} />
              <Row label="Résultat net" value={formatCurrency(scenario.pnl.netIncome, true)} />
              <Row label="Marge nette" value={formatPercent(scenario.pnl.netMargin)} />
              <Row label="Break-even" value={formatPercent(scenario.breakEven.breakEvenOccupancy)} />
              <Row label="Cash-flow" value={formatCurrency(scenario.cashFlow.operatingCashFlow, true)} />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-800">{value}</span>
    </div>
  );
}
