'use client';

import { ExternalLink, X } from 'lucide-react';
import { BenchmarkBadge } from '@/components/ui/Benchmark';
import { BENCHMARKS, METHODOLOGY_SOURCES } from '@/data/france-benchmarks';
import { formatNumber } from '@/lib/utils/format';
import type { BenchmarkValue } from '@/types/models';

function displayValue(benchmark: BenchmarkValue): string {
  if (benchmark.unit.includes('%')) {
    return `${formatNumber(benchmark.value * 100, 2)} %`;
  }
  return `${formatNumber(benchmark.value, 2)} ${benchmark.unit}`;
}

/**
 * Panneau de transparence : chaque hypothèse du modèle avec sa valeur, sa
 * fourchette, son année, sa source et son statut (donnée sourcée ou estimation).
 */
export function MethodologyPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;

  const benchmarks = Object.values(BENCHMARKS) as BenchmarkValue[];

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        aria-label="Fermer le panneau"
        className="absolute inset-0 bg-slate-950/45 backdrop-blur-sm"
        onClick={onClose}
      />

      <aside className="relative h-full w-full max-w-2xl overflow-y-auto bg-white p-5 shadow-2xl sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
              Transparence
            </p>
            <h2 className="mt-1 text-2xl font-bold text-slate-900">Sources & méthodologie</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Un <strong>benchmark</strong> est une donnée publiée, identifiée par sa source et son
              année. Une <strong>hypothèse</strong> est une estimation indicative, modifiable, qui
              n&apos;est jamais présentée comme une donnée officielle.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="rounded-xl bg-slate-100 p-2 text-slate-500 transition hover:bg-slate-200"
          >
            <X size={20} />
          </button>
        </div>

        <h3 className="mt-8 text-sm font-semibold uppercase tracking-wide text-slate-400">
          Hypothèses du modèle
        </h3>
        <div className="mt-3 space-y-3">
          {benchmarks.map((benchmark) => (
            <div key={benchmark.label} className="rounded-xl border border-slate-200 p-4">
              <div className="flex items-start justify-between gap-3">
                <p className="font-semibold text-slate-800">{benchmark.label}</p>
                <BenchmarkBadge type={benchmark.type} />
              </div>

              <div className="mt-2 flex flex-wrap items-baseline gap-x-4 gap-y-1 text-sm">
                <span className="text-lg font-bold tabular-nums text-slate-900">
                  {displayValue(benchmark)}
                </span>
                {benchmark.low !== benchmark.high ? (
                  <span className="text-xs text-slate-500">
                    fourchette {formatNumber(benchmark.low * (benchmark.unit.includes('%') ? 100 : 1), 2)}
                    {' – '}
                    {formatNumber(benchmark.high * (benchmark.unit.includes('%') ? 100 : 1), 2)}{' '}
                    {benchmark.unit}
                  </span>
                ) : null}
                <span className="text-xs text-slate-400">Année {benchmark.year}</span>
              </div>

              <p className="mt-2 text-xs leading-5 text-slate-500">{benchmark.source}</p>
              {benchmark.note ? (
                <p className="mt-1.5 rounded-lg bg-slate-50 p-2 text-xs leading-5 text-slate-500">
                  {benchmark.note}
                </p>
              ) : null}
            </div>
          ))}
        </div>

        <h3 className="mt-8 text-sm font-semibold uppercase tracking-wide text-slate-400">
          Références
        </h3>
        <div className="mt-3 space-y-3">
          {METHODOLOGY_SOURCES.map((source) => (
            <a
              key={source.title}
              href={source.url}
              target="_blank"
              rel="noreferrer"
              className="block rounded-xl border border-slate-200 p-4 transition hover:border-blue-300 hover:bg-blue-50/50"
            >
              <p className="flex items-center gap-1.5 font-semibold text-slate-800">
                {source.title}
                <ExternalLink size={13} className="text-slate-400" />
              </p>
              <p className="mt-1 text-sm leading-5 text-slate-500">{source.description}</p>
            </a>
          ))}
        </div>

        <h3 className="mt-8 text-sm font-semibold uppercase tracking-wide text-slate-400">
          Limites du modèle
        </h3>
        <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-500">
          <li>
            Le modèle raisonne sur une <strong>année d&apos;exploitation de croisière</strong> : il
            ne simule ni la montée en charge des premiers mois, ni la saisonnalité.
          </li>
          <li>
            Le <strong>droit au bail, le fonds de commerce et le besoin en fonds de roulement</strong>{' '}
            ne sont pas inclus dans l&apos;investissement initial.
          </li>
          <li>
            Les <strong>coûts employeur sont approchés</strong> par une formule paramétrique (RGDU) :
            le coût réel dépend du contrat, des exonérations et de la situation de l&apos;entreprise.
          </li>
          <li>
            La masse salariale est traitée comme une <strong>charge fixe</strong> dans le calcul du
            point mort : à court terme, l&apos;effectif ne varie pas avec la fréquentation.
          </li>
          <li>
            La TVA est collectée puis reversée : elle n&apos;apparaît pas dans le compte de
            résultat, présenté hors taxes.
          </li>
        </ul>

        <p className="mt-8 rounded-xl bg-slate-100 p-4 text-xs leading-5 text-slate-500">
          Outil d&apos;aide à la décision. Il ne constitue ni un conseil comptable, ni fiscal, ni
          juridique. Faites valider votre prévisionnel par un expert-comptable et vos coûts de paie
          par le simulateur officiel de l&apos;URSSAF.
        </p>
      </aside>
    </div>
  );
}
