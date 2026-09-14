'use client';

import { Plus, Trash2 } from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Label, NumberInput, SelectInput, SliderInput } from '@/components/ui/Input';
import {
  CITY_OPTIONS,
  LOCATION_OPTIONS,
  RESTAURANT_TYPE_OPTIONS,
  createStaffMember,
  estimateMonthlyRent,
} from '@/data/presets';
import { DEFAULT_SALARIES, STAFF_ROLE_LABELS } from '@/data/france-benchmarks';
import { formatCurrency, formatPercent } from '@/lib/utils/format';
import type { SimulationInput, StaffRoleId } from '@/types/models';

const STAFF_ROLE_OPTIONS = Object.entries(STAFF_ROLE_LABELS).map(([id, label]) => ({
  id: id as StaffRoleId,
  label,
}));

export function AssumptionsPanel({
  input,
  onChange,
  onApplyRestaurantType,
  onApplyLocation,
}: {
  input: SimulationInput;
  onChange: (input: SimulationInput) => void;
  onApplyRestaurantType: (type: SimulationInput['profile']['restaurantType']) => void;
  onApplyLocation: (
    city: SimulationInput['profile']['city'],
    locationType: SimulationInput['profile']['locationType'],
    surfaceSqm?: number,
  ) => void;
}) {
  const benchmarkRent = estimateMonthlyRent(
    input.profile.city,
    input.profile.locationType,
    input.profile.surfaceSqm,
  );

  const updateProfile = (patch: Partial<SimulationInput['profile']>) => {
    onChange({ ...input, profile: { ...input.profile, ...patch } });
  };

  const updateOperating = (patch: Partial<SimulationInput['operating']>) => {
    onChange({ ...input, operating: { ...input.operating, ...patch } });
  };

  const updateStaff = (id: string, patch: Partial<SimulationInput['staff'][number]>) => {
    onChange({
      ...input,
      staff: input.staff.map((member) => (member.id === id ? { ...member, ...patch } : member)),
    });
  };

  const removeStaff = (id: string) => {
    onChange({ ...input, staff: input.staff.filter((member) => member.id !== id) });
  };

  const addStaff = () => {
    onChange({ ...input, staff: [...input.staff, createStaffMember('waiter', 1)] });
  };

  const ticketTotal =
    input.profile.ticketBreakdown.food +
    input.profile.ticketBreakdown.beverages +
    input.profile.ticketBreakdown.alcohol +
    input.profile.ticketBreakdown.dessert +
    input.profile.ticketBreakdown.other;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader title="1. Votre restaurant" subtitle="Localisation et concept" />
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label hint="Influence le loyer et le potentiel">Ville</Label>
            <SelectInput
              value={input.profile.city}
              onChange={(city) => onApplyLocation(city, input.profile.locationType, input.profile.surfaceSqm)}
              options={CITY_OPTIONS}
            />
          </div>
          <div>
            <Label>Type de localisation</Label>
            <SelectInput
              value={input.profile.locationType}
              onChange={(locationType) =>
                onApplyLocation(input.profile.city, locationType, input.profile.surfaceSqm)
              }
              options={LOCATION_OPTIONS}
            />
          </div>
          <div>
            <Label>Type de restaurant</Label>
            <SelectInput
              value={input.profile.restaurantType}
              onChange={onApplyRestaurantType}
              options={RESTAURANT_TYPE_OPTIONS}
            />
          </div>
          <div>
            <Label>Nom du projet</Label>
            <input
              value={input.profile.name}
              onChange={(event) => updateProfile({ name: event.target.value })}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
            />
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader title="2. Votre capacité" subtitle="Fréquentation et exploitation" />
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label>Nombre de places</Label>
            <NumberInput value={input.profile.seatingCapacity} onChange={(value) => updateProfile({ seatingCapacity: value })} />
          </div>
          <div>
            <Label>Services / jour</Label>
            <NumberInput value={input.profile.servicesPerDay} onChange={(value) => updateProfile({ servicesPerDay: value })} />
          </div>
          <div>
            <Label>Jours / semaine</Label>
            <NumberInput value={input.profile.openingDaysPerWeek} onChange={(value) => updateProfile({ openingDaysPerWeek: value })} />
          </div>
          <div>
            <Label>Semaines / an</Label>
            <NumberInput value={input.profile.openingWeeksPerYear} onChange={(value) => updateProfile({ openingWeeksPerYear: value })} />
          </div>
          <div className="md:col-span-2">
            <Label hint="Benchmark indicatif selon le type de restaurant">Taux de remplissage</Label>
            <SliderInput
              value={input.profile.occupancyRate}
              onChange={(value) => updateProfile({ occupancyRate: value })}
              min={0.1}
              max={1}
              step={0.01}
              formatValue={(value) => formatPercent(value)}
            />
          </div>
          <div>
            <Label>Part takeaway</Label>
            <SliderInput
              value={input.profile.takeawayShare}
              onChange={(value) => updateProfile({ takeawayShare: value })}
              min={0}
              max={0.5}
              step={0.01}
              formatValue={(value) => formatPercent(value)}
            />
          </div>
          <div>
            <Label>Part livraison</Label>
            <SliderInput
              value={input.profile.deliveryShare}
              onChange={(value) => updateProfile({ deliveryShare: value })}
              min={0}
              max={0.8}
              step={0.01}
              formatValue={(value) => formatPercent(value)}
            />
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader
          title="3. Votre ticket moyen"
          subtitle={`Total TTC : ${formatCurrency(ticketTotal)}`}
        />
        <div className="grid gap-4 md:grid-cols-2">
          {([
            ['food', 'Plats'],
            ['beverages', 'Boissons'],
            ['alcohol', 'Alcool'],
            ['dessert', 'Dessert'],
            ['other', 'Autre'],
          ] as const).map(([key, label]) => (
            <div key={key}>
              <Label>{label}</Label>
              <NumberInput
                value={input.profile.ticketBreakdown[key]}
                onChange={(value) =>
                  updateProfile({
                    ticketBreakdown: { ...input.profile.ticketBreakdown, [key]: value },
                  })
                }
                suffix="€"
                step={0.5}
              />
            </div>
          ))}
          <div>
            <Label hint="Benchmark indicatif">Coût matière (% CA)</Label>
            <SliderInput
              value={input.operating.foodCostRate}
              onChange={(value) => updateOperating({ foodCostRate: value })}
              min={0.2}
              max={0.45}
              step={0.01}
              formatValue={(value) => formatPercent(value)}
            />
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader
          title="4. Votre équipe"
          subtitle="Les coûts employeur sont des estimations. Le coût réel dépend du contrat, des exonérations, de la convention collective et de la situation de l'entreprise."
          action={
            <button
              type="button"
              onClick={addStaff}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-3 py-2 text-sm font-medium text-white"
            >
              <Plus className="h-4 w-4" />
              Ajouter
            </button>
          }
        />
        <div className="space-y-3">
          {input.staff.map((member) => (
            <div key={member.id} className="grid gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3 md:grid-cols-[1.4fr_0.6fr_1fr_auto]">
              <SelectInput
                value={member.role}
                onChange={(role) =>
                  updateStaff(member.id, {
                    role,
                    grossMonthlySalary: DEFAULT_SALARIES[role].value,
                  })
                }
                options={STAFF_ROLE_OPTIONS}
              />
              <NumberInput
                value={member.count}
                onChange={(count) => updateStaff(member.id, { count })}
                min={0}
              />
              <NumberInput
                value={member.grossMonthlySalary}
                onChange={(grossMonthlySalary) => updateStaff(member.id, { grossMonthlySalary })}
                suffix="€ brut"
              />
              <button
                type="button"
                onClick={() => removeStaff(member.id)}
                className="rounded-xl border border-slate-200 px-3 py-2 text-slate-500 hover:bg-white"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader title="5. Votre immobilier" subtitle="Benchmark vs hypothèse utilisateur" />
        <div className="mb-4 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
          <p>
            <span className="font-medium text-slate-900">Valeur benchmark :</span>{' '}
            {formatCurrency(benchmarkRent)} / mois
          </p>
          <p className="mt-1">
            <span className="font-medium text-slate-900">Votre hypothèse :</span>{' '}
            {formatCurrency(input.operating.rentMonthly)} / mois
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label>Surface (m²)</Label>
            <NumberInput
              value={input.profile.surfaceSqm}
              onChange={(surfaceSqm) => onApplyLocation(input.profile.city, input.profile.locationType, surfaceSqm)}
            />
          </div>
          <div>
            <Label>Loyer mensuel</Label>
            <NumberInput
              value={input.operating.rentMonthly}
              onChange={(rentMonthly) => updateOperating({ rentMonthly })}
              suffix="€"
            />
          </div>
          <div>
            <Label>Charges locatives</Label>
            <NumberInput
              value={input.operating.rentChargesMonthly}
              onChange={(rentChargesMonthly) => updateOperating({ rentChargesMonthly })}
              suffix="€"
            />
          </div>
          <div>
            <Label>Énergie</Label>
            <NumberInput
              value={input.operating.utilitiesMonthly}
              onChange={(utilitiesMonthly) => updateOperating({ utilitiesMonthly })}
              suffix="€"
            />
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader title="6. Vos investissements" subtitle="Capex et financement" />
        <div className="grid gap-4 md:grid-cols-2">
          {([
            ['kitchenEquipment', 'Cuisine'],
            ['fitout', 'Travaux'],
            ['furniture', 'Mobilier'],
            ['pos', 'Caisse / POS'],
            ['signage', 'Signalétique'],
            ['otherEquipment', 'Autres'],
          ] as const).map(([key, label]) => (
            <div key={key}>
              <Label>{label}</Label>
              <NumberInput
                value={input.capex[key]}
                onChange={(value) => onChange({ ...input, capex: { ...input.capex, [key]: value } })}
                suffix="€"
              />
            </div>
          ))}
          <div>
            <Label>Apport</Label>
            <NumberInput
              value={input.financing.equity}
              onChange={(equity) => onChange({ ...input, financing: { ...input.financing, equity } })}
              suffix="€"
            />
          </div>
          <div>
            <Label>Emprunt</Label>
            <NumberInput
              value={input.financing.debt}
              onChange={(debt) => onChange({ ...input, financing: { ...input.financing, debt } })}
              suffix="€"
            />
          </div>
        </div>
      </Card>
    </div>
  );
}
