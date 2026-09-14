'use client';

import { BarChart3 } from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/Card';
import { cn } from '@/lib/utils/cn';
import { formatCurrency, formatPercent } from '@/lib/utils/format';
import type { ScenarioResult } from '@/types/models';

const DESCRIPTIONS: Record<ScenarioResult['id'], string> = {
  pessimistic: '−12 points de remplissage, ticket −8 %, coût matière +3 points, salaires +5 %',
  base: 'Vos hypothèses telles que saisies',
  optimistic: '+10 points de remplissage, ticket +8 %, coût matière −2 points, heures −5 %',
};

/** Section D — comparaison des trois scénarios encadrants. */
export function ScenarioPanel({
  scenarios,
  activeId,
  onSelect,
}: {
  scenarios: ScenarioResult[];
  activeId: ScenarioResult['id'];
  onSelect: (id: ScenarioResult['id']) => void;
}) {
  const active = scenarios.find((scenario) => scenario.id === activeId) ?? scenarios[1];

  const metrics = [
    { label: "Chiffre d'affaires", value: formatCurrency(active.pnl.revenue.totalRevenue, true) },
    { label: 'EBITDA', value: formatCurrency(active.pnl.ebitda, true) },
    { label: 'Résultat net', value: formatCurrency(active.pnl.netIncome, true) },
    { label: 'Marge nette', value: formatPercent(active.pnl.netMargin) },
    {
      label: 'Point mort',
      value: active.breakEven.isAchievable
        ? formatPercent(active.breakEven.breakEvenOccupancy, 0)
        : 'Hors capacité',
    },
    { label: 'Cash-flow disponible', value: formatCurrency(active.cashFlow.freeCashFlow, true) },
  ];

  return (
    <Card>
      <CardHeader
        title="Scénarios"
        subtitle={DESCRIPTIONS[active.id]}
        action={<BarChart3 className="text-slate-300" size={19} />}
      />

      <div className="mb-5 grid grid-cols-3 gap-2">
        {scenarios.map((scenario) => (
          <button
            key={scenario.id}
            type="button"
            onClick={() => onSelect(scenario.id)}
            className={cn(
              'rounded-xl px-3 py-2.5 text-sm font-semibold transition',
              scenario.id === activeId
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
            )}
          >
            {scenario.label}
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {metrics.map((metric) => (
          <div key={metric.label} className="rounded-xl bg-slate-50 p-3.5">
            <p className="text-xs font-medium text-slate-500">{metric.label}</p>
            <p className="mt-1 text-lg font-bold tabular-nums text-slate-900">{metric.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[440px] text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-slate-400">
              <th className="py-2 font-semibold">Scénario</th>
              <th className="py-2 text-right font-semibold">CA</th>
              <th className="py-2 text-right font-semibold">EBITDA</th>
              <th className="py-2 text-right font-semibold">Résultat net</th>
              <th className="py-2 text-right font-semibold">Point mort</th>
            </tr>
          </thead>
          <tbody>
            {scenarios.map((scenario) => (
              <tr key={scenario.id} className="border-t border-slate-100">
                <td className="py-2 font-medium text-slate-700">{scenario.label}</td>
                <td className="py-2 text-right tabular-nums">
                  {formatCurrency(scenario.pnl.revenue.totalRevenue, true)}
                </td>
                <td className="py-2 text-right tabular-nums">
                  {formatCurrency(scenario.pnl.ebitda, true)}
                </td>
                <td
                  className={cn(
                    'py-2 text-right font-semibold tabular-nums',
                    scenario.pnl.netIncome < 0 ? 'text-rose-600' : 'text-emerald-700',
                  )}
                >
                  {formatCurrency(scenario.pnl.netIncome, true)}
                </td>
                <td className="py-2 text-right tabular-nums">
                  {scenario.breakEven.isAchievable
                    ? formatPercent(scenario.breakEven.breakEvenOccupancy, 0)
                    : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
