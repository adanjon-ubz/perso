'use client';

import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  BarChart3,
  BookOpen,
  ChefHat,
  CirclePlus,
  RotateCcw,
  Settings2,
  Sparkles,
  Trash2,
  TrendingUp,
  X,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Label, NumberInput, SelectInput, SliderInput } from '@/components/ui/Input';
import { KPIHeader } from '@/components/sections/KPIHeader';
import {
  BENCHMARKS,
  FOOD_COST_BY_TYPE,
  METHODOLOGY_SOURCES,
  RENT_PER_SQM,
  STAFF_ROLE_LABELS,
  TICKET_BY_TYPE,
} from '@/data/france-benchmarks';
import {
  CITY_OPTIONS,
  LOCATION_OPTIONS,
  RESTAURANT_TYPE_OPTIONS,
  createStaffMember,
} from '@/data/presets';
import { useSimulation } from '@/hooks/useSimulation';
import { formatCurrency, formatNumber, formatPercent } from '@/lib/utils/format';
import type {
  CuisineTypeId,
  Insight,
  SimulationInput,
  StaffMember,
  StaffRoleId,
} from '@/types/models';

const CUISINES: Array<{ id: CuisineTypeId; label: string }> = [
  { id: 'french', label: 'Française' },
  { id: 'italian', label: 'Italienne' },
  { id: 'asian', label: 'Asiatique' },
  { id: 'american', label: 'Américaine' },
  { id: 'mediterranean', label: 'Méditerranéenne' },
  { id: 'vegetarian', label: 'Végétarienne' },
  { id: 'mixed', label: 'Mixte' },
  { id: 'other', label: 'Autre' },
];

const STAFF_OPTIONS = Object.entries(STAFF_ROLE_LABELS).map(([id, label]) => ({
  id: id as StaffRoleId,
  label,
}));

const CHART_TOOLTIP_STYLE = {
  borderRadius: 12,
  border: '1px solid #e2e8f0',
  boxShadow: '0 8px 24px rgba(15,23,42,.08)',
  fontSize: 12,
};

function BenchmarkHint({
  value,
  low,
  high,
  unit,
}: {
  value: number;
  low: number;
  high: number;
  unit: string;
}) {
  const percent = unit.includes('%');
  const display = (number: number) =>
    percent ? `${Math.round(number * 100)} %` : `${formatNumber(number)} ${unit}`;
  return (
    <p className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-400">
      <span className="rounded-full bg-blue-50 px-1.5 py-0.5 font-semibold text-blue-600">
        Benchmark
      </span>
      {display(value)} · plage {display(low)}–{display(high)}
    </p>
  );
}

function Field({
  label,
  children,
  benchmark,
}: {
  label: string;
  children: React.ReactNode;
  benchmark?: { value: number; low: number; high: number; unit: string };
}) {
  return (
    <div>
      <Label>{label}</Label>
      {children}
      {benchmark ? <BenchmarkHint {...benchmark} /> : null}
    </div>
  );
}

function insightStyle(level: Insight['level']) {
  return {
    success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    warning: 'border-amber-200 bg-amber-50 text-amber-800',
    danger: 'border-rose-200 bg-rose-50 text-rose-800',
    info: 'border-blue-200 bg-blue-50 text-blue-800',
  }[level];
}

function pnlRow(label: string, value: number, strong = false) {
  return (
    <div
      className={`flex items-center justify-between border-b border-slate-100 py-2.5 text-sm ${
        strong ? 'font-bold text-slate-950' : 'text-slate-600'
      }`}
    >
      <span>{label}</span>
      <span className={value < 0 ? 'text-rose-600' : ''}>{formatCurrency(value)}</span>
    </div>
  );
}

export function Simulator() {
  const { input, result, setInput, updateProfile, applyRestaurantType, applyLocation, reset } =
    useSimulation();
  const [showSources, setShowSources] = useState(false);
  const [activeScenario, setActiveScenario] = useState<'pessimistic' | 'base' | 'optimistic'>(
    'base',
  );

  const updateOperating = (patch: Partial<SimulationInput['operating']>) =>
    setInput((current) => ({
      ...current,
      operating: { ...current.operating, ...patch },
    }));
  const updateFinancing = (patch: Partial<SimulationInput['financing']>) =>
    setInput((current) => ({
      ...current,
      financing: { ...current.financing, ...patch },
    }));
  const updateCapex = (patch: Partial<SimulationInput['capex']>) =>
    setInput((current) => ({ ...current, capex: { ...current.capex, ...patch } }));

  const updateStaff = (id: string, patch: Partial<StaffMember>) =>
    setInput((current) => ({
      ...current,
      staff: current.staff.map((member) => (member.id === id ? { ...member, ...patch } : member)),
    }));

  const removeStaff = (id: string) =>
    setInput((current) => ({
      ...current,
      staff: current.staff.filter((member) => member.id !== id),
    }));

  const addStaff = () =>
    setInput((current) => ({
      ...current,
      staff: [...current.staff, createStaffMember('polyvalent')],
    }));

  const ticketTotal = result.pnl.revenue.averageTicketTTC;
  const foodBenchmark = FOOD_COST_BY_TYPE[input.profile.restaurantType];
  const ticketBenchmark = TICKET_BY_TYPE[input.profile.restaurantType];
  const rentBenchmark = RENT_PER_SQM[input.profile.city][input.profile.locationType];

  const costStructure = [
    { name: 'Matières', value: result.pnl.variableCosts.total, color: '#f59e0b' },
    { name: 'Personnel', value: result.pnl.laborCosts.totalEmployerCost, color: '#6366f1' },
    { name: 'Loyer', value: result.pnl.fixedCosts.rent, color: '#ec4899' },
    { name: 'Énergie', value: result.pnl.fixedCosts.utilities, color: '#06b6d4' },
    {
      name: 'Autres',
      value:
        result.pnl.fixedCosts.total -
        result.pnl.fixedCosts.rent -
        result.pnl.fixedCosts.utilities,
      color: '#94a3b8',
    },
    { name: 'EBITDA', value: Math.max(0, result.pnl.ebitda), color: '#10b981' },
  ].filter((item) => item.value > 0);

  const coversCurve = result.occupancyCurve.map((point) => ({
    covers: Math.round(
      input.profile.seatingCapacity * input.profile.servicesPerDay * point.occupancy,
    ),
    revenue: point.revenue,
  }));

  const waterfall = [
    { name: 'CA HT', value: result.pnl.revenue.totalRevenue, color: '#0f172a' },
    { name: 'Matières', value: -result.pnl.variableCosts.total, color: '#f59e0b' },
    { name: 'Personnel', value: -result.pnl.laborCosts.totalEmployerCost, color: '#6366f1' },
    { name: 'Loyer', value: -result.pnl.fixedCosts.rent, color: '#ec4899' },
    {
      name: 'Autres fixes',
      value: -(result.pnl.fixedCosts.total - result.pnl.fixedCosts.rent),
      color: '#94a3b8',
    },
    { name: 'EBITDA', value: result.pnl.ebitda, color: '#10b981' },
    { name: 'Résultat net', value: result.pnl.netIncome, color: '#2563eb' },
  ];

  const sensitivityTickets = useMemo(
    () => [...new Set(result.sensitivity.map((cell) => cell.ticket))],
    [result.sensitivity],
  );
  const sensitivityOccupancies = useMemo(
    () => [...new Set(result.sensitivity.map((cell) => cell.occupancy))],
    [result.sensitivity],
  );

  const selectedScenario =
    result.scenarios.find((scenario) => scenario.id === activeScenario) ?? result.scenarios[1];

  const laborShare =
    result.pnl.revenue.totalRevenue > 0
      ? result.pnl.laborCosts.totalEmployerCost / result.pnl.revenue.totalRevenue
      : 0;

  return (
    <main className="min-h-screen bg-[#f6f8fb] text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-600 text-white">
              <ChefHat size={22} />
            </div>
            <div>
              <p className="text-lg font-bold tracking-tight">Restaurant Profitability</p>
              <p className="text-xs text-slate-500">Simulateur France · modèle 2026</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSources(true)}
              className="hidden items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 sm:flex"
            >
              <BookOpen size={16} /> Sources & méthodologie
            </button>
            <button
              onClick={reset}
              className="flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              <RotateCcw size={15} /> Réinitialiser
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6">
          <p className="mb-2 text-sm font-semibold text-emerald-700">SIMULATEUR INTERACTIF</p>
          <h1 className="max-w-3xl text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Votre restaurant peut-il être rentable ?
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Ajustez vos hypothèses. Le P&L, le point mort et les scénarios se recalculent
            instantanément. Les montants du compte de résultat sont affichés hors taxes.
          </p>
        </div>

        <KPIHeader result={result} />

        <div className="mt-6 grid items-start gap-6 xl:grid-cols-[460px_minmax(0,1fr)]">
          <aside className="space-y-4 xl:sticky xl:top-4">
            <Card>
              <CardHeader
                title="1. Votre restaurant"
                subtitle="Le preset initialise des valeurs, toutes modifiables."
                action={<Settings2 className="text-slate-400" size={19} />}
              />
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-2">
                <Field label="Ville">
                  <SelectInput
                    value={input.profile.city}
                    options={CITY_OPTIONS}
                    onChange={(city) =>
                      applyLocation(city, input.profile.locationType, input.profile.surfaceSqm)
                    }
                  />
                </Field>
                <Field label="Emplacement">
                  <SelectInput
                    value={input.profile.locationType}
                    options={LOCATION_OPTIONS}
                    onChange={(location) =>
                      applyLocation(input.profile.city, location, input.profile.surfaceSqm)
                    }
                  />
                </Field>
                <Field label="Type de restaurant">
                  <SelectInput
                    value={input.profile.restaurantType}
                    options={RESTAURANT_TYPE_OPTIONS}
                    onChange={applyRestaurantType}
                  />
                </Field>
                <Field label="Cuisine">
                  <SelectInput
                    value={input.profile.cuisineType}
                    options={CUISINES}
                    onChange={(cuisineType) => updateProfile({ cuisineType })}
                  />
                </Field>
              </div>
            </Card>

            <Card>
              <CardHeader title="2. Capacité & fréquentation" />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Nombre de places">
                  <NumberInput
                    value={input.profile.seatingCapacity}
                    min={0}
                    onChange={(seatingCapacity) => updateProfile({ seatingCapacity })}
                  />
                </Field>
                <Field label="Services / jour">
                  <NumberInput
                    value={input.profile.servicesPerDay}
                    min={1}
                    max={5}
                    onChange={(servicesPerDay) => updateProfile({ servicesPerDay })}
                  />
                </Field>
                <Field label="Jours / semaine">
                  <NumberInput
                    value={input.profile.openingDaysPerWeek}
                    min={1}
                    max={7}
                    onChange={(openingDaysPerWeek) => updateProfile({ openingDaysPerWeek })}
                  />
                </Field>
                <Field label="Semaines / an">
                  <NumberInput
                    value={input.profile.openingWeeksPerYear}
                    min={1}
                    max={52}
                    onChange={(openingWeeksPerYear) => updateProfile({ openingWeeksPerYear })}
                  />
                </Field>
              </div>
              <div className="mt-5 rounded-xl bg-slate-50 p-4">
                <Label>Taux de remplissage</Label>
                <SliderInput
                  value={input.profile.occupancyRate}
                  min={0.1}
                  max={1}
                  step={0.01}
                  formatValue={formatPercent}
                  onChange={(occupancyRate) => updateProfile({ occupancyRate })}
                />
                <BenchmarkHint
                  value={
                    input.profile.restaurantType === 'fast_food'
                      ? BENCHMARKS.occupancyFastFood.value
                      : BENCHMARKS.occupancyTraditional.value
                  }
                  low={
                    input.profile.restaurantType === 'fast_food'
                      ? BENCHMARKS.occupancyFastFood.low
                      : BENCHMARKS.occupancyTraditional.low
                  }
                  high={
                    input.profile.restaurantType === 'fast_food'
                      ? BENCHMARKS.occupancyFastFood.high
                      : BENCHMARKS.occupancyTraditional.high
                  }
                  unit="%"
                />
              </div>
            </Card>

            <Card>
              <CardHeader
                title="3. Ticket moyen"
                subtitle={`${formatCurrency(ticketTotal)} TTC · ${formatCurrency(
                  result.pnl.revenue.averageTicketHT,
                )} HT`}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                {(
                  [
                    ['food', 'Nourriture'],
                    ['beverages', 'Boissons soft'],
                    ['alcohol', 'Alcool'],
                    ['dessert', 'Dessert'],
                  ] as const
                ).map(([key, label]) => (
                  <Field key={key} label={label}>
                    <NumberInput
                      value={input.profile.ticketBreakdown[key]}
                      min={0}
                      step={0.5}
                      suffix="€ TTC"
                      onChange={(value) =>
                        updateProfile({
                          ticketBreakdown: { ...input.profile.ticketBreakdown, [key]: value },
                        })
                      }
                    />
                  </Field>
                ))}
              </div>
              <BenchmarkHint
                value={ticketBenchmark.value}
                low={ticketBenchmark.low}
                high={ticketBenchmark.high}
                unit={ticketBenchmark.unit}
              />
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Field label="Part à emporter">
                  <NumberInput
                    value={input.profile.takeawayShare * 100}
                    min={0}
                    max={100}
                    suffix="%"
                    onChange={(value) => updateProfile({ takeawayShare: value / 100 })}
                  />
                </Field>
                <Field label="Part livraison">
                  <NumberInput
                    value={input.profile.deliveryShare * 100}
                    min={0}
                    max={100}
                    suffix="%"
                    onChange={(value) => updateProfile({ deliveryShare: value / 100 })}
                  />
                </Field>
              </div>
            </Card>

            <Card>
              <CardHeader
                title="4. Équipe"
                subtitle={`${formatCurrency(
                  result.pnl.laborCosts.totalEmployerCost,
                  true,
                )} / an · ${formatPercent(laborShare)} du CA`}
              />
              <div className="space-y-3">
                {input.staff.map((member, index) => (
                  <div key={member.id} className="rounded-xl border border-slate-200 p-3">
                    <div className="flex items-center gap-2">
                      <SelectInput
                        value={member.role}
                        options={STAFF_OPTIONS}
                        onChange={(role) =>
                          updateStaff(member.id, {
                            role,
                          })
                        }
                      />
                      <button
                        aria-label="Supprimer"
                        onClick={() => removeStaff(member.id)}
                        className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                      <NumberInput
                        value={member.count}
                        min={0}
                        onChange={(count) => updateStaff(member.id, { count })}
                      />
                      <NumberInput
                        value={member.grossMonthlySalary}
                        min={0}
                        step={50}
                        suffix="€"
                        onChange={(grossMonthlySalary) =>
                          updateStaff(member.id, { grossMonthlySalary })
                        }
                      />
                      <NumberInput
                        value={member.weeklyHours}
                        min={1}
                        max={48}
                        suffix="h"
                        onChange={(weeklyHours) => updateStaff(member.id, { weeklyHours })}
                      />
                      <SelectInput
                        value={member.employmentType}
                        options={[
                          { id: 'full_time', label: 'Temps plein' },
                          { id: 'part_time', label: 'Temps partiel' },
                        ]}
                        onChange={(employmentType) =>
                          updateStaff(member.id, { employmentType })
                        }
                      />
                    </div>
                    <p className="mt-1.5 text-[11px] text-slate-400">
                      Effectif · brut mensuel · heures / semaine · contrat
                    </p>
                    <p className="mt-2 text-xs font-medium text-slate-600">
                      Coût employeur estimé :{' '}
                      {formatCurrency(
                        result.pnl.laborCosts.lines[index]?.annualEmployerCost ?? 0,
                        true,
                      )}{' '}
                      / an · taux effectif{' '}
                      {formatPercent(
                        result.pnl.laborCosts.lines[index]?.employerCostRate ?? 0,
                      )}
                    </p>
                  </div>
                ))}
              </div>
              <button
                onClick={addStaff}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-emerald-300 bg-emerald-50 py-2.5 text-sm font-semibold text-emerald-700"
              >
                <CirclePlus size={17} /> Ajouter un employé
              </button>
              <p className="mt-3 text-xs leading-5 text-slate-400">
                Les coûts employeur sont des estimations. Le coût réel dépend du contrat, des
                exonérations, de la convention collective et de la situation de l’entreprise.
              </p>
            </Card>

            <Card>
              <CardHeader title="5. Immobilier & charges" />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Surface">
                  <NumberInput
                    value={input.profile.surfaceSqm}
                    min={0}
                    suffix="m²"
                    onChange={(surfaceSqm) =>
                      applyLocation(input.profile.city, input.profile.locationType, surfaceSqm)
                    }
                  />
                </Field>
                <Field label="Loyer mensuel">
                  <NumberInput
                    value={input.operating.rentMonthly}
                    min={0}
                    suffix="€ HT"
                    onChange={(rentMonthly) => updateOperating({ rentMonthly })}
                  />
                </Field>
              </div>
              <BenchmarkHint
                value={rentBenchmark.value}
                low={rentBenchmark.low}
                high={rentBenchmark.high}
                unit={rentBenchmark.unit}
              />
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {(
                  [
                    ['rentChargesMonthly', 'Charges locatives'],
                    ['utilitiesMonthly', 'Énergie & eau'],
                    ['insuranceMonthly', 'Assurance'],
                    ['accountingMonthly', 'Comptabilité'],
                    ['softwareMonthly', 'Logiciels'],
                    ['cleaningMonthly', 'Nettoyage'],
                    ['maintenanceMonthly', 'Maintenance'],
                    ['marketingMonthly', 'Marketing'],
                    ['miscellaneousMonthly', 'Autres'],
                  ] as const
                ).map(([key, label]) => (
                  <Field key={key} label={label}>
                    <NumberInput
                      value={input.operating[key]}
                      min={0}
                      suffix="€ / mois"
                      onChange={(value) => updateOperating({ [key]: value })}
                    />
                  </Field>
                ))}
              </div>
              <div className="mt-5 rounded-xl bg-amber-50 p-4">
                <Field
                  label="Coût matière"
                  benchmark={{
                    value: foodBenchmark.value,
                    low: foodBenchmark.low,
                    high: foodBenchmark.high,
                    unit: foodBenchmark.unit,
                  }}
                >
                  <SliderInput
                    value={input.operating.foodCostRate}
                    min={0.18}
                    max={0.5}
                    step={0.005}
                    formatValue={formatPercent}
                    onChange={(foodCostRate) => updateOperating({ foodCostRate })}
                  />
                </Field>
              </div>
            </Card>

            <Card>
              <CardHeader title="6. Investissement & financement" />
              <div className="grid gap-4 sm:grid-cols-2">
                {(
                  [
                    ['fitout', 'Travaux'],
                    ['kitchenEquipment', 'Cuisine'],
                    ['furniture', 'Mobilier'],
                    ['pos', 'Caisse / POS'],
                    ['signage', 'Signalétique'],
                    ['otherEquipment', 'Autres'],
                  ] as const
                ).map(([key, label]) => (
                  <Field key={key} label={label}>
                    <NumberInput
                      value={Math.round(input.capex[key])}
                      min={0}
                      suffix="€ HT"
                      onChange={(value) => updateCapex({ [key]: value })}
                    />
                  </Field>
                ))}
              </div>
              <div className="my-4 h-px bg-slate-100" />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Apport">
                  <NumberInput
                    value={Math.round(input.financing.equity)}
                    min={0}
                    suffix="€"
                    onChange={(equity) => updateFinancing({ equity })}
                  />
                </Field>
                <Field label="Dette">
                  <NumberInput
                    value={Math.round(input.financing.debt)}
                    min={0}
                    suffix="€"
                    onChange={(debt) => updateFinancing({ debt })}
                  />
                </Field>
                <Field label="Taux d’intérêt">
                  <NumberInput
                    value={input.financing.interestRate * 100}
                    min={0}
                    step={0.1}
                    suffix="%"
                    onChange={(value) => updateFinancing({ interestRate: value / 100 })}
                  />
                </Field>
                <Field label="Durée du prêt">
                  <NumberInput
                    value={input.financing.loanDurationYears}
                    min={1}
                    max={20}
                    suffix="ans"
                    onChange={(loanDurationYears) => updateFinancing({ loanDurationYears })}
                  />
                </Field>
              </div>
            </Card>
          </aside>

          <section className="min-w-0 space-y-6">
            <Card className="overflow-hidden bg-slate-950 text-white">
              <div className="grid gap-6 lg:grid-cols-[1.25fr_.75fr]">
                <div>
                  <p className="text-sm font-semibold text-emerald-400">RÉSULTAT ESTIMÉ</p>
                  <div className="mt-3 flex flex-wrap items-end gap-x-8 gap-y-4">
                    <div>
                      <p className="text-sm text-slate-400">Résultat net annuel</p>
                      <p
                        className={`mt-1 text-4xl font-bold ${
                          result.pnl.netIncome >= 0 ? 'text-white' : 'text-rose-400'
                        }`}
                      >
                        {formatCurrency(result.pnl.netIncome, true)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">Marge nette</p>
                      <p className="mt-1 text-2xl font-semibold">
                        {formatPercent(result.pnl.netMargin)}
                      </p>
                    </div>
                  </div>
                  <p className="mt-5 max-w-xl text-sm leading-6 text-slate-400">
                    À ce rythme, le restaurant atteint son point mort à{' '}
                    <strong className="text-white">
                      {formatNumber(result.breakEven.breakEvenCoversPerDay)} couverts / jour
                    </strong>
                    , soit <strong className="text-white">{formatPercent(result.breakEven.breakEvenOccupancy)}</strong>{' '}
                    de remplissage.
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Cash-flow simplifié
                  </p>
                  <p className="mt-2 text-2xl font-bold">
                    {formatCurrency(result.cashFlow.operatingCashFlow, true)}
                  </p>
                  <div className="mt-3 space-y-1.5 text-xs text-slate-400">
                    <div className="flex justify-between">
                      <span>Capitaux investis</span>
                      <span>{formatCurrency(result.totalCapex, true)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Rentabilité de l’apport</span>
                      <span>{formatPercent(result.returnOnEquity)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Principal remboursé / an</span>
                      <span>{formatCurrency(result.pnl.financing.annualPrincipalRepayment, true)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <div className="grid gap-3 md:grid-cols-2">
              {result.insights.map((insight) => (
                <div
                  key={insight.id}
                  className={`flex gap-3 rounded-xl border p-4 text-sm leading-5 ${insightStyle(
                    insight.level,
                  )}`}
                >
                  {insight.level === 'success' ? <Sparkles size={18} /> : <AlertTriangle size={18} />}
                  <p>{insight.message}</p>
                </div>
              ))}
            </div>

            <Card>
              <CardHeader
                title="Rentabilité selon le remplissage"
                subtitle="Résultat net, EBITDA et point mort de 10 % à 100 %."
                action={<TrendingUp className="text-emerald-600" size={20} />}
              />
              <div className="h-[340px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={result.occupancyCurve} margin={{ left: 10, right: 10 }}>
                    <defs>
                      <linearGradient id="netFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity={0.28} />
                        <stop offset="100%" stopColor="#10b981" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis
                      dataKey="occupancy"
                      tickFormatter={(value) => `${Math.round(value * 100)} %`}
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis
                      tickFormatter={(value) => `${Math.round(value / 1000)}k€`}
                      tick={{ fontSize: 11 }}
                      width={48}
                    />
                    <Tooltip
                      contentStyle={CHART_TOOLTIP_STYLE}
                      formatter={(value) => formatCurrency(Number(value), true)}
                      labelFormatter={(value) => `${Math.round(Number(value) * 100)} % de remplissage`}
                    />
                    <ReferenceLine y={0} stroke="#e11d48" strokeDasharray="5 5" />
                    <ReferenceLine
                      x={result.breakEven.breakEvenOccupancy}
                      stroke="#0f172a"
                      strokeDasharray="4 4"
                      label={{ value: 'Point mort', fontSize: 11 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="netIncome"
                      name="Résultat net"
                      stroke="#059669"
                      fill="url(#netFill)"
                      strokeWidth={3}
                    />
                    <Line
                      type="monotone"
                      dataKey="ebitda"
                      name="EBITDA"
                      stroke="#6366f1"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Legend />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader title="Compte de résultat simplifié" subtitle="Annuel · hors taxes" />
                <CardTitle>Revenus</CardTitle>
                {pnlRow('Nourriture', result.pnl.revenue.foodRevenue)}
                {pnlRow('Boissons sans alcool', result.pnl.revenue.beverageRevenue)}
                {pnlRow('Alcool', result.pnl.revenue.alcoholRevenue)}
                {pnlRow('À emporter', result.pnl.revenue.takeawayRevenue)}
                {pnlRow('Livraison', result.pnl.revenue.deliveryRevenue)}
                {pnlRow('Chiffre d’affaires total', result.pnl.revenue.totalRevenue, true)}
                <CardTitle className="mt-5">Coûts variables</CardTitle>
                {pnlRow('Achats matières', -result.pnl.variableCosts.foodPurchases)}
                {pnlRow('Boissons', -result.pnl.variableCosts.beveragePurchases)}
                {pnlRow(
                  'Packaging, plateformes & paiement',
                  -(
                    result.pnl.variableCosts.packaging +
                    result.pnl.variableCosts.platformCommissions +
                    result.pnl.variableCosts.paymentFees
                  ),
                )}
                {pnlRow('Marge brute', result.pnl.grossMargin, true)}
                <CardTitle className="mt-5">Exploitation</CardTitle>
                {pnlRow('Masse salariale chargée', -result.pnl.laborCosts.totalEmployerCost)}
                {pnlRow('Loyer & charges fixes', -result.pnl.fixedCosts.total)}
                {pnlRow('EBITDA', result.pnl.ebitda, true)}
                {pnlRow('Amortissements', -result.pnl.depreciation.total)}
                {pnlRow('Intérêts', -result.pnl.financing.annualInterest)}
                {pnlRow('Résultat avant impôt', result.pnl.preTaxIncome, true)}
                {pnlRow('Impôt estimé', -result.pnl.corporateTax)}
                {pnlRow('Résultat net', result.pnl.netIncome, true)}
              </Card>

              <div className="space-y-6">
                <Card>
                  <CardHeader title="Structure des coûts" subtitle="Répartition du chiffre d’affaires" />
                  <div className="h-[270px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={costStructure}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={62}
                          outerRadius={94}
                          paddingAngle={2}
                        >
                          {costStructure.map((item) => (
                            <Cell key={item.name} fill={item.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={CHART_TOOLTIP_STYLE}
                          formatter={(value) => formatCurrency(Number(value), true)}
                        />
                        <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
                <Card>
                  <CardHeader title="CA selon les couverts" subtitle="Couverts / jour et CA annuel HT" />
                  <div className="h-[230px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={coversCurve}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="covers" tick={{ fontSize: 11 }} />
                        <YAxis
                          tickFormatter={(value) => `${Math.round(value / 1000)}k€`}
                          width={48}
                          tick={{ fontSize: 11 }}
                        />
                        <Tooltip
                          contentStyle={CHART_TOOLTIP_STYLE}
                          formatter={(value) => formatCurrency(Number(value), true)}
                        />
                        <Line
                          dataKey="revenue"
                          name="CA annuel"
                          stroke="#2563eb"
                          strokeWidth={3}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </div>
            </div>

            <Card>
              <CardHeader title="Waterfall P&L" subtitle="Contribution des principaux postes au résultat" />
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={waterfall}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} />
                    <YAxis
                      tickFormatter={(value) => `${Math.round(value / 1000)}k€`}
                      tick={{ fontSize: 11 }}
                      width={48}
                    />
                    <Tooltip
                      contentStyle={CHART_TOOLTIP_STYLE}
                      formatter={(value) => formatCurrency(Number(value), true)}
                    />
                    <ReferenceLine y={0} stroke="#94a3b8" />
                    <Bar dataKey="value" radius={[5, 5, 0, 0]}>
                      {waterfall.map((item) => (
                        <Cell key={item.name} fill={item.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card>
              <CardHeader
                title="Scénarios"
                subtitle="Comparez rapidement un cas prudent, central et favorable."
                action={<BarChart3 className="text-indigo-600" size={20} />}
              />
              <div className="mb-5 grid grid-cols-3 gap-2">
                {result.scenarios.map((scenario) => (
                  <button
                    key={scenario.id}
                    onClick={() => setActiveScenario(scenario.id)}
                    className={`rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                      activeScenario === scenario.id
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {scenario.label}
                  </button>
                ))}
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                {[
                  ['CA', selectedScenario.pnl.revenue.totalRevenue, 'currency'],
                  ['EBITDA', selectedScenario.pnl.ebitda, 'currency'],
                  ['Résultat net', selectedScenario.pnl.netIncome, 'currency'],
                  ['Marge nette', selectedScenario.pnl.netMargin, 'percent'],
                  ['Point mort', selectedScenario.breakEven.breakEvenOccupancy, 'percent'],
                ].map(([label, value, type]) => (
                  <div key={String(label)} className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs font-medium text-slate-500">{label}</p>
                    <p className="mt-1 text-lg font-bold">
                      {type === 'percent'
                        ? formatPercent(Number(value))
                        : formatCurrency(Number(value), true)}
                    </p>
                  </div>
                ))}
              </div>
            </Card>

            <div className="grid gap-6 lg:grid-cols-[.8fr_1.2fr]">
              <Card>
                <CardHeader
                  title="Drivers de rentabilité"
                  subtitle="Impact annuel sur le résultat net, toutes choses égales par ailleurs."
                />
                <div className="space-y-3">
                  {result.drivers.map((driver, index) => (
                    <div key={driver.id} className="rounded-xl border border-slate-100 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-medium text-slate-700">
                          <span className="mr-2 text-slate-400">{index + 1}.</span>
                          {driver.label}
                        </p>
                        <p
                          className={`shrink-0 font-bold ${
                            driver.impact >= 0 ? 'text-emerald-700' : 'text-rose-700'
                          }`}
                        >
                          {driver.impact >= 0 ? '+' : ''}
                          {formatCurrency(driver.impact, true)}
                        </p>
                      </div>
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={driver.impact >= 0 ? 'h-full bg-emerald-500' : 'h-full bg-rose-500'}
                          style={{
                            width: `${Math.max(
                              8,
                              (Math.abs(driver.impact) /
                                Math.max(...result.drivers.map((item) => Math.abs(item.impact)))) *
                                100,
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card>
                <CardHeader
                  title="Matrice de sensibilité"
                  subtitle="Résultat net selon le ticket TTC et le remplissage."
                />
                <div className="overflow-x-auto">
                  <div className="min-w-[520px]">
                    <div
                      className="grid gap-1"
                      style={{ gridTemplateColumns: `88px repeat(${sensitivityTickets.length}, 1fr)` }}
                    >
                      <div className="p-2 text-xs font-semibold text-slate-400">Occupation</div>
                      {sensitivityTickets.map((ticket) => (
                        <div key={ticket} className="p-2 text-center text-xs font-semibold text-slate-600">
                          {formatCurrency(ticket)}
                        </div>
                      ))}
                      {sensitivityOccupancies.flatMap((occupancy) => [
                        <div
                          key={`label-${occupancy}`}
                          className="flex items-center p-2 text-xs font-semibold text-slate-600"
                        >
                          {formatPercent(occupancy, 0)}
                        </div>,
                        ...sensitivityTickets.map((ticket) => {
                          const cell = result.sensitivity.find(
                            (item) => item.occupancy === occupancy && item.ticket === ticket,
                          );
                          const value = cell?.netIncome ?? 0;
                          const tone =
                            value < 0
                              ? 'bg-rose-100 text-rose-800'
                              : value < 30000
                                ? 'bg-amber-100 text-amber-800'
                                : value < 100000
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-emerald-600 text-white';
                          return (
                            <div
                              key={`${occupancy}-${ticket}`}
                              className={`rounded-lg p-2.5 text-center text-xs font-bold ${tone}`}
                            >
                              {formatCurrency(value, true)}
                            </div>
                          );
                        }),
                      ])}
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            <Card className="bg-blue-50/60">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <p className="font-semibold text-slate-900">Transparence du modèle</p>
                  <p className="mt-1 text-sm text-slate-500">
                    Consultez les valeurs, fourchettes, années et sources utilisées.
                  </p>
                </div>
                <button
                  onClick={() => setShowSources(true)}
                  className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white"
                >
                  Voir les hypothèses
                </button>
              </div>
            </Card>
          </section>
        </div>
      </div>

      {showSources ? (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/45 backdrop-blur-sm">
          <button
            aria-label="Fermer"
            className="absolute inset-0"
            onClick={() => setShowSources(false)}
          />
          <aside className="relative h-full w-full max-w-2xl overflow-y-auto bg-white p-5 shadow-2xl sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-blue-600">TRANSPARENCE</p>
                <h2 className="mt-1 text-2xl font-bold">Sources & méthodologie</h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Un benchmark externe est documenté. Une hypothèse est une estimation indicative
                  modifiable, jamais présentée comme une donnée officielle.
                </p>
              </div>
              <button
                onClick={() => setShowSources(false)}
                className="rounded-xl bg-slate-100 p-2 text-slate-500"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-8 space-y-3">
              {Object.values(BENCHMARKS).map((benchmark) => (
                <div key={benchmark.label} className="rounded-xl border border-slate-200 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-800">{benchmark.label}</p>
                      <p className="mt-1 text-sm text-slate-500">{benchmark.source}</p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-bold uppercase ${
                        benchmark.type === 'benchmark'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {benchmark.type === 'benchmark' ? 'Benchmark' : 'Hypothèse'}
                    </span>
                  </div>
                  <div className="mt-3 flex gap-5 text-xs text-slate-500">
                    <span>
                      Valeur <strong className="text-slate-800">{benchmark.value} {benchmark.unit}</strong>
                    </span>
                    <span>Plage {benchmark.low}–{benchmark.high}</span>
                    <span>{benchmark.year}</span>
                  </div>
                </div>
              ))}
            </div>

            <h3 className="mt-8 text-lg font-bold">Références</h3>
            <div className="mt-3 space-y-3">
              {METHODOLOGY_SOURCES.map((source) => (
                <a
                  key={source.title}
                  href={source.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block rounded-xl border border-slate-200 p-4 transition hover:border-blue-300 hover:bg-blue-50"
                >
                  <p className="font-semibold text-slate-800">{source.title}</p>
                  <p className="mt-1 text-sm leading-5 text-slate-500">{source.description}</p>
                </a>
              ))}
            </div>
            <p className="mt-8 rounded-xl bg-slate-100 p-4 text-xs leading-5 text-slate-500">
              Outil d’aide à la décision, non conseil comptable, fiscal ou juridique. Faites valider
              le prévisionnel par un expert-comptable et le coût de paie par le simulateur URSSAF.
            </p>
          </aside>
        </div>
      ) : null}
    </main>
  );
}
