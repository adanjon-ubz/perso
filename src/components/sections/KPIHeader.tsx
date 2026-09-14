import { cn } from '@/lib/utils/cn';
import { formatCurrency, formatNumber, formatPercent } from '@/lib/utils/format';
import type { SimulationResult } from '@/types/models';

type Tone = 'neutral' | 'positive' | 'negative';

function KPI({
  label,
  value,
  tone = 'neutral',
  hint,
}: {
  label: string;
  value: string;
  tone?: Tone;
  hint?: string;
}) {
  return (
    <div
      className="rounded-xl border border-slate-200 bg-white px-3 py-2.5"
      title={hint}
    >
      <p className="truncate text-[11px] font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p
        className={cn(
          'mt-1 text-lg font-bold tabular-nums',
          tone === 'positive' && 'text-emerald-600',
          tone === 'negative' && 'text-rose-600',
          tone === 'neutral' && 'text-slate-900',
        )}
      >
        {value}
      </p>
    </div>
  );
}

/** Bandeau des indicateurs clés, recalculé à chaque changement d'hypothèse. */
export function KPIHeader({ result }: { result: SimulationResult }) {
  const { pnl, breakEven, ratios } = result;
  const sign = (value: number): Tone => (value >= 0 ? 'positive' : 'negative');

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
      <KPI label="CA annuel HT" value={formatCurrency(pnl.revenue.totalRevenue, true)} />
      <KPI label="CA mensuel HT" value={formatCurrency(ratios.monthlyRevenue, true)} />
      <KPI label="EBITDA" value={formatCurrency(pnl.ebitda, true)} tone={sign(pnl.ebitda)} />
      <KPI label="Marge EBITDA" value={formatPercent(pnl.ebitdaMargin)} tone={sign(pnl.ebitda)} />
      <KPI
        label="Résultat net"
        value={formatCurrency(pnl.netIncome, true)}
        tone={sign(pnl.netIncome)}
      />
      <KPI label="Marge nette" value={formatPercent(pnl.netMargin)} tone={sign(pnl.netIncome)} />
      <KPI
        label="Coût matière"
        value={formatPercent(ratios.foodCostShare)}
        hint="Achats matières et boissons rapportés au chiffre d'affaires HT."
      />
      <KPI
        label="Masse salariale"
        value={formatPercent(ratios.laborShare)}
        hint="Salaires bruts et charges patronales estimées, rapportés au CA HT."
      />
      <KPI label="Loyer" value={formatPercent(ratios.rentShare)} hint="Loyer et charges locatives." />
      <KPI label="Couverts / jour" value={formatNumber(ratios.coversPerDay)} />
      <KPI label="Ticket moyen TTC" value={formatCurrency(pnl.revenue.averageTicketTTC)} />
      <KPI
        label="Point mort"
        value={breakEven.isAchievable ? formatPercent(breakEven.breakEvenOccupancy, 0) : 'Hors capacité'}
        tone={breakEven.isAchievable ? 'neutral' : 'negative'}
        hint="Taux de remplissage nécessaire pour couvrir toutes les charges."
      />
    </div>
  );
}
