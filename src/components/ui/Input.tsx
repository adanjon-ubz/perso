import { cn } from '@/lib/utils/cn';

const CONTROL_CLASS =
  'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30';

export function Label({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <div className="mb-1.5">
      <label className="text-sm font-medium text-slate-700">{children}</label>
      {hint ? <p className="text-xs text-slate-400">{hint}</p> : null}
    </div>
  );
}

export function NumberInput({
  value,
  onChange,
  suffix,
  min,
  max,
  step = 1,
  ariaLabel,
  className,
}: {
  value: number;
  onChange: (value: number) => void;
  suffix?: string;
  min?: number;
  max?: number;
  step?: number;
  ariaLabel?: string;
  className?: string;
}) {
  return (
    <div className={cn('relative', className)}>
      <input
        type="number"
        aria-label={ariaLabel}
        value={Number.isFinite(value) ? Math.round(value * 100) / 100 : 0}
        min={min}
        max={max}
        step={step}
        onChange={(event) => {
          const next = Number(event.target.value);
          onChange(Number.isFinite(next) ? next : 0);
        }}
        className={cn(CONTROL_CLASS, suffix && 'pr-14')}
      />
      {suffix ? (
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
          {suffix}
        </span>
      ) : null}
    </div>
  );
}

export function SelectInput<T extends string>({
  value,
  onChange,
  options,
  ariaLabel,
}: {
  value: T;
  onChange: (value: T) => void;
  options: Array<{ id: T; label: string }>;
  ariaLabel?: string;
}) {
  return (
    <select
      aria-label={ariaLabel}
      value={value}
      onChange={(event) => onChange(event.target.value as T)}
      className={CONTROL_CLASS}
    >
      {options.map((option) => (
        <option key={option.id} value={option.id}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

export function SliderInput({
  value,
  onChange,
  min,
  max,
  step,
  formatValue,
  ariaLabel,
}: {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  formatValue?: (value: number) => string;
  ariaLabel?: string;
}) {
  const display = formatValue ?? ((input: number) => String(input));

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-xl font-bold tabular-nums text-slate-900">{display(value)}</span>
        <span className="text-[11px] text-slate-400">
          {display(min)} – {display(max)}
        </span>
      </div>
      <input
        type="range"
        aria-label={ariaLabel}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-emerald-600"
      />
    </div>
  );
}
