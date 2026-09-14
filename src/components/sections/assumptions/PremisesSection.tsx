import { Building2 } from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Field } from '@/components/ui/Field';
import { NumberInput, SliderInput } from '@/components/ui/Input';
import { BenchmarkHint } from '@/components/ui/Benchmark';
import { BENCHMARKS, FOOD_COST_BY_TYPE, getRentBenchmark } from '@/data/france-benchmarks';
import type { SimulationController } from '@/hooks/useSimulation';
import { formatCurrency, formatPercent } from '@/lib/utils/format';

const FIXED_COSTS = [
  ['rentChargesMonthly', 'Charges locatives'],
  ['utilitiesMonthly', 'Énergie & eau'],
  ['insuranceMonthly', 'Assurance'],
  ['accountingMonthly', 'Comptabilité'],
  ['softwareMonthly', 'Logiciels & caisse'],
  ['telecomMonthly', 'Télécom'],
  ['cleaningMonthly', 'Nettoyage'],
  ['maintenanceMonthly', 'Maintenance'],
  ['marketingMonthly', 'Marketing'],
  ['bankingMonthly', 'Frais bancaires'],
  ['taxesAndDutiesMonthly', 'Impôts & taxes locales'],
  ['miscellaneousMonthly', 'Autres'],
] as const;

export function PremisesSection({ sim }: { sim: SimulationController }) {
  const { profile, operating } = sim.input;
  const rentBenchmark = getRentBenchmark(profile.city, profile.locationType);
  const rentPerSqm =
    profile.surfaceSqm > 0 ? (operating.rentMonthly * 12) / profile.surfaceSqm : 0;

  return (
    <Card>
      <CardHeader
        title="5. Vos locaux & charges"
        subtitle={`Loyer retenu : ${formatCurrency(rentPerSqm)} / m² / an`}
        action={<Building2 className="text-slate-300" size={19} />}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Surface">
          <NumberInput
            ariaLabel="Surface"
            value={profile.surfaceSqm}
            min={0}
            suffix="m²"
            onChange={(surfaceSqm) =>
              sim.applyLocation(profile.city, profile.locationType, surfaceSqm)
            }
          />
        </Field>
        <Field label="Loyer mensuel">
          <NumberInput
            ariaLabel="Loyer mensuel"
            value={operating.rentMonthly}
            min={0}
            step={50}
            suffix="€ HT"
            onChange={(rentMonthly) => sim.updateOperating({ rentMonthly })}
          />
        </Field>
      </div>
      <BenchmarkHint benchmark={rentBenchmark} />

      <div className="mt-5 rounded-xl bg-amber-50/70 p-4">
        <p className="mb-2 text-sm font-medium text-slate-700">Coût matière</p>
        <SliderInput
          ariaLabel="Coût matière"
          value={operating.foodCostRate}
          min={0.15}
          max={0.5}
          step={0.005}
          formatValue={(value) => formatPercent(value, 1)}
          onChange={(foodCostRate) => sim.updateOperating({ foodCostRate })}
        />
        <BenchmarkHint benchmark={FOOD_COST_BY_TYPE[profile.restaurantType]} />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field label="Coût des boissons" hint="Part du CA boissons consacrée aux achats.">
          <NumberInput
            ariaLabel="Coût des boissons"
            value={Math.round(operating.beverageCostRate * 1000) / 10}
            min={0}
            max={80}
            step={0.5}
            suffix="% CA"
            onChange={(value) => sim.updateOperating({ beverageCostRate: value / 100 })}
          />
        </Field>
        <Field label="Commission plateformes" benchmark={BENCHMARKS.platformCommission}>
          <NumberInput
            ariaLabel="Commission plateformes"
            value={Math.round(operating.platformCommissionRate * 1000) / 10}
            min={0}
            max={50}
            step={0.5}
            suffix="% livr."
            onChange={(value) => sim.updateOperating({ platformCommissionRate: value / 100 })}
          />
        </Field>
        <Field label="Emballages" benchmark={BENCHMARKS.packagingCost}>
          <NumberInput
            ariaLabel="Emballages"
            value={Math.round(operating.packagingCostRate * 1000) / 10}
            min={0}
            max={20}
            step={0.1}
            suffix="% emp."
            onChange={(value) => sim.updateOperating({ packagingCostRate: value / 100 })}
          />
        </Field>
        <Field label="Frais de paiement" benchmark={BENCHMARKS.paymentFees}>
          <NumberInput
            ariaLabel="Frais de paiement"
            value={Math.round(operating.paymentFeeRate * 1000) / 10}
            min={0}
            max={10}
            step={0.1}
            suffix="% CA"
            onChange={(value) => sim.updateOperating({ paymentFeeRate: value / 100 })}
          />
        </Field>
      </div>

      <div className="mt-5 border-t border-slate-100 pt-4">
        <p className="mb-3 text-sm font-medium text-slate-700">Charges fixes mensuelles</p>
        <div className="grid gap-4 sm:grid-cols-2">
          {FIXED_COSTS.map(([key, label]) => (
            <Field key={key} label={label}>
              <NumberInput
                ariaLabel={label}
                value={operating[key]}
                min={0}
                step={10}
                suffix="€ / mois"
                onChange={(value) => sim.updateOperating({ [key]: value })}
              />
            </Field>
          ))}
        </div>
      </div>
    </Card>
  );
}
