import { CapacitySection } from '@/components/sections/assumptions/CapacitySection';
import { InvestmentSection } from '@/components/sections/assumptions/InvestmentSection';
import { PremisesSection } from '@/components/sections/assumptions/PremisesSection';
import { ProfileSection } from '@/components/sections/assumptions/ProfileSection';
import { TeamSection } from '@/components/sections/assumptions/TeamSection';
import { TicketSection } from '@/components/sections/assumptions/TicketSection';
import type { SimulationController } from '@/hooks/useSimulation';

/** Section A — toutes les hypothèses saisies par l'utilisateur. */
export function AssumptionsPanel({ sim }: { sim: SimulationController }) {
  return (
    <div className="space-y-4">
      <ProfileSection sim={sim} />
      <CapacitySection sim={sim} />
      <TicketSection sim={sim} />
      <TeamSection sim={sim} />
      <PremisesSection sim={sim} />
      <InvestmentSection sim={sim} />
    </div>
  );
}
