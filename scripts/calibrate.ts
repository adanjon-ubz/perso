/**
 * Contrôle de cohérence économique des scénarios par défaut.
 * Compare les scénarios de démonstration aux fourchettes de l'Observatoire
 * FIDUCIAL. Usage : npm run calibrate
 */
import { DEMO_SCENARIOS } from '@/data/presets';
import { runSimulation } from '@/lib/engine';

const euro = (value: number) =>
  `${Math.round(value / 1000).toLocaleString('fr-FR')} k€`.padStart(10);
const pct = (value: number) => `${(value * 100).toFixed(1)} %`.padStart(8);

for (const [key, input] of Object.entries(DEMO_SCENARIOS)) {
  const { pnl, breakEven, cashFlow } = runSimulation(input);
  const revenue = pnl.revenue.totalRevenue;

  console.log(`\n=== ${key} — ${input.profile.name} ===`);
  console.log(
    `  ${input.profile.seatingCapacity} places · ${input.profile.servicesPerDay} services · ` +
      `${input.profile.openingDaysPerWeek} j/sem · ${Math.round(input.profile.occupancyRate * 100)} % remplissage`,
  );
  console.log(`  couverts/jour   ${pnl.revenue.coversPerDay.toFixed(0).padStart(10)}`);
  console.log(`  ticket TTC/HT   ${pnl.revenue.averageTicketTTC.toFixed(2)} / ${pnl.revenue.averageTicketHT.toFixed(2)} €`);
  console.log(`  CA HT           ${euro(revenue)}`);
  console.log(`  matières        ${euro(pnl.variableCosts.total)}  ${pct(pnl.variableCosts.total / revenue)}   [cible 26-36 %]`);
  console.log(`  personnel       ${euro(pnl.laborCosts.totalEmployerCost)}  ${pct(pnl.laborCosts.totalEmployerCost / revenue)}   [cible 24-38 %]`);
  console.log(`  loyer           ${euro(pnl.fixedCosts.rent)}  ${pct(pnl.fixedCosts.rent / revenue)}   [cible 0-6 %]`);
  console.log(`  autres fixes    ${euro(pnl.fixedCosts.total - pnl.fixedCosts.rent)}  ${pct((pnl.fixedCosts.total - pnl.fixedCosts.rent) / revenue)}   [cible 12-16 %]`);
  console.log(`  EBITDA          ${euro(pnl.ebitda)}  ${pct(pnl.ebitdaMargin)}   [cible 13-18 %]`);
  console.log(`  amortissements  ${euro(pnl.depreciation.total)}  ${pct(pnl.depreciation.total / revenue)}   [cible 2-4 %]`);
  console.log(`  résultat net    ${euro(pnl.netIncome)}  ${pct(pnl.netMargin)}`);
  console.log(`  free cash-flow  ${euro(cashFlow.freeCashFlow)}`);
  console.log(
    `  point mort      ${pct(breakEven.breakEvenOccupancy)} de remplissage · ` +
      `${breakEven.breakEvenCoversPerDay.toFixed(0)} couverts/jour · atteignable : ${breakEven.isAchievable}`,
  );
  console.log(`  effectif        ${pnl.laborCosts.totalFte.toFixed(1)} ETP`);
}
