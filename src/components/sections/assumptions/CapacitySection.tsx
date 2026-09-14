import { Users } from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Field } from '@/components/ui/Field';
import { NumberInput, SliderInput } from '@/components/ui/Input';
import { BenchmarkHint } from '@/components/ui/Benchmark';
import { BENCHMARKS, getOccupancyBenchmark } from '@/data/france-benchmarks';
import type { SimulationController } from '@/hooks/useSimulation';
import { formatNumber, formatPercent } from '@/lib/utils/format';

export function CapacitySection({ sim }: { sim: SimulationController }) {
  const { profile } = sim.input;
  const { revenue } = sim.result.pnl;

  return (
    <Card>
      <CardHeader
        title="2. Votre capacité"
        subtitle={`${formatNumber(revenue.coversPerDay)} couverts / jour · ${formatNumber(
          revenue.annualCovers,
        )} couverts / an`}
        action={<Users className="text-slate-300" size={19} />}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nombre de places">
          <NumberInput
            ariaLabel="Nombre de places"
            value={profile.seatingCapacity}
            min={0}
            onChange={(seatingCapacity) => sim.updateProfile({ seatingCapacity })}
          />
        </Field>
        <Field
          label="Services / jour"
          hint="Un service = une rotation complète de la salle (déjeuner, dîner…)."
        >
          <NumberInput
            ariaLabel="Services par jour"
            value={profile.servicesPerDay}
            min={1}
            max={5}
            onChange={(servicesPerDay) => sim.updateProfile({ servicesPerDay })}
          />
        </Field>
        <Field label="Jours / semaine" benchmark={BENCHMARKS.openingDaysPerWeek}>
          <NumberInput
            ariaLabel="Jours d'ouverture par semaine"
            value={profile.openingDaysPerWeek}
            min={1}
            max={7}
            onChange={(openingDaysPerWeek) => sim.updateProfile({ openingDaysPerWeek })}
          />
        </Field>
        <Field label="Semaines / an" hint="52 semaines moins les périodes de fermeture annuelle.">
          <NumberInput
            ariaLabel="Semaines d'ouverture par an"
            value={profile.openingWeeksPerYear}
            min={1}
            max={52}
            onChange={(openingWeeksPerYear) => sim.updateProfile({ openingWeeksPerYear })}
          />
        </Field>
      </div>

      <div className="mt-5 rounded-xl bg-slate-50 p-4">
        <p className="mb-2 text-sm font-medium text-slate-700">Taux de remplissage</p>
        <SliderInput
          ariaLabel="Taux de remplissage"
          value={profile.occupancyRate}
          min={0.1}
          max={1}
          step={0.01}
          formatValue={(value) => formatPercent(value, 0)}
          onChange={(occupancyRate) => sim.updateProfile({ occupancyRate })}
        />
        <BenchmarkHint
          benchmark={getOccupancyBenchmark(profile.restaurantType, profile.locationType)}
        />
      </div>
    </Card>
  );
}
