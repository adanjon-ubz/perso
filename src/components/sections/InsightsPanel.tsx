'use client';

import { AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/Card';
import type { Insight } from '@/types/models';

const icons = {
  success: CheckCircle2,
  warning: AlertTriangle,
  danger: AlertTriangle,
  info: Info,
};

const tones = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  warning: 'border-amber-200 bg-amber-50 text-amber-800',
  danger: 'border-rose-200 bg-rose-50 text-rose-800',
  info: 'border-slate-200 bg-slate-50 text-slate-700',
};

export function InsightsPanel({ insights }: { insights: Insight[] }) {
  return (
    <Card>
      <CardHeader title="Insights automatiques" subtitle="Alertes et signaux de gestion" />
      <div className="space-y-3">
        {insights.map((insight) => {
          const Icon = icons[insight.level];
          return (
            <div key={insight.id} className={`flex gap-3 rounded-xl border px-4 py-3 text-sm ${tones[insight.level]}`}>
              <Icon className="mt-0.5 h-4 w-4 shrink-0" />
              <p>{insight.message}</p>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
