'use client';

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardHeader } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils/format';
import type { PnLResult } from '@/types/models';

const COLORS = ['#047857', '#0f766e', '#0369a1', '#f59e0b', '#64748b', '#10b981'];

export function CostStructureChart({ pnl }: { pnl: PnLResult }) {
  const ebitdaPositive = Math.max(0, pnl.ebitda);
  const data = [
    { name: 'Matières', value: pnl.variableCosts.total },
    { name: 'Personnel', value: pnl.laborCosts.totalEmployerCost },
    { name: 'Loyer', value: pnl.fixedCosts.rent + pnl.fixedCosts.rentCharges },
    { name: 'Énergie', value: pnl.fixedCosts.utilities },
    { name: 'Autres fixes', value: pnl.fixedCosts.total - pnl.fixedCosts.rent - pnl.fixedCosts.rentCharges - pnl.fixedCosts.utilities },
    { name: 'EBITDA', value: ebitdaPositive },
  ].filter((item) => item.value > 0);

  return (
    <Card>
      <CardHeader title="Structure des coûts" subtitle="Répartition annuelle" />
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} paddingAngle={2}>
              {data.map((entry, index) => (
                <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => formatCurrency(Number(value ?? 0), true)} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
