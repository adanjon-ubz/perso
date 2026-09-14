'use client';

import { RotateCcw } from 'lucide-react';
import { AssumptionsPanel } from '@/components/sections/AssumptionsPanel';
import { DriversPanel } from '@/components/sections/DriversPanel';
import { InsightsPanel } from '@/components/sections/InsightsPanel';
import { KPIHeader } from '@/components/sections/KPIHeader';
import { MethodologyPanel } from '@/components/sections/MethodologyPanel';
import { PnLPanel } from '@/components/sections/PnLPanel';
import { ResultsPanel } from '@/components/sections/ResultsPanel';
import { ScenarioPanel } from '@/components/sections/ScenarioPanel';
import { SensitivityPanel } from '@/components/sections/SensitivityPanel';
import { CostStructureChart } from '@/components/charts/CostStructureChart';
import { OccupancyChart } from '@/components/charts/OccupancyChart';
import { RevenueCoversChart } from '@/components/charts/RevenueCoversChart';
import { WaterfallChart } from '@/components/charts/WaterfallChart';
import { DEMO_SCENARIOS } from '@/data/presets';
import { useSimulation } from '@/hooks/useSimulation';

export function SimulatorApp() {
  const {
    input,
    result,
    setInput,
    applyRestaurantType,
    applyLocation,
    reset,
  } = useSimulation(DEMO_SCENARIOS.lyonTraditional);

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-700">
              France
            </p>
            <h1 className="mt-1 text-3xl font-bold text-slate-900">
              Restaurant Profitability Simulator
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-500">
              Simulez la rentabilité d&apos;un restaurant en France : CA, coûts, break-even,
              sensibilité et scénarios — avec des benchmarks sourcés.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setInput(DEMO_SCENARIOS.parisTraditional)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700"
            >
              Démo Paris
            </button>
            <button
              type="button"
              onClick={() => setInput(DEMO_SCENARIOS.lyonTraditional)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700"
            >
              Démo Lyon
            </button>
            <button
              type="button"
              onClick={() => setInput(DEMO_SCENARIOS.mediumCityFastFood)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700"
            >
              Démo Fast food
            </button>
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white"
            >
              <RotateCcw className="h-4 w-4" />
              Réinitialiser
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6">
        <KPIHeader result={result} />

        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <section aria-label="Hypothèses">
            <AssumptionsPanel
              input={input}
              onChange={setInput}
              onApplyRestaurantType={applyRestaurantType}
              onApplyLocation={applyLocation}
            />
          </section>

          <div className="space-y-6">
            <section aria-label="Résultat estimé">
              <ResultsPanel result={result} />
            </section>
            <section aria-label="P&L">
              <PnLPanel pnl={result.pnl} />
            </section>
            <section aria-label="Insights">
              <InsightsPanel insights={result.insights} />
            </section>
          </div>
        </div>

        <section aria-label="Rentabilité" className="space-y-6">
          <OccupancyChart result={result} />
          <div className="grid gap-6 lg:grid-cols-2">
            <RevenueCoversChart result={result} />
            <CostStructureChart pnl={result.pnl} />
          </div>
          <WaterfallChart pnl={result.pnl} />
        </section>

        <section aria-label="Scénarios" className="space-y-6">
          <ScenarioPanel scenarios={result.scenarios} />
          <DriversPanel drivers={result.drivers} />
        </section>

        <section aria-label="Sensibilité">
          <SensitivityPanel cells={result.sensitivity} />
        </section>

        <section aria-label="Méthodologie">
          <MethodologyPanel />
        </section>
      </main>
    </div>
  );
}
