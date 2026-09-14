import { Store } from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Field } from '@/components/ui/Field';
import { SelectInput } from '@/components/ui/Input';
import { CITY_OPTIONS, LOCATION_OPTIONS, RESTAURANT_TYPE_OPTIONS } from '@/data/presets';
import type { SimulationController } from '@/hooks/useSimulation';
import type { CuisineTypeId } from '@/types/models';

const CUISINE_OPTIONS: Array<{ id: CuisineTypeId; label: string }> = [
  { id: 'french', label: 'Française' },
  { id: 'italian', label: 'Italienne' },
  { id: 'asian', label: 'Asiatique' },
  { id: 'american', label: 'Américaine' },
  { id: 'mediterranean', label: 'Méditerranéenne' },
  { id: 'vegetarian', label: 'Végétarienne' },
  { id: 'mixed', label: 'Mixte' },
  { id: 'other', label: 'Autre' },
];

export function ProfileSection({ sim }: { sim: SimulationController }) {
  const { profile } = sim.input;

  return (
    <Card>
      <CardHeader
        title="1. Votre restaurant"
        subtitle="Le concept et l'emplacement préchargent des valeurs de référence. Tout reste modifiable."
        action={<Store className="text-slate-300" size={19} />}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Ville"
          hint="Recharge le loyer indicatif au m² et ajuste le ticket moyen aux prix pratiqués localement."
        >
          <SelectInput
            ariaLabel="Ville"
            value={profile.city}
            options={CITY_OPTIONS}
            onChange={(city) => sim.applyLocation(city, profile.locationType, profile.surfaceSqm)}
          />
        </Field>
        <Field
          label="Emplacement"
          hint="Positionne le loyer, le ticket et le flux potentiel par rapport à la moyenne de la ville."
        >
          <SelectInput
            ariaLabel="Type d'emplacement"
            value={profile.locationType}
            options={LOCATION_OPTIONS}
            onChange={(locationType) =>
              sim.applyLocation(profile.city, locationType, profile.surfaceSqm)
            }
          />
        </Field>
        <Field
          label="Type de restaurant"
          hint="Recharge le ticket moyen, le coût matière, le remplissage et l'équipe type."
        >
          <SelectInput
            ariaLabel="Type de restaurant"
            value={profile.restaurantType}
            options={RESTAURANT_TYPE_OPTIONS}
            onChange={sim.applyRestaurantType}
          />
        </Field>
        <Field label="Type de cuisine">
          <SelectInput
            ariaLabel="Type de cuisine"
            value={profile.cuisineType}
            options={CUISINE_OPTIONS}
            onChange={(cuisineType) => sim.updateProfile({ cuisineType })}
          />
        </Field>
      </div>
    </Card>
  );
}
