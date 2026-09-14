import { Info } from 'lucide-react';
import { BenchmarkHint } from '@/components/ui/Benchmark';
import type { BenchmarkValue } from '@/types/models';

export function Field({
  label,
  hint,
  benchmark,
  children,
}: {
  label: string;
  /** Explication pédagogique affichée au survol. */
  hint?: string;
  benchmark?: BenchmarkValue;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <div className="mb-1.5 flex items-center gap-1">
        <label className="text-sm font-medium text-slate-700">{label}</label>
        {hint ? (
          <span title={hint} className="cursor-help text-slate-300 hover:text-slate-500">
            <Info size={13} aria-hidden />
            <span className="sr-only">{hint}</span>
          </span>
        ) : null}
      </div>
      {children}
      {benchmark ? <BenchmarkHint benchmark={benchmark} /> : null}
    </div>
  );
}
