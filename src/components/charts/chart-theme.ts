import { formatCurrency } from '@/lib/utils/format';

export const CHART_TOOLTIP_STYLE = {
  borderRadius: 12,
  border: '1px solid #e2e8f0',
  boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)',
  fontSize: 12,
} as const;

export const CHART_COLORS = {
  revenue: '#2563eb',
  cost: '#f97316',
  netIncome: '#059669',
  ebitda: '#6366f1',
  reference: '#0f172a',
  negative: '#e11d48',
  grid: '#e2e8f0',
} as const;

export const COST_STRUCTURE_COLORS = {
  materials: '#f59e0b',
  labor: '#6366f1',
  rent: '#ec4899',
  energy: '#06b6d4',
  other: '#94a3b8',
  ebitda: '#10b981',
} as const;

/** Axe en milliers d'euros : garde les graphiques lisibles. */
export const formatAxisEuro = (value: number) => `${Math.round(value / 1000)} k€`;

/*
 * Recharts type les valeurs de tooltip de façon très permissive : ces
 * adaptateurs acceptent `unknown` pour rester compatibles avec ses signatures.
 */

export const tooltipEuro = (value: unknown) => formatCurrency(Number(value), true);

export const tooltipOccupancyLabel = (value: unknown) =>
  `${Math.round(Number(value) * 100)} % de remplissage`;

export const tooltipCoversLabel = (value: unknown) => `${Number(value)} couverts / jour`;
