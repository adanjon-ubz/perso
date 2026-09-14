'use client';

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardHeader } from '@/components/ui/Card';
import { CHART_TOOLTIP_STYLE, COST_STRUCTURE_COLORS } from '@/components/charts/chart-theme';
import { formatCurrency, formatPercent } from '@/lib/utils/format';
import type { PnLResult } from '@/types/models';

/** Graphique 3 — répartition du chiffre d'affaires entre les grands postes. */
export function CostStructureChart({ pnl }: { pnl: PnLResult }) {
  const revenue = pnl.revenue.totalRevenue;
  const otherFixed =
    pnl.fixedCosts.total - pnl.fixedCosts.rent - pnl.fixedCosts.rentCharges - pnl.fixedCosts.utilities;

  const data = [
    { name: 'Matières & variables', value: pnl.variableCosts.total, color: COST_STRUCTURE_COLORS.materials },
    { name: 'Personnel', value: pnl.laborCosts.totalEmployerCost, color: COST_STRUCTURE_COLORS.labor },
    {
      name: 'Loyer & charges',
      value: pnl.fixedCosts.rent + pnl.fixedCosts.rentCharges,
      color: COST_STRUCTURE_COLORS.rent,
    },
    { name: 'Énergie', value: pnl.fixedCosts.utilities, color: COST_STRUCTURE_COLORS.energy },
    { name: 'Autres charges', value: otherFixed, color: COST_STRUCTURE_COLORS.other },
    { name: 'EBITDA', value: Math.max(0, pnl.ebitda), color: COST_STRUCTURE_COLORS.ebitda },
  ].filter((item) => item.value > 0);

  const share = (value: number) => (revenue > 0 ? value / revenue : 0);

  return (
    <Card>
      <CardHeader
        title="Structure des coûts"
        subtitle={`Répartition de ${formatCurrency(revenue, true)} de chiffre d'affaires HT.`}
      />
      <div className="relative h-[280px]">
        {/* Le total est posé au centre de l'anneau plutôt que dans une légende. */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
            CA HT
          </span>
          <span className="text-lg font-semibold text-slate-800">
            {formatCurrency(revenue, true)}
          </span>
        </div>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={62}
              outerRadius={96}
              paddingAngle={2}
              label={({ value }) => (share(Number(value)) >= 0.05 ? formatPercent(share(Number(value)), 0) : '')}
              labelLine={false}
              isAnimationActive={false}
            >
              {data.map((item) => (
                <Cell key={item.name} fill={item.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={CHART_TOOLTIP_STYLE}
              formatter={(value: unknown) =>
                `${formatCurrency(Number(value), true)} · ${formatPercent(
                  revenue > 0 ? Number(value) / revenue : 0,
                  1,
                )}`
              }
            />
            <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
