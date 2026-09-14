'use client';

import { useMemo, useState } from 'react';
import {
  createDefaultSimulation,
  createStaffForType,
  createTicketBreakdown,
  estimateMonthlyRent,
} from '@/data/presets';
import { FOOD_COST_BY_TYPE, OCCUPANCY_BY_TYPE } from '@/data/france-benchmarks';
import { runSimulation } from '@/lib/engine';
import type { SimulationInput } from '@/types/models';

export function useSimulation(initial?: SimulationInput) {
  const [input, setInput] = useState<SimulationInput>(initial ?? createDefaultSimulation());

  const result = useMemo(() => runSimulation(input), [input]);

  const updateProfile = (patch: Partial<SimulationInput['profile']>) => {
    setInput((current) => ({
      ...current,
      profile: { ...current.profile, ...patch },
    }));
  };

  const applyRestaurantType = (restaurantType: SimulationInput['profile']['restaurantType']) => {
    setInput((current) => {
      const profile = {
        ...current.profile,
        restaurantType,
        occupancyRate: OCCUPANCY_BY_TYPE[restaurantType].value,
        ticketBreakdown: createTicketBreakdown(restaurantType),
        takeawayShare: restaurantType === 'dark_kitchen' ? 0 : current.profile.takeawayShare,
        deliveryShare: restaurantType === 'dark_kitchen' ? 0.7 : current.profile.deliveryShare,
      };

      return {
        ...current,
        profile,
        staff: createStaffForType(restaurantType),
        operating: {
          ...current.operating,
          foodCostRate: FOOD_COST_BY_TYPE[restaurantType].value,
        },
      };
    });
  };

  const applyLocation = (
    city: SimulationInput['profile']['city'],
    locationType: SimulationInput['profile']['locationType'],
    surfaceSqm = input.profile.surfaceSqm,
  ) => {
    setInput((current) => ({
      ...current,
      profile: {
        ...current.profile,
        city,
        locationType,
        surfaceSqm,
      },
      operating: {
        ...current.operating,
        rentMonthly: estimateMonthlyRent(city, locationType, surfaceSqm),
      },
    }));
  };

  const reset = () => setInput(createDefaultSimulation());

  return {
    input,
    result,
    setInput,
    updateProfile,
    applyRestaurantType,
    applyLocation,
    reset,
  };
}
