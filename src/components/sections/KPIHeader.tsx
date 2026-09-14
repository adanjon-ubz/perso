'use client';

import { KPI } from '@/components/ui/KPI';
import { formatCurrency, formatNumber, formatPercent } from '@/lib/utils/format';
import type { SimulationResult } from '@/types/models';

export function KPIHeader({ result }: { result: SimulationResult }) {
  const { pnl, breakEven } = result;
  const revenue = pnl.revenue.totalRevenueTTC;

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
      <KPI label="CA annuel" value={formatCurrency(revenue, true)} hint={`${formatCurrency(revenue / 12, true)} / mois`} />
      <KPI
        label="EBITDA"
        value={formatCurrency(pnl.ebitda, true)}
        hint={formatPercent(pnl.ebitdaMargin)}
        tone={pnl.ebitda >= 0 ? 'positive' : 'negative'}
      />
      <KPI
        label="Résultat net"
        value={formatCurrency(pnl.netIncome, true)}
        hint={formatPercent(pnl.netMargin)}
        tone={pnl.netIncome >= 0 ? 'positive' : 'negative'}
      />
      <KPI
        label="Couverts / jour"
        value={formatNumber(pnl.revenue.coversPerDay, 0)}
        hint={`Ticket ${formatCurrency(pnl.revenue.averageTicketTTC)}`}
      />
      <KPI
        label="Break-even"
        value={formatPercent(breakEven.breakEvenOccupancy)}
        hint={`${formatNumber(breakEven.breakEvenCoversPerDay, 0)} couverts / jour`}
        tone={breakEven.breakEvenOccupancy > 0.75 ? 'warning' : 'default'}
      />
    </div>
  );
}
