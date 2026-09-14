'use client';

import { Card, CardHeader } from '@/components/ui/Card';
import { formatCurrency, formatPercent } from '@/lib/utils/format';
import type { PnLResult } from '@/types/models';

function Line({
  label,
  value,
  emphasis = false,
  negative = false,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
  negative?: boolean;
}) {
  return (
    <div className={`flex items-center justify-between py-2 ${emphasis ? 'border-t border-slate-200 pt-3 font-semibold' : ''}`}>
      <span className={emphasis ? 'text-slate-900' : 'text-slate-600'}>{label}</span>
      <span className={negative ? 'text-rose-600' : emphasis ? 'text-slate-900' : 'text-slate-800'}>{value}</span>
    </div>
  );
}

export function PnLPanel({ pnl }: { pnl: PnLResult }) {
  const revenue = pnl.revenue.totalRevenue;

  return (
    <Card>
      <CardHeader title="P&L simplifié" subtitle="Compte de résultat annuel estimatif" />
      <div className="space-y-1 text-sm">
        <Line label="CA nourriture" value={formatCurrency(pnl.revenue.foodRevenue)} />
        <Line label="CA boissons" value={formatCurrency(pnl.revenue.beverageRevenue + pnl.revenue.alcoholRevenue)} />
        <Line label="CA takeaway" value={formatCurrency(pnl.revenue.takeawayRevenue)} />
        <Line label="CA livraison" value={formatCurrency(pnl.revenue.deliveryRevenue)} />
        <Line label="CA total" value={formatCurrency(revenue)} emphasis />

        <Line label="Achats matières" value={`-${formatCurrency(pnl.variableCosts.foodPurchases)}`} negative />
        <Line label="Boissons" value={`-${formatCurrency(pnl.variableCosts.beveragePurchases)}`} negative />
        <Line label="Packaging / commissions" value={`-${formatCurrency(pnl.variableCosts.packaging + pnl.variableCosts.platformCommissions)}`} negative />
        <Line label="Marge brute" value={formatCurrency(pnl.grossMargin)} emphasis />

        <Line label="Masse salariale" value={`-${formatCurrency(pnl.laborCosts.totalEmployerCost)}`} negative />
        <Line label="Loyer" value={`-${formatCurrency(pnl.fixedCosts.rent + pnl.fixedCosts.rentCharges)}`} negative />
        <Line label="Autres charges fixes" value={`-${formatCurrency(pnl.fixedCosts.total - pnl.fixedCosts.rent - pnl.fixedCosts.rentCharges)}`} negative />
        <Line label="EBITDA" value={formatCurrency(pnl.ebitda)} emphasis />

        <Line label="Amortissements" value={`-${formatCurrency(pnl.depreciation.total)}`} negative />
        <Line label="Intérêts" value={`-${formatCurrency(pnl.financing.annualInterest)}`} negative />
        <Line label="Impôt sociétés" value={`-${formatCurrency(pnl.corporateTax)}`} negative />
        <Line label="Résultat net" value={formatCurrency(pnl.netIncome)} emphasis />
        <Line label="Marge nette" value={formatPercent(pnl.netMargin)} />
      </div>
    </Card>
  );
}
