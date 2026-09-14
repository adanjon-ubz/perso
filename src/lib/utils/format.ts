export function formatCurrency(value: number, compact = false): string {
  if (!Number.isFinite(value)) return '—';

  if (compact) {
    const abs = Math.abs(value);
    if (abs >= 1_000_000) {
      return `${(value / 1_000_000).toFixed(2)} M€`;
    }
    if (abs >= 1_000) {
      return `${(value / 1_000).toFixed(0)} k€`;
    }
  }

  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPercent(value: number, digits = 1): string {
  if (!Number.isFinite(value)) return '—';
  return `${(value * 100).toFixed(digits)} %`;
}

export function formatNumber(value: number, digits = 0): string {
  if (!Number.isFinite(value)) return '—';
  return new Intl.NumberFormat('fr-FR', {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(value);
}

/** Nombre d'années, borné pour rester lisible quand le retour est très long. */
export function formatYears(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return 'jamais';
  if (value > 25) return '> 25 ans';
  return `${value.toFixed(1)} ans`;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
