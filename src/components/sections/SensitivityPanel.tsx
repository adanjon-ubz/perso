'use client';

import { Card, CardHeader } from '@/components/ui/Card';
import { formatCurrency, formatPercent } from '@/lib/utils/format';
import type { SensitivityCell } from '@/types/models';

function cellTone(value: number) {
  if (value < 0) return 'bg-rose-100 text-rose-800';
  if (value < 30000) return 'bg-amber-100 text-amber-800';
  if (value < 80000) return 'bg-emerald-100 text-emerald-800';
  return 'bg-emerald-200 text-emerald-900';
}

export function SensitivityPanel({ cells }: { cells: SensitivityCell[] }) {
  const tickets = Array.from(new Set(cells.map((cell) => cell.ticket))).sort((a, b) => a - b);
  const occupancies = Array.from(new Set(cells.map((cell) => cell.occupancy))).sort((a, b) => a - b);

  return (
    <Card>
      <CardHeader
        title="Matrice de sensibilité"
        subtitle="Résultat net selon remplissage et ticket moyen"
      />
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr>
              <th className="px-3 py-2 text-left text-slate-500">Remplissage</th>
              {tickets.map((ticket) => (
                <th key={ticket} className="px-3 py-2 text-right text-slate-500">
                  {formatCurrency(ticket)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {occupancies.map((occupancy) => (
              <tr key={occupancy}>
                <td className="px-3 py-2 font-medium text-slate-700">{formatPercent(occupancy, 0)}</td>
                {tickets.map((ticket) => {
                  const cell = cells.find((item) => item.occupancy === occupancy && item.ticket === ticket);
                  return (
                    <td key={`${occupancy}-${ticket}`} className="px-2 py-2">
                      <div className={`rounded-lg px-2 py-2 text-right font-medium ${cellTone(cell?.netIncome ?? 0)}`}>
                        {formatCurrency(cell?.netIncome ?? 0, true)}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
