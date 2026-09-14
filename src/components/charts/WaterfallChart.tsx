'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardHeader } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils/format';
import type { PnLResult } from '@/types/models';

export function WaterfallChart({ pnl }: { pnl: PnLResult }) {
  const steps = [
    { name: 'CA', value: pnl.revenue.totalRevenue },
    { name: 'Matières', value: -pnl.variableCosts.total },
    { name: 'Personnel', value: -pnl.laborCosts.totalEmployerCost },
    { name: 'Loyer', value: -(pnl.fixedCosts.rent + pnl.fixedCosts.rentCharges) },
    { name: 'Autres', value: -(pnl.fixedCosts.total - pnl.fixedCosts.rent - pnl.fixedCosts.rentCharges) },
    { name: 'EBITDA', value: pnl.ebitda },
    { name: 'Amort.', value: -pnl.depreciation.total },
    { name: 'Intérêts', value: -pnl.financing.annualInterest },
    { name: 'Impôts', value: -pnl.corporateTax },
    { name: 'Net', value: pnl.netIncome },
  ];

  return (
    <Card>
      <CardHeader title="Waterfall P&L" subtitle="Du CA au résultat net" />
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={steps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" />
            <YAxis tickFormatter={(value) => formatCurrency(value, true)} />
            <Tooltip formatter={(value) => formatCurrency(Number(value ?? 0), true)} />
            <Bar dataKey="value">
              {steps.map((step) => (
                <Cell
                  key={step.name}
                  fill={step.value >= 0 ? '#047857' : '#e11d48'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
