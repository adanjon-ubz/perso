'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardHeader } from '@/components/ui/Card';
import { CHART_COLORS, CHART_TOOLTIP_STYLE, formatAxisEuro } from '@/components/charts/chart-theme';
import { formatCurrency } from '@/lib/utils/format';
import type { PnLResult } from '@/types/models';

interface WaterfallBar {
  name: string;
  /** Socle transparent qui positionne la barre flottante. */
  base: number;
  amount: number;
  delta: number;
  isTotal: boolean;
}

/** Graphique 4 — cascade du chiffre d'affaires jusqu'au résultat net. */
export function WaterfallChart({ pnl }: { pnl: PnLResult }) {
  const otherFixed = pnl.fixedCosts.total - pnl.fixedCosts.rent - pnl.fixedCosts.rentCharges;

  const steps: Array<{ name: string; delta: number; isTotal?: boolean }> = [
    { name: 'CA HT', delta: pnl.revenue.totalRevenue, isTotal: true },
    { name: 'Matières', delta: -pnl.variableCosts.total },
    { name: 'Personnel', delta: -pnl.laborCosts.totalEmployerCost },
    { name: 'Loyer', delta: -(pnl.fixedCosts.rent + pnl.fixedCosts.rentCharges) },
    { name: 'Autres charges', delta: -otherFixed },
    { name: 'EBITDA', delta: 0, isTotal: true },
    { name: 'Amortissements', delta: -pnl.depreciation.total },
    { name: 'Intérêts', delta: -pnl.financing.annualInterest },
    { name: 'Impôt', delta: -pnl.corporateTax },
    { name: 'Résultat net', delta: 0, isTotal: true },
  ];

  let running = 0;
  const data: WaterfallBar[] = steps.map((step) => {
    if (step.isTotal && step.name !== 'CA HT') {
      return { name: step.name, base: Math.min(0, running), amount: Math.abs(running), delta: running, isTotal: true };
    }

    const next = running + step.delta;
    const bar: WaterfallBar = {
      name: step.name,
      base: Math.min(running, next),
      amount: Math.abs(step.delta),
      delta: step.delta,
      isTotal: Boolean(step.isTotal),
    };
    running = next;
    return bar;
  });

  return (
    <Card>
      <CardHeader
        title="Du chiffre d'affaires au résultat net"
        subtitle="Contribution de chaque poste de charge au résultat final."
      />
      <div className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 12, left: 4, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-18} textAnchor="end" height={58} />
            <YAxis tickFormatter={formatAxisEuro} tick={{ fontSize: 11 }} width={56} />
            <Tooltip
              contentStyle={CHART_TOOLTIP_STYLE}
              cursor={{ fill: 'rgba(148, 163, 184, 0.12)' }}
              formatter={(_value, _name, entry) => [
                formatCurrency((entry.payload as WaterfallBar).delta, true),
                (entry.payload as WaterfallBar).isTotal ? 'Cumul' : 'Impact',
              ]}
            />
            <ReferenceLine y={0} stroke="#94a3b8" />
            <Bar dataKey="base" stackId="waterfall" fill="transparent" isAnimationActive={false} />
            <Bar dataKey="amount" stackId="waterfall" radius={[4, 4, 0, 0]}>
              {data.map((bar) => (
                <Cell
                  key={bar.name}
                  fill={
                    bar.isTotal
                      ? bar.delta >= 0
                        ? CHART_COLORS.reference
                        : CHART_COLORS.negative
                      : bar.delta >= 0
                        ? CHART_COLORS.netIncome
                        : CHART_COLORS.cost
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
