'use client';

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardHeader } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils/format';
import type { SimulationResult } from '@/types/models';

export function RevenueCoversChart({ result }: { result: SimulationResult }) {
  const chartData = result.occupancyCurve.map((point) => ({
    coversPerDay: Math.round(point.coversPerDay),
    revenue: point.revenue,
  }));

  return (
    <Card>
      <CardHeader title="CA selon le nombre de couverts" subtitle="Projection annuelle" />
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="coversPerDay" />
            <YAxis tickFormatter={(value) => formatCurrency(value, true)} />
            <Tooltip
              formatter={(value) => formatCurrency(Number(value ?? 0), true)}
              labelFormatter={(label) => `${label} couverts / jour`}
            />
            <Line type="monotone" dataKey="revenue" name="CA annuel" stroke="#0369a1" strokeWidth={3} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
