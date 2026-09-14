import { Card, CardHeader } from '@/components/ui/Card';
import { cn } from '@/lib/utils/cn';
import { formatCurrency, formatPercent } from '@/lib/utils/format';
import type { PnLResult } from '@/types/models';

function Row({
  label,
  value,
  revenue,
  strong,
  indent,
}: {
  label: string;
  value: number;
  revenue: number;
  strong?: boolean;
  indent?: boolean;
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-3 border-b border-slate-100 py-2 text-sm',
        strong ? 'font-bold text-slate-950' : 'text-slate-600',
      )}
    >
      <span className={cn(indent && 'pl-3 text-slate-500')}>{label}</span>
      <span className="flex shrink-0 items-baseline gap-3 tabular-nums">
        <span className={cn('w-14 text-right text-xs', strong ? 'text-slate-500' : 'text-slate-400')}>
          {revenue > 0 ? formatPercent(value / revenue, 1) : '—'}
        </span>
        <span className={cn('w-24 text-right', value < 0 && 'text-rose-600')}>
          {formatCurrency(value)}
        </span>
      </span>
    </div>
  );
}

function Heading({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="mt-5 pb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
      {children}
    </h4>
  );
}

/** Section B — compte de résultat annuel simplifié, hors taxes. */
export function PnLPanel({ pnl }: { pnl: PnLResult }) {
  const revenue = pnl.revenue.totalRevenue;
  const otherFixed =
    pnl.fixedCosts.total - pnl.fixedCosts.rent - pnl.fixedCosts.rentCharges - pnl.fixedCosts.utilities;

  return (
    <Card>
      <CardHeader
        title="Compte de résultat"
        subtitle="Annuel, hors taxes. La colonne de gauche indique le poids de chaque poste dans le CA."
      />

      <Heading>Revenus</Heading>
      <Row label="Nourriture (salle)" value={pnl.revenue.foodRevenue} revenue={revenue} indent />
      <Row label="Boissons sans alcool" value={pnl.revenue.beverageRevenue} revenue={revenue} indent />
      <Row label="Alcool" value={pnl.revenue.alcoholRevenue} revenue={revenue} indent />
      <Row label="Vente à emporter" value={pnl.revenue.takeawayRevenue} revenue={revenue} indent />
      <Row label="Livraison" value={pnl.revenue.deliveryRevenue} revenue={revenue} indent />
      <Row label="Chiffre d'affaires HT" value={revenue} revenue={revenue} strong />

      <Heading>Coûts variables</Heading>
      <Row label="Achats matières" value={-pnl.variableCosts.foodPurchases} revenue={revenue} indent />
      <Row label="Achats boissons" value={-pnl.variableCosts.beveragePurchases} revenue={revenue} indent />
      <Row label="Emballages" value={-pnl.variableCosts.packaging} revenue={revenue} indent />
      <Row
        label="Commissions plateformes"
        value={-pnl.variableCosts.platformCommissions}
        revenue={revenue}
        indent
      />
      <Row label="Frais de paiement" value={-pnl.variableCosts.paymentFees} revenue={revenue} indent />
      <Row label="Marge brute" value={pnl.grossMargin} revenue={revenue} strong />

      <Heading>Charges de personnel</Heading>
      <Row label="Salaires bruts" value={-pnl.laborCosts.totalGross} revenue={revenue} indent />
      <Row
        label="Charges patronales & avantages"
        value={-(pnl.laborCosts.totalEmployerCost - pnl.laborCosts.totalGross)}
        revenue={revenue}
        indent
      />
      <Row label="Masse salariale chargée" value={-pnl.laborCosts.totalEmployerCost} revenue={revenue} strong />

      <Heading>Charges fixes</Heading>
      <Row label="Loyer" value={-pnl.fixedCosts.rent} revenue={revenue} indent />
      <Row label="Charges locatives" value={-pnl.fixedCosts.rentCharges} revenue={revenue} indent />
      <Row label="Énergie & eau" value={-pnl.fixedCosts.utilities} revenue={revenue} indent />
      <Row label="Autres charges externes" value={-otherFixed} revenue={revenue} indent />
      <Row label="Total charges fixes" value={-pnl.fixedCosts.total} revenue={revenue} strong />

      <Heading>Résultat</Heading>
      <Row label="EBITDA" value={pnl.ebitda} revenue={revenue} strong />
      <Row label="Amortissements" value={-pnl.depreciation.total} revenue={revenue} indent />
      <Row label="Résultat d'exploitation" value={pnl.operatingResult} revenue={revenue} strong />
      <Row label="Intérêts d'emprunt" value={-pnl.financing.annualInterest} revenue={revenue} indent />
      <Row label="Résultat avant impôt" value={pnl.preTaxIncome} revenue={revenue} strong />
      <Row label="Impôt sur les sociétés" value={-pnl.corporateTax} revenue={revenue} indent />
      <Row label="Résultat net" value={pnl.netIncome} revenue={revenue} strong />

      <p className="mt-4 text-[11px] leading-5 text-slate-400">
        Le remboursement du capital emprunté ({formatCurrency(
          pnl.financing.annualPrincipalRepayment,
          true,
        )}{' '}
        par an) n&apos;apparaît pas dans le compte de résultat : il figure dans le cash-flow.
      </p>
    </Card>
  );
}
