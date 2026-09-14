'use client';

import { Card, CardHeader } from '@/components/ui/Card';
import { BENCHMARKS, METHODOLOGY_SOURCES } from '@/data/france-benchmarks';
import { formatPercent } from '@/lib/utils/format';

export function MethodologyPanel() {
  const keyBenchmarks = [
    BENCHMARKS.averageTicketTraditional,
    BENCHMARKS.foodCostTraditional,
    BENCHMARKS.laborCostShare,
    BENCHMARKS.ebitdaMargin,
    BENCHMARKS.netMargin,
    BENCHMARKS.vatFood,
    BENCHMARKS.corporateTaxStandard,
  ];

  return (
    <Card>
      <CardHeader title="Sources & méthodologie" subtitle="Transparence du modèle" />
      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Benchmarks clés
          </h4>
          <div className="space-y-3">
            {keyBenchmarks.map((benchmark) => (
              <div key={benchmark.label} className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-slate-800">{benchmark.label}</p>
                  <p className="font-semibold text-slate-900">
                    {benchmark.unit.includes('%') ? formatPercent(benchmark.value) : `${benchmark.value} ${benchmark.unit}`}
                  </p>
                </div>
                <p className="mt-2 text-xs text-slate-500">{benchmark.source}</p>
                <p className="mt-1 text-xs text-slate-400">
                  {benchmark.type === 'benchmark' ? 'Benchmark externe' : 'Hypothèse'} — {benchmark.year}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Références
          </h4>
          <div className="space-y-3">
            {METHODOLOGY_SOURCES.map((source) => (
              <a
                key={source.title}
                href={source.url}
                target="_blank"
                rel="noreferrer"
                className="block rounded-xl border border-slate-100 bg-white p-3 text-sm transition hover:border-emerald-200 hover:bg-emerald-50"
              >
                <p className="font-medium text-slate-900">{source.title}</p>
                <p className="mt-1 text-slate-500">{source.description}</p>
              </a>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
