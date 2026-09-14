'use client';

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardHeader } from '@/components/ui/Card';
import { formatCurrency, formatPercent } from '@/lib/utils/format';
import type { SimulationResult } from '@/types/models';

export function OccupancyChart({ result }: { result: SimulationResult }) {
  const data = result.occupancyCurve.map((point) => ({
    occupancy: Math.round(point.occupancy * 100),
    netIncome: point.netIncome,
    ebitda: point.ebitda,
  }));

  const breakEvenPercent = Math.round(result.breakEven.breakEvenOccupancy * 100);

  return (
    <Card>
      <CardHeader
        title="Rentabilité selon le taux de remplissage"
        subtitle="Résultat net et EBITDA de 10 % à 100 %"
      />
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="occupancy" tickFormatter={(value) => `${value}%`} />
            <YAxis tickFormatter={(value) => formatCurrency(value, true)} />
            <Tooltip
              formatter={(value) => formatCurrency(Number(value ?? 0), true)}
              labelFormatter={(label) => `Remplissage ${label}%`}
            />
            <Legend />
            <ReferenceLine x={breakEvenPercent} stroke="#f59e0b" strokeDasharray="4 4" label="Break-even" />
            <ReferenceLine y={0} stroke="#94a3b8" />
            <Line type="monotone" dataKey="netIncome" name="Résultat net" stroke="#047857" strokeWidth={3} dot={false} />
            <Line type="monotone" dataKey="ebitda" name="EBITDA" stroke="#0f766e" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-2 text-sm text-slate-500">
        Seuil de rentabilité estimé : {formatPercent(result.breakEven.breakEvenOccupancy)} de remplissage.
      </p>
    </Card>
  );
}
