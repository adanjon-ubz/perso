import { AlertTriangle, CircleAlert, Info, Sparkles } from 'lucide-react';
import type { Insight } from '@/types/models';

const STYLES: Record<Insight['level'], { className: string; Icon: typeof Info }> = {
  success: { className: 'border-emerald-200 bg-emerald-50 text-emerald-900', Icon: Sparkles },
  warning: { className: 'border-amber-200 bg-amber-50 text-amber-900', Icon: AlertTriangle },
  danger: { className: 'border-rose-200 bg-rose-50 text-rose-900', Icon: CircleAlert },
  info: { className: 'border-blue-200 bg-blue-50 text-blue-900', Icon: Info },
};

/** Lecture automatique des ratios : alertes et points forts du scénario. */
export function InsightsPanel({ insights }: { insights: Insight[] }) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {insights.map((insight) => {
        const { className, Icon } = STYLES[insight.level];

        return (
          <div
            key={insight.id}
            className={`flex gap-2.5 rounded-xl border p-3.5 text-sm leading-5 ${className}`}
          >
            <Icon size={17} className="mt-0.5 shrink-0" aria-hidden />
            <p>{insight.message}</p>
          </div>
        );
      })}
    </div>
  );
}
