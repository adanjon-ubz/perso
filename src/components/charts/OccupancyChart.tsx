'use client';

import {
  Area,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ReferenceLine,
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
  tooltipEuro,
  tooltipOccupancyLabel,
} from '@/components/charts/chart-theme';
import type { SimulationResult } from '@/types/models';

/** Graphique 1 — rentabilité selon le taux de remplissage. */
export function OccupancyChart({ result }: { result: SimulationResult }) {
  const { occupancyCurve, breakEven } = result;

  return (
    <Card>
      <CardHeader
        title="Rentabilité selon le taux de remplissage"
        subtitle="Résultat net et EBITDA de 10 % à 100 % de remplissage, à structure de coûts constante."
      />
      <div className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={occupancyCurve} margin={{ top: 8, right: 12, left: 4, bottom: 4 }}>
            <defs>
              <linearGradient id="netIncomeFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={CHART_COLORS.netIncome} stopOpacity={0.3} />
                <stop offset="100%" stopColor={CHART_COLORS.netIncome} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} vertical={false} />
            <XAxis
              dataKey="occupancy"
              tickFormatter={(value: number) => `${Math.round(value * 100)} %`}
              tick={{ fontSize: 11 }}
            />
            <YAxis tickFormatter={formatAxisEuro} tick={{ fontSize: 11 }} width={56} />
            <Tooltip
              contentStyle={CHART_TOOLTIP_STYLE}
              formatter={tooltipEuro}
              labelFormatter={tooltipOccupancyLabel}
            />
            <ReferenceLine y={0} stroke={CHART_COLORS.negative} strokeDasharray="5 5" />
            {breakEven.isAchievable ? (
              <ReferenceLine
                x={Math.round(breakEven.breakEvenOccupancy * 20) / 20}
                stroke={CHART_COLORS.reference}
                strokeDasharray="4 4"
                label={{ value: 'Point mort', fontSize: 11, position: 'insideTopLeft' }}
              />
            ) : null}
            <Area
              type="monotone"
              dataKey="netIncome"
              name="Résultat net"
              stroke={CHART_COLORS.netIncome}
              fill="url(#netIncomeFill)"
              strokeWidth={3}
            />
            <Line
              type="monotone"
              dataKey="ebitda"
              name="EBITDA"
              stroke={CHART_COLORS.ebitda}
              strokeWidth={2}
              dot={false}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
