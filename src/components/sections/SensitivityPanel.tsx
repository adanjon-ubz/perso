import { Grid3x3 } from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/Card';
import { formatCurrency, formatPercent } from '@/lib/utils/format';
import type { SensitivityCell } from '@/types/models';

/** Quatre zones de lecture : perte, fragile, rentable, très rentable. */
function toneFor(netIncome: number, revenue: number): string {
  if (netIncome < 0) return 'bg-rose-100 text-rose-800';

  const margin = revenue > 0 ? netIncome / revenue : 0;
  if (margin < 0.03) return 'bg-amber-100 text-amber-900';
  if (margin < 0.08) return 'bg-emerald-100 text-emerald-900';
  return 'bg-emerald-600 text-white';
}

/** Section E — résultat net selon le ticket moyen et le taux de remplissage. */
export function SensitivityPanel({
  cells,
  revenue,
}: {
  cells: SensitivityCell[];
  revenue: number;
}) {
  const tickets = [...new Set(cells.map((cell) => cell.ticket))].sort((a, b) => a - b);
  const occupancies = [...new Set(cells.map((cell) => cell.occupancy))].sort((a, b) => a - b);

  return (
    <Card>
      <CardHeader
        title="Matrice de sensibilité"
        subtitle="Résultat net annuel selon le ticket moyen TTC et le taux de remplissage."
        action={<Grid3x3 className="text-slate-300" size={19} />}
      />

      <div className="overflow-x-auto">
        <div className="min-w-[520px]">
          <div
            className="grid gap-1"
            style={{ gridTemplateColumns: `84px repeat(${tickets.length}, minmax(0, 1fr))` }}
          >
            <div className="p-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Remplissage
            </div>
            {tickets.map((ticket) => (
              <div
                key={ticket}
                className="p-2 text-center text-xs font-semibold text-slate-600"
              >
                {formatCurrency(ticket)}
              </div>
            ))}

            {occupancies.map((occupancy) => (
              <Row
                key={occupancy}
                occupancy={occupancy}
                tickets={tickets}
                cells={cells}
                revenue={revenue}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-3 text-[11px] text-slate-500">
        <Legend className="bg-rose-100" label="Perte" />
        <Legend className="bg-amber-100" label="Marge nette < 3 %" />
        <Legend className="bg-emerald-100" label="3 % à 8 %" />
        <Legend className="bg-emerald-600" label="> 8 %" />
      </div>
    </Card>
  );
}

function Row({
  occupancy,
  tickets,
  cells,
  revenue,
}: {
  occupancy: number;
  tickets: number[];
  cells: SensitivityCell[];
  revenue: number;
}) {
  return (
    <>
      <div className="flex items-center p-2 text-xs font-semibold text-slate-600">
        {formatPercent(occupancy, 0)}
      </div>
      {tickets.map((ticket) => {
        const cell = cells.find(
          (item) => item.occupancy === occupancy && item.ticket === ticket,
        );
        const netIncome = cell?.netIncome ?? 0;

        return (
          <div
            key={`${occupancy}-${ticket}`}
            className={`rounded-lg p-2.5 text-center text-xs font-bold tabular-nums ${toneFor(
              netIncome,
              revenue,
            )}`}
          >
            {formatCurrency(netIncome, true)}
          </div>
        );
      })}
    </>
  );
}

function Legend({ className, label }: { className: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={`h-3 w-3 rounded ${className}`} />
      {label}
    </span>
  );
}
