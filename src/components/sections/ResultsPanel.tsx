import { Card } from '@/components/ui/Card';
import { formatCurrency, formatNumber, formatPercent, formatYears } from '@/lib/utils/format';
import type { SimulationResult } from '@/types/models';

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 text-xs">
      <span className="text-slate-400">{label}</span>
      <span className="font-semibold tabular-nums text-slate-100">{value}</span>
    </div>
  );
}

/** Section C — la réponse synthétique à « est-ce rentable ? ». */
export function ResultsPanel({ result }: { result: SimulationResult }) {
  const { pnl, breakEven, cashFlow, ratios, totalCapex } = result;

  return (
    <Card className="border-slate-900 bg-slate-950 text-white">
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
            Résultat estimé
          </p>

          <div className="mt-4 flex flex-wrap items-end gap-x-10 gap-y-4">
            <div>
              <p className="text-sm text-slate-400">Chiffre d&apos;affaires HT</p>
              <p className="mt-1 text-3xl font-bold tabular-nums">
                {formatCurrency(pnl.revenue.totalRevenue, true)}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-400">EBITDA</p>
              <p className="mt-1 text-3xl font-bold tabular-nums">
                {formatCurrency(pnl.ebitda, true)}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Résultat net</p>
              <p
                className={`mt-1 text-3xl font-bold tabular-nums ${
                  pnl.netIncome >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {formatCurrency(pnl.netIncome, true)}
              </p>
              <p className="mt-0.5 text-sm text-slate-400">
                {formatPercent(pnl.netMargin)} de marge nette
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Seuil de rentabilité
            </p>
            {breakEven.isAchievable ? (
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Le point mort est atteint à{' '}
                <strong className="text-white">
                  {formatNumber(breakEven.breakEvenCoversPerDay)} couverts / jour
                </strong>
                , soit{' '}
                <strong className="text-white">
                  {formatPercent(breakEven.breakEvenOccupancy, 0)} de remplissage
                </strong>{' '}
                et {formatCurrency(breakEven.breakEvenRevenue, true)} de chiffre d&apos;affaires
                annuel.
              </p>
            ) : (
              <p className="mt-2 text-sm leading-6 text-rose-300">
                Le point mort n&apos;est pas atteignable : même à 100 % de remplissage, les charges
                dépassent la marge dégagée.
              </p>
            )}
          </div>
        </div>

        <div className="space-y-4 rounded-xl border border-white/10 bg-white/5 p-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Cash-flow annuel
            </p>
            <p className="mt-1 text-2xl font-bold tabular-nums">
              {formatCurrency(cashFlow.operatingCashFlow, true)}
            </p>
          </div>

          <div className="space-y-1.5 border-t border-white/10 pt-3">
            <Metric
              label="Remboursement du capital"
              value={formatCurrency(-cashFlow.debtService, true)}
            />
            <Metric
              label="Cash-flow disponible"
              value={formatCurrency(cashFlow.freeCashFlow, true)}
            />
          </div>

          <div className="space-y-1.5 border-t border-white/10 pt-3">
            <Metric label="Investissement initial" value={formatCurrency(totalCapex, true)} />
            <Metric
              label="Financement réuni"
              value={formatCurrency(cashFlow.initialFunding, true)}
            />
            <Metric
              label="Trésorerie de départ"
              value={formatCurrency(cashFlow.initialCashPosition, true)}
            />
          </div>

          <div className="space-y-1.5 border-t border-white/10 pt-3">
            <Metric label="Rentabilité de l'apport" value={formatPercent(ratios.returnOnEquity)} />
            <Metric label="Retour sur investissement" value={formatYears(ratios.paybackYears)} />
          </div>
        </div>
      </div>
    </Card>
  );
}
