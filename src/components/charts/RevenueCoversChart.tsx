'use client';

import {
  Area,
  AreaChart,
  CartesianGrid,
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
  tooltipCoversLabel,
  tooltipEuro,
} from '@/components/charts/chart-theme';
import { formatNumber } from '@/lib/utils/format';
import type { SimulationResult } from '@/types/models';

/** Graphique 5 — chiffre d'affaires annuel selon le nombre de couverts par jour. */
export function RevenueCoversChart({ result }: { result: SimulationResult }) {
  const data = result.occupancyCurve.map((point) => ({
    coversPerDay: Math.round(point.coversPerDay),
    revenue: point.revenue,
  }));

  const currentCovers = Math.round(result.ratios.coversPerDay);

  return (
    <Card>
      <CardHeader
        title="Chiffre d'affaires selon les couverts"
        subtitle={`Situation actuelle : ${formatNumber(currentCovers)} couverts / jour.`}
      />
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 12, left: 4, bottom: 4 }}>
            <defs>
              <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={CHART_COLORS.revenue} stopOpacity={0.25} />
                <stop offset="100%" stopColor={CHART_COLORS.revenue} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} vertical={false} />
            <XAxis dataKey="coversPerDay" tick={{ fontSize: 11 }} />
            <YAxis tickFormatter={formatAxisEuro} tick={{ fontSize: 11 }} width={56} />
            <Tooltip
              contentStyle={CHART_TOOLTIP_STYLE}
              formatter={tooltipEuro}
              labelFormatter={tooltipCoversLabel}
            />
            <ReferenceLine
              x={currentCovers}
              stroke={CHART_COLORS.reference}
              strokeDasharray="4 4"
              label={{ value: 'Votre hypothèse', fontSize: 11, position: 'insideTopRight' }}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              name="CA annuel HT"
              stroke={CHART_COLORS.revenue}
              fill="url(#revenueFill)"
              strokeWidth={3}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
