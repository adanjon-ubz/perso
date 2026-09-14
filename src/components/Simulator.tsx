'use client';

import { useState } from 'react';
import { BookOpen, ChefHat, RotateCcw } from 'lucide-react';
import { BreakEvenChart } from '@/components/charts/BreakEvenChart';
import { CostStructureChart } from '@/components/charts/CostStructureChart';
import { OccupancyChart } from '@/components/charts/OccupancyChart';
import { RevenueCoversChart } from '@/components/charts/RevenueCoversChart';
import { WaterfallChart } from '@/components/charts/WaterfallChart';
import { AssumptionsPanel } from '@/components/sections/AssumptionsPanel';
import { DriversPanel } from '@/components/sections/DriversPanel';
import { InsightsPanel } from '@/components/sections/InsightsPanel';
import { KPIHeader } from '@/components/sections/KPIHeader';
import { MethodologyPanel } from '@/components/sections/MethodologyPanel';
import { PnLPanel } from '@/components/sections/PnLPanel';
import { ResultsPanel } from '@/components/sections/ResultsPanel';
import { ScenarioPanel } from '@/components/sections/ScenarioPanel';
import { SensitivityPanel } from '@/components/sections/SensitivityPanel';
import { DEMO_SCENARIOS, DEMO_SCENARIO_OPTIONS } from '@/data/presets';
import { useSimulation } from '@/hooks/useSimulation';
import { cn } from '@/lib/utils/cn';
import type { ScenarioResult } from '@/types/models';

type DemoId = (typeof DEMO_SCENARIO_OPTIONS)[number]['id'];

export function Simulator() {
  const sim = useSimulation(DEMO_SCENARIOS.lyonTraditional);
  const [activeDemo, setActiveDemo] = useState<DemoId>('lyonTraditional');
  const [activeScenario, setActiveScenario] = useState<ScenarioResult['id']>('base');
  const [showMethodology, setShowMethodology] = useState(false);

  const loadDemo = (id: DemoId) => {
    setActiveDemo(id);
    sim.setInput(DEMO_SCENARIOS[id]);
  };

  return (
    <main className="min-h-screen bg-[#f6f8fb] text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-600 text-white">
              <ChefHat size={22} />
            </div>
            <div>
              <p className="text-base font-bold tracking-tight">Restaurant Profitability</p>
              <p className="text-xs text-slate-500">Simulateur France · hypothèses 2026</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowMethodology(true)}
              className="hidden items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 sm:flex"
            >
              <BookOpen size={16} /> Voir les hypothèses
            </button>
            <button
              type="button"
              onClick={sim.reset}
              className="flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              <RotateCcw size={15} /> Réinitialiser
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
              Simulateur interactif
            </p>
            <h1 className="mt-2 max-w-3xl text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Votre restaurant peut-il être rentable ?
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Ajustez vos hypothèses : le compte de résultat, le point mort, les scénarios et la
              sensibilité se recalculent instantanément. Tous les montants du P&amp;L sont hors
              taxes.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {DEMO_SCENARIO_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => loadDemo(option.id)}
                className={cn(
                  'rounded-xl border px-3 py-2 text-xs font-semibold transition',
                  activeDemo === option.id
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50',
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <KPIHeader result={sim.result} />

        <div className="mt-6 grid items-start gap-6 xl:grid-cols-[460px_minmax(0,1fr)]">
          <section aria-label="Hypothèses" className="xl:sticky xl:top-20">
            <AssumptionsPanel sim={sim} />
          </section>

          <div className="min-w-0 space-y-6">
            <ResultsPanel result={sim.result} />
            <InsightsPanel insights={sim.result.insights} />
            <OccupancyChart result={sim.result} />

            <div className="grid gap-6 lg:grid-cols-2">
              <BreakEvenChart result={sim.result} />
              <RevenueCoversChart result={sim.result} />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <PnLPanel pnl={sim.result.pnl} />
              <div className="space-y-6">
                <CostStructureChart pnl={sim.result.pnl} />
                <DriversPanel drivers={sim.result.drivers} />
              </div>
            </div>

            <WaterfallChart pnl={sim.result.pnl} />

            <ScenarioPanel
              scenarios={sim.result.scenarios}
              activeId={activeScenario}
              onSelect={setActiveScenario}
            />

            <SensitivityPanel
              cells={sim.result.sensitivity}
              revenue={sim.result.pnl.revenue.totalRevenue}
            />

            <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-5">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <p className="font-semibold text-slate-900">Transparence du modèle</p>
                  <p className="mt-1 text-sm text-slate-600">
                    Valeurs, fourchettes, années, sources et limites de chaque hypothèse.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowMethodology(true)}
                  className="shrink-0 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  Voir les hypothèses
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <MethodologyPanel open={showMethodology} onClose={() => setShowMethodology(false)} />
    </main>
  );
}
