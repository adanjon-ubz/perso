'use client';

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardHeader } from '@/components/ui/Card';
import {
  CHART_COLORS,
  CHART_TOOLTIP_STYLE,
  formatAxisEuro,
  tooltipCoversLabel,
  tooltipEuro,
} from '@/components/charts/chart-theme';
import { formatNumber, formatPercent } from '@/lib/utils/format';
import type { SimulationResult } from '@/types/models';

/** Graphique 2 — chiffre d'affaires et coûts totaux, croisement au point mort. */
export function BreakEvenChart({ result }: { result: SimulationResult }) {
  const { occupancyCurve, breakEven } = result;

  const data = occupancyCurve.map((point) => ({
    ...point,
    coversPerDay: Math.round(point.coversPerDay),
  }));

  return (
    <Card>
      <CardHeader
        title="Point mort"
        subtitle={
          breakEven.isAchievable
            ? `Équilibre à ${formatNumber(breakEven.breakEvenCoversPerDay)} couverts / jour, soit ${formatPercent(
                breakEven.breakEvenOccupancy,
                0,
              )} de remplissage.`
            : 'Les coûts totaux restent au-dessus du chiffre d’affaires sur toute la plage de remplissage.'
        }
      />
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 12, left: 4, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} vertical={false} />
            <XAxis
              dataKey="coversPerDay"
              tick={{ fontSize: 11 }}
              label={{ value: 'couverts / jour', position: 'insideBottom', offset: -2, fontSize: 11 }}
              height={40}
            />
            <YAxis tickFormatter={formatAxisEuro} tick={{ fontSize: 11 }} width={56} />
            <Tooltip
              contentStyle={CHART_TOOLTIP_STYLE}
              formatter={tooltipEuro}
              labelFormatter={tooltipCoversLabel}
            />
            <Line
              type="monotone"
              dataKey="revenue"
              name="Chiffre d'affaires"
              stroke={CHART_COLORS.revenue}
              strokeWidth={3}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="totalCosts"
              name="Coûts totaux"
              stroke={CHART_COLORS.cost}
              strokeWidth={3}
              dot={false}
            />
            {breakEven.isAchievable ? (
              <ReferenceDot
                x={Math.round(breakEven.breakEvenCoversPerDay)}
                y={breakEven.breakEvenRevenue}
                r={6}
                fill={CHART_COLORS.reference}
                stroke="#fff"
                strokeWidth={2}
              />
            ) : null}
            <Legend wrapperStyle={{ fontSize: 12 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
