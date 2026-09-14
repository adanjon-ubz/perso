'use client';

import { useCallback, useMemo, useState } from 'react';
import {
  CHANNEL_MIX_BY_TYPE,
  SERVICES_PER_DAY_BY_TYPE,
  createDefaultCapex,
  createDefaultSimulation,
  createStaffForType,
  createStaffMember,
  createTicketBreakdown,
  estimateMonthlyRent,
  getCoversPerDay,
} from '@/data/presets';
import {
  FOOD_COST_BY_TYPE,
  LOCATION_OCCUPANCY_MULTIPLIER,
  getOccupancyBenchmark,
  getTicketBenchmark,
} from '@/data/france-benchmarks';
import { runSimulation } from '@/lib/engine';
import type {
  CityId,
  LocationTypeId,
  RestaurantTypeId,
  SimulationInput,
  StaffMember,
  StaffRoleId,
  TicketBreakdown,
} from '@/types/models';

export type SimulationController = ReturnType<typeof useSimulation>;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const scaleTicket = (ticket: TicketBreakdown, factor: number): TicketBreakdown => ({
  food: ticket.food * factor,
  beverages: ticket.beverages * factor,
  alcohol: ticket.alcohol * factor,
  dessert: ticket.dessert * factor,
  other: ticket.other * factor,
});

export function useSimulation(initial?: SimulationInput) {
  const [input, setInput] = useState<SimulationInput>(initial ?? createDefaultSimulation());

  const result = useMemo(() => runSimulation(input), [input]);

  const updateProfile = useCallback((patch: Partial<SimulationInput['profile']>) => {
    setInput((current) => ({ ...current, profile: { ...current.profile, ...patch } }));
  }, []);

  const updateTicket = useCallback(
    (patch: Partial<SimulationInput['profile']['ticketBreakdown']>) => {
      setInput((current) => ({
        ...current,
        profile: {
          ...current.profile,
          ticketBreakdown: { ...current.profile.ticketBreakdown, ...patch },
        },
      }));
    },
    [],
  );

  const updateOperating = useCallback((patch: Partial<SimulationInput['operating']>) => {
    setInput((current) => ({ ...current, operating: { ...current.operating, ...patch } }));
  }, []);

  const updateCapex = useCallback((patch: Partial<SimulationInput['capex']>) => {
    setInput((current) => ({ ...current, capex: { ...current.capex, ...patch } }));
  }, []);

  const updateUsefulLife = useCallback((patch: Partial<SimulationInput['usefulLife']>) => {
    setInput((current) => ({ ...current, usefulLife: { ...current.usefulLife, ...patch } }));
  }, []);

  const updateFinancing = useCallback((patch: Partial<SimulationInput['financing']>) => {
    setInput((current) => ({ ...current, financing: { ...current.financing, ...patch } }));
  }, []);

  const updateTax = useCallback((patch: Partial<SimulationInput['tax']>) => {
    setInput((current) => ({ ...current, tax: { ...current.tax, ...patch } }));
  }, []);

  const updateStaff = useCallback((id: string, patch: Partial<StaffMember>) => {
    setInput((current) => ({
      ...current,
      staff: current.staff.map((member) =>
        member.id === id ? { ...member, ...patch } : member,
      ),
    }));
  }, []);

  const addStaff = useCallback((role: StaffRoleId = 'polyvalent') => {
    setInput((current) => ({ ...current, staff: [...current.staff, createStaffMember(role)] }));
  }, []);

  const removeStaff = useCallback((id: string) => {
    setInput((current) => ({
      ...current,
      staff: current.staff.filter((member) => member.id !== id),
    }));
  }, []);

  /** Redimensionne l'équipe type sur le volume de couverts courant. */
  const resizeStaff = useCallback(() => {
    setInput((current) => ({
      ...current,
      staff: createStaffForType(current.profile.restaurantType, getCoversPerDay(current.profile)),
    }));
  }, []);

  const applyRestaurantType = useCallback((restaurantType: RestaurantTypeId) => {
    setInput((current) => {
      const profile = {
        ...current.profile,
        restaurantType,
        occupancyRate: getOccupancyBenchmark(restaurantType, current.profile.locationType).value,
        servicesPerDay: SERVICES_PER_DAY_BY_TYPE[restaurantType],
        ticketBreakdown: createTicketBreakdown(
          restaurantType,
          current.profile.city,
          current.profile.locationType,
        ),
        ...CHANNEL_MIX_BY_TYPE[restaurantType],
      };

      return {
        ...current,
        profile,
        staff: createStaffForType(restaurantType, getCoversPerDay(profile)),
        capex: createDefaultCapex(restaurantType, profile.surfaceSqm),
        operating: {
          ...current.operating,
          foodCostRate: FOOD_COST_BY_TYPE[restaurantType].value,
        },
      };
    });
  }, []);

  /**
   * L'adresse déplace le loyer, le ticket acceptable et le flux potentiel. Le
   * ticket est réhaussé proportionnellement pour conserver la ventilation par
   * catégorie que l'utilisateur a pu personnaliser.
   */
  const applyLocation = useCallback(
    (city: CityId, locationType: LocationTypeId, surfaceSqm: number) => {
      setInput((current) => {
        const { profile } = current;
        const previous = getTicketBenchmark(
          profile.restaurantType,
          profile.city,
          profile.locationType,
        ).value;
        const next = getTicketBenchmark(profile.restaurantType, city, locationType).value;
        const ticketScale = previous > 0 ? next / previous : 1;

        const baseOccupancy =
          profile.occupancyRate / LOCATION_OCCUPANCY_MULTIPLIER[profile.locationType];

        return {
          ...current,
          profile: {
            ...profile,
            city,
            locationType,
            surfaceSqm,
            occupancyRate: clamp(
              baseOccupancy * LOCATION_OCCUPANCY_MULTIPLIER[locationType],
              0.05,
              0.98,
            ),
            ticketBreakdown: scaleTicket(profile.ticketBreakdown, ticketScale),
          },
          operating: {
            ...current.operating,
            rentMonthly: estimateMonthlyRent(city, locationType, surfaceSqm),
          },
        };
      });
    },
    [],
  );

  const reset = useCallback(() => setInput(initial ?? createDefaultSimulation()), [initial]);

  return {
    input,
    result,
    setInput,
    updateProfile,
    updateTicket,
    updateOperating,
    updateCapex,
    updateUsefulLife,
    updateFinancing,
    updateTax,
    addStaff,
    updateStaff,
    removeStaff,
    resizeStaff,
    applyRestaurantType,
    applyLocation,
    reset,
  };
}
