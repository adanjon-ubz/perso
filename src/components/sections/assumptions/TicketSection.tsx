import { Receipt } from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Field } from '@/components/ui/Field';
import { NumberInput } from '@/components/ui/Input';
import { BenchmarkHint } from '@/components/ui/Benchmark';
import { getTicketBenchmark } from '@/data/france-benchmarks';
import type { SimulationController } from '@/hooks/useSimulation';
import { formatCurrency, formatPercent } from '@/lib/utils/format';

const TICKET_PARTS = [
  { key: 'food', label: 'Nourriture', vat: 'vatFood' },
  { key: 'beverages', label: 'Boissons sans alcool', vat: 'vatBeverage' },
  { key: 'alcohol', label: 'Alcool', vat: 'vatAlcohol' },
  { key: 'dessert', label: 'Dessert', vat: 'vatFood' },
  { key: 'other', label: 'Autre', vat: 'vatFood' },
] as const;

export function TicketSection({ sim }: { sim: SimulationController }) {
  const { profile, tax } = sim.input;
  const { revenue } = sim.result.pnl;
  const offPremise = profile.takeawayShare + profile.deliveryShare;

  return (
    <Card>
      <CardHeader
        title="3. Votre ticket moyen"
        subtitle={`${formatCurrency(revenue.averageTicketTTC)} TTC · ${formatCurrency(
          revenue.averageTicketHT,
        )} HT — TVA moyenne ${formatPercent(revenue.averageVatRate, 1)}`}
        action={<Receipt className="text-slate-300" size={19} />}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        {TICKET_PARTS.map((part) => (
          <Field
            key={part.key}
            label={part.label}
            hint={`TVA appliquée : ${formatPercent(tax[part.vat], 0)}`}
          >
            <NumberInput
              ariaLabel={`Ticket ${part.label}`}
              value={profile.ticketBreakdown[part.key]}
              min={0}
              step={0.5}
              suffix="€ TTC"
              onChange={(value) => sim.updateTicket({ [part.key]: value })}
            />
          </Field>
        ))}
      </div>
      <BenchmarkHint
        benchmark={getTicketBenchmark(profile.restaurantType, profile.city, profile.locationType)}
      />

      <div className="mt-5 border-t border-slate-100 pt-4">
        <p className="mb-3 text-sm font-medium text-slate-700">
          Répartition du chiffre d&apos;affaires
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Part à emporter"
            hint="Part du chiffre d'affaires total réalisée en vente à emporter."
          >
            <NumberInput
              ariaLabel="Part à emporter"
              value={Math.round(profile.takeawayShare * 100)}
              min={0}
              max={95}
              suffix="% du CA"
              onChange={(value) => sim.updateProfile({ takeawayShare: value / 100 })}
            />
          </Field>
          <Field
            label="Part livraison"
            hint="Part du CA livrée via une plateforme : la commission s'applique sur ce montant."
          >
            <NumberInput
              ariaLabel="Part livraison"
              value={Math.round(profile.deliveryShare * 100)}
              min={0}
              max={95}
              suffix="% du CA"
              onChange={(value) => sim.updateProfile({ deliveryShare: value / 100 })}
            />
          </Field>
        </div>
        <p className="mt-2 text-[11px] text-slate-400">
          Salle : {formatPercent(Math.max(0.05, 1 - offPremise), 0)} du chiffre d&apos;affaires.
        </p>
      </div>

      <div className="mt-4 grid gap-3 rounded-xl bg-slate-50 p-4 sm:grid-cols-3">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-slate-400">Salle</p>
          <p className="text-sm font-semibold">{formatCurrency(revenue.dineInRevenue, true)}</p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wide text-slate-400">À emporter</p>
          <p className="text-sm font-semibold">{formatCurrency(revenue.takeawayRevenue, true)}</p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wide text-slate-400">Livraison</p>
          <p className="text-sm font-semibold">{formatCurrency(revenue.deliveryRevenue, true)}</p>
        </div>
      </div>
    </Card>
  );
}
