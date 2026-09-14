import { AlertTriangle, CirclePlus, Trash2, Wand2 } from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/Card';
import { NumberInput, SelectInput } from '@/components/ui/Input';
import { DEFAULT_SALARIES, STAFF_ROLE_LABELS } from '@/data/france-benchmarks';
import type { SimulationController } from '@/hooks/useSimulation';
import { formatCurrency, formatNumber, formatPercent } from '@/lib/utils/format';
import type { StaffRoleId } from '@/types/models';

const STAFF_OPTIONS = (Object.keys(STAFF_ROLE_LABELS) as StaffRoleId[]).map((id) => ({
  id,
  label: STAFF_ROLE_LABELS[id],
}));

const MANAGEMENT_ROLES: StaffRoleId[] = ['manager', 'admin'];

export function TeamSection({ sim }: { sim: SimulationController }) {
  const { staff } = sim.input;
  const { laborCosts } = sim.result.pnl;
  const { laborShare } = sim.result.ratios;
  const hasManager = staff.some((member) => MANAGEMENT_ROLES.includes(member.role));

  return (
    <Card>
      <CardHeader
        title="4. Votre équipe"
        subtitle={`${formatCurrency(laborCosts.totalEmployerCost, true)} / an · ${formatPercent(
          laborShare,
        )} du CA · ${formatNumber(laborCosts.totalFte, 1)} ETP`}
        action={
          <button
            type="button"
            onClick={sim.resizeStaff}
            title="Reconstruire l'équipe type pour le volume de couverts actuel"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
          >
            <Wand2 size={14} /> Redimensionner
          </button>
        }
      />

      <div className="space-y-3">
        {staff.map((member) => {
          const line = laborCosts.lines.find((item) => item.role === member.role);
          const benchmark = DEFAULT_SALARIES[member.role];

          return (
            <div
              key={member.id}
              className="rounded-xl border border-slate-200 p-3 transition hover:border-slate-300"
            >
              <div className="flex items-center gap-2">
                <SelectInput
                  ariaLabel="Poste"
                  value={member.role}
                  options={STAFF_OPTIONS}
                  onChange={(role) =>
                    sim.updateStaff(member.id, {
                      role,
                      grossMonthlySalary: DEFAULT_SALARIES[role].value,
                    })
                  }
                />
                <button
                  type="button"
                  aria-label={`Supprimer ${STAFF_ROLE_LABELS[member.role]}`}
                  onClick={() => sim.removeStaff(member.id)}
                  className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                >
                  <Trash2 size={17} />
                </button>
              </div>

              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                <NumberInput
                  ariaLabel="Effectif"
                  value={member.count}
                  min={0}
                  suffix="pers."
                  onChange={(count) => sim.updateStaff(member.id, { count })}
                />
                <NumberInput
                  ariaLabel="Salaire brut mensuel"
                  value={member.grossMonthlySalary}
                  min={0}
                  step={50}
                  suffix="€ brut"
                  onChange={(grossMonthlySalary) =>
                    sim.updateStaff(member.id, { grossMonthlySalary })
                  }
                />
                <NumberInput
                  ariaLabel="Heures par semaine"
                  value={Math.round(member.weeklyHours)}
                  min={1}
                  max={48}
                  suffix="h/sem"
                  onChange={(weeklyHours) =>
                    sim.updateStaff(member.id, {
                      weeklyHours,
                      employmentType: weeklyHours >= 35 ? 'full_time' : 'part_time',
                    })
                  }
                />
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
                <span>
                  Coût employeur{' '}
                  <strong className="text-slate-700">
                    {formatCurrency(line?.annualEmployerCost ?? 0, true)} / an
                  </strong>
                </span>
                <span>charges {formatPercent(line?.employerCostRate ?? 0, 1)}</span>
                <span className="text-slate-400">
                  minimum conventionnel {formatCurrency(benchmark.low)}
                </span>
              </div>

              {line?.belowConventionalMinimum ? (
                <p className="mt-2 flex items-center gap-1.5 rounded-lg bg-rose-50 px-2 py-1.5 text-[11px] font-medium text-rose-700">
                  <AlertTriangle size={13} />
                  Sous le minimum applicable ({formatCurrency(line.conventionalMinimum)} brut/mois).
                </p>
              ) : null}
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => sim.addStaff()}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-emerald-300 bg-emerald-50 py-2.5 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
      >
        <CirclePlus size={17} /> Ajouter un employé
      </button>

      {!hasManager ? (
        <p className="mt-3 rounded-xl bg-amber-50 p-3 text-[11px] leading-5 text-amber-800">
          Aucun poste de direction n&apos;est salarié dans cette équipe. Si vous n&apos;exploitez pas
          vous-même le restaurant — ou si vous vous versez un salaire — ajoutez la rémunération du
          dirigeant : sans elle, le résultat net est surestimé.
        </p>
      ) : null}

      <p className="mt-3 text-[11px] leading-5 text-slate-400">
        Les coûts employeur sont des estimations. Le coût réel dépend notamment du contrat, des
        exonérations, de la convention collective et de la situation de l&apos;entreprise. Le calcul
        applique la réduction générale dégressive unique (RGDU) 2026 et valorise l&apos;avantage
        nourriture HCR à un minimum garanti par repas.
      </p>
    </Card>
  );
}
