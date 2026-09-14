import { Landmark } from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Field } from '@/components/ui/Field';
import { NumberInput } from '@/components/ui/Input';
import type { SimulationController } from '@/hooks/useSimulation';
import { formatCurrency } from '@/lib/utils/format';

const CAPEX_ITEMS = [
  ['fitout', 'Travaux & agencement'],
  ['kitchenEquipment', 'Équipement de cuisine'],
  ['furniture', 'Mobilier'],
  ['pos', 'Caisse / POS'],
  ['signage', 'Signalétique'],
  ['otherEquipment', 'Autres équipements'],
] as const;

export function InvestmentSection({ sim }: { sim: SimulationController }) {
  const { capex, usefulLife, financing } = sim.input;
  const { totalCapex, pnl } = sim.result;

  return (
    <Card>
      <CardHeader
        title="6. Vos investissements"
        subtitle={`${formatCurrency(totalCapex, true)} investis · ${formatCurrency(
          pnl.depreciation.total,
          true,
        )} d'amortissement par an`}
        action={<Landmark className="text-slate-300" size={19} />}
      />

      <div className="space-y-3">
        {CAPEX_ITEMS.map(([key, label]) => (
          <div key={key} className="grid grid-cols-[1fr_92px] items-end gap-2">
            <Field label={label}>
              <NumberInput
                ariaLabel={label}
                value={Math.round(capex[key])}
                min={0}
                step={500}
                suffix="€ HT"
                onChange={(value) => sim.updateCapex({ [key]: value })}
              />
            </Field>
            <Field label="Durée">
              <NumberInput
                ariaLabel={`Durée d'amortissement — ${label}`}
                value={usefulLife[key]}
                min={1}
                max={30}
                suffix="ans"
                onChange={(value) => sim.updateUsefulLife({ [key]: Math.max(1, value) })}
              />
            </Field>
          </div>
        ))}
      </div>

      <div className="my-4 h-px bg-slate-100" />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Apport" hint="Capitaux propres investis au démarrage.">
          <NumberInput
            ariaLabel="Apport"
            value={Math.round(financing.equity)}
            min={0}
            step={1000}
            suffix="€"
            onChange={(equity) => sim.updateFinancing({ equity })}
          />
        </Field>
        <Field label="Emprunt">
          <NumberInput
            ariaLabel="Emprunt"
            value={Math.round(financing.debt)}
            min={0}
            step={1000}
            suffix="€"
            onChange={(debt) => sim.updateFinancing({ debt })}
          />
        </Field>
        <Field label="Taux d'intérêt">
          <NumberInput
            ariaLabel="Taux d'intérêt"
            value={Math.round(financing.interestRate * 1000) / 10}
            min={0}
            max={20}
            step={0.1}
            suffix="%"
            onChange={(value) => sim.updateFinancing({ interestRate: value / 100 })}
          />
        </Field>
        <Field label="Durée du prêt">
          <NumberInput
            ariaLabel="Durée du prêt"
            value={financing.loanDurationYears}
            min={1}
            max={20}
            suffix="ans"
            onChange={(loanDurationYears) =>
              sim.updateFinancing({ loanDurationYears: Math.max(1, loanDurationYears) })
            }
          />
        </Field>
      </div>

      <p className="mt-4 text-[11px] leading-5 text-slate-400">
        Les intérêts sont calculés sur l&apos;encours moyen du prêt ({formatCurrency(
          pnl.financing.averageOutstandingDebt,
          true,
        )}
        ), amortissement linéaire du capital. Le droit au bail, le fonds de commerce et le besoin en
        fonds de roulement ne sont pas inclus dans cet investissement.
      </p>
    </Card>
  );
}
