'use client';

import { Card, CardHeader } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils/format';
import type { DriverImpact } from '@/types/models';

export function DriversPanel({ drivers }: { drivers: DriverImpact[] }) {
  return (
    <Card>
      <CardHeader
        title="Qu'est-ce qui influence le plus ma rentabilité ?"
        subtitle="Impact estimé sur le résultat net annuel"
      />
      <div className="space-y-3">
        {drivers.map((driver) => (
          <div key={driver.id} className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-medium text-slate-700">{driver.label}</p>
              <p className={`text-sm font-semibold ${driver.impact >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                {driver.impact >= 0 ? '+' : ''}
                {formatCurrency(driver.impact, true)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
