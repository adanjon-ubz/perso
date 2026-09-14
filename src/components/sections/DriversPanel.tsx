import { TrendingUp } from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/Card';
import { cn } from '@/lib/utils/cn';
import { formatCurrency } from '@/lib/utils/format';
import type { DriverImpact } from '@/types/models';

/** Section « qu'est-ce qui influence le plus ma rentabilité ? ». */
export function DriversPanel({ drivers }: { drivers: DriverImpact[] }) {
  const maxImpact = Math.max(...drivers.map((driver) => Math.abs(driver.impact)), 1);

  return (
    <Card>
      <CardHeader
        title="Drivers de rentabilité"
        subtitle="Impact sur le résultat net annuel, une variable à la fois, toutes choses égales par ailleurs."
        action={<TrendingUp className="text-slate-300" size={19} />}
      />

      <div className="space-y-3">
        {drivers.map((driver, index) => (
          <div key={driver.id}>
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-slate-700">
                <span className="mr-2 font-semibold text-slate-300">{index + 1}</span>
                {driver.label}
              </p>
              <p
                className={cn(
                  'shrink-0 text-sm font-bold tabular-nums',
                  driver.impact >= 0 ? 'text-emerald-700' : 'text-rose-700',
                )}
              >
                {driver.impact >= 0 ? '+' : ''}
                {formatCurrency(driver.impact, true)}
              </p>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className={cn(
                  'h-full rounded-full',
                  driver.impact >= 0 ? 'bg-emerald-500' : 'bg-rose-500',
                )}
                style={{ width: `${Math.max(4, (Math.abs(driver.impact) / maxImpact) * 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
