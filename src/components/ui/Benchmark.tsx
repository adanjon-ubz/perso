import { Info } from 'lucide-react';
import { formatCurrency, formatNumber, formatPercent } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';
import type { BenchmarkValue } from '@/types/models';

function formatBenchmark(benchmark: BenchmarkValue, value: number): string {
  if (benchmark.unit.includes('%')) return formatPercent(value, 0);
  if (benchmark.unit.startsWith('€')) return `${formatNumber(value)} ${benchmark.unit}`;
  if (benchmark.unit === '€ TTC' || benchmark.unit === '€ brut/mois') {
    return formatCurrency(value);
  }
  return `${formatNumber(value)} ${benchmark.unit}`;
}

/** Distingue visuellement une donnée sourcée d'une estimation. */
export function BenchmarkBadge({ type }: { type: BenchmarkValue['type'] }) {
  return (
    <span
      className={cn(
        'rounded-full px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide',
        type === 'benchmark' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700',
      )}
    >
      {type === 'benchmark' ? 'Benchmark' : 'Hypothèse'}
    </span>
  );
}

/**
 * Rappel de la valeur de référence sous un champ de saisie : la valeur
 * benchmark reste visible à côté de l'hypothèse retenue par l'utilisateur.
 */
export function BenchmarkHint({ benchmark }: { benchmark: BenchmarkValue }) {
  const tooltip = [benchmark.source, `Année ${benchmark.year}`, benchmark.note]
    .filter(Boolean)
    .join('\n\n');

  return (
    <p
      className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11px] leading-4 text-slate-400"
      title={tooltip}
    >
      <BenchmarkBadge type={benchmark.type} />
      <span>
        {formatBenchmark(benchmark, benchmark.value)}
        {benchmark.low !== benchmark.high ? (
          <>
            {' · plage '}
            {formatBenchmark(benchmark, benchmark.low)}–{formatBenchmark(benchmark, benchmark.high)}
          </>
        ) : null}
      </span>
      <Info size={11} className="shrink-0 text-slate-300" aria-hidden />
    </p>
  );
}
