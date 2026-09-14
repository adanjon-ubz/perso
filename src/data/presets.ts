import {
  BENCHMARKS,
  DEFAULT_SALARIES,
  FOOD_COST_BY_TYPE,
  OCCUPANCY_BY_TYPE,
  RENT_PER_SQM,
  TICKET_BY_TYPE,
} from '@/data/france-benchmarks';
import type {
  CapexItem,
  CapexUsefulLife,
  CityId,
  Financing,
  LocationTypeId,
  OperatingAssumptions,
  RestaurantProfile,
  RestaurantTypeId,
  SimulationInput,
  StaffMember,
  TaxSettings,
} from '@/types/models';

export const CITY_OPTIONS: Array<{ id: CityId; label: string }> = [
  { id: 'paris', label: 'Paris' },
  { id: 'lyon', label: 'Lyon' },
  { id: 'marseille', label: 'Marseille' },
  { id: 'bordeaux', label: 'Bordeaux' },
  { id: 'lille', label: 'Lille' },
  { id: 'toulouse', label: 'Toulouse' },
  { id: 'nantes', label: 'Nantes' },
  { id: 'nice', label: 'Nice' },
  { id: 'strasbourg', label: 'Strasbourg' },
  { id: 'montpellier', label: 'Montpellier' },
  { id: 'rennes', label: 'Rennes' },
  { id: 'medium_city', label: 'Ville moyenne' },
  { id: 'other', label: 'Autre' },
];

export const LOCATION_OPTIONS: Array<{ id: LocationTypeId; label: string }> = [
  { id: 'premium_center', label: 'Centre-ville premium' },
  { id: 'city_center', label: 'Centre-ville' },
  { id: 'residential', label: 'Quartier résidentiel' },
  { id: 'commercial_zone', label: 'Zone commerciale' },
  { id: 'periphery', label: 'Périphérie' },
];

export const RESTAURANT_TYPE_OPTIONS: Array<{ id: RestaurantTypeId; label: string }> = [
  { id: 'fast_food', label: 'Fast food' },
  { id: 'burger', label: 'Burger' },
  { id: 'pizza', label: 'Pizza' },
  { id: 'traditional', label: 'Restaurant traditionnel' },
  { id: 'brasserie', label: 'Brasserie' },
  { id: 'cafe_brunch', label: 'Café / brunch' },
  { id: 'asian', label: 'Asiatique' },
  { id: 'premium', label: 'Premium / gastronomique' },
  { id: 'dark_kitchen', label: 'Dark kitchen' },
  { id: 'other', label: 'Autre' },
];

const DEFAULT_STAFF_BY_TYPE: Record<RestaurantTypeId, StaffRolePreset[]> = {
  fast_food: [
    { role: 'manager', count: 1 },
    { role: 'cook', count: 2 },
    { role: 'cashier', count: 2 },
    { role: 'polyvalent', count: 2 },
  ],
  burger: [
    { role: 'manager', count: 1 },
    { role: 'cook', count: 2 },
    { role: 'cashier', count: 1 },
    { role: 'waiter', count: 2 },
  ],
  pizza: [
    { role: 'manager', count: 1 },
    { role: 'cook', count: 2 },
    { role: 'cashier', count: 1 },
    { role: 'delivery', count: 1 },
  ],
  traditional: [
    { role: 'manager', count: 1 },
    { role: 'head_chef', count: 1 },
    { role: 'cook', count: 2 },
    { role: 'commis', count: 1 },
    { role: 'waiter', count: 3 },
    { role: 'dishwasher', count: 1 },
  ],
  brasserie: [
    { role: 'manager', count: 1 },
    { role: 'head_chef', count: 1 },
    { role: 'cook', count: 2 },
    { role: 'waiter', count: 4 },
    { role: 'bartender', count: 1 },
  ],
  cafe_brunch: [
    { role: 'manager', count: 1 },
    { role: 'cook', count: 1 },
    { role: 'barista', count: 2 },
    { role: 'waiter', count: 2 },
  ],
  asian: [
    { role: 'manager', count: 1 },
    { role: 'head_chef', count: 1 },
    { role: 'cook', count: 2 },
    { role: 'waiter', count: 2 },
  ],
  premium: [
    { role: 'manager', count: 1 },
    { role: 'head_chef', count: 1 },
    { role: 'sous_chef', count: 1 },
    { role: 'chef_de_partie', count: 2 },
    { role: 'commis', count: 2 },
    { role: 'room_manager', count: 1 },
    { role: 'waiter', count: 4 },
    { role: 'bartender', count: 1 },
  ],
  dark_kitchen: [
    { role: 'manager', count: 1 },
    { role: 'cook', count: 3 },
    { role: 'delivery', count: 2 },
  ],
  other: [
    { role: 'manager', count: 1 },
    { role: 'head_chef', count: 1 },
    { role: 'cook', count: 2 },
    { role: 'waiter', count: 2 },
  ],
};

interface StaffRolePreset {
  role: StaffMember['role'];
  count: number;
}

let staffCounter = 0;

export function createStaffMember(role: StaffMember['role'], count = 1): StaffMember {
  staffCounter += 1;
  return {
    id: `staff-${staffCounter}`,
    role,
    count,
    grossMonthlySalary: DEFAULT_SALARIES[role].value,
    employmentType: 'full_time',
    weeklyHours: 35,
    mealsPerDay: 1,
  };
}

export function createStaffForType(type: RestaurantTypeId): StaffMember[] {
  return DEFAULT_STAFF_BY_TYPE[type].map((item) => createStaffMember(item.role, item.count));
}

export function estimateMonthlyRent(
  city: CityId,
  locationType: LocationTypeId,
  surfaceSqm: number,
): number {
  const benchmark = RENT_PER_SQM[city][locationType];
  return Math.round((benchmark.value * surfaceSqm) / 12);
}

export function createTicketBreakdown(type: RestaurantTypeId) {
  const ticket = TICKET_BY_TYPE[type].value;
  if (type === 'fast_food' || type === 'burger' || type === 'pizza' || type === 'dark_kitchen') {
    return {
      food: ticket * 0.75,
      beverages: ticket * 0.2,
      alcohol: 0,
      dessert: ticket * 0.05,
      other: 0,
    };
  }

  if (type === 'premium') {
    return {
      food: ticket * 0.62,
      beverages: ticket * 0.12,
      alcohol: ticket * 0.18,
      dessert: ticket * 0.06,
      other: ticket * 0.02,
    };
  }

  return {
    food: ticket * 0.68,
    beverages: ticket * 0.14,
    alcohol: ticket * 0.1,
    dessert: ticket * 0.06,
    other: ticket * 0.02,
  };
}

export function createDefaultCapex(type: RestaurantTypeId, surfaceSqm: number): CapexItem {
  const base = surfaceSqm * 1200;
  const multipliers: Record<RestaurantTypeId, number> = {
    fast_food: 0.9,
    burger: 0.95,
    pizza: 0.85,
    traditional: 1.1,
    brasserie: 1.05,
    cafe_brunch: 0.8,
    asian: 1,
    premium: 1.6,
    dark_kitchen: 0.7,
    other: 1,
  };

  const total = base * multipliers[type];
  return {
    kitchenEquipment: total * 0.35,
    furniture: total * 0.2,
    fitout: total * 0.25,
    pos: total * 0.05,
    signage: total * 0.05,
    otherEquipment: total * 0.1,
  };
}

export const DEFAULT_USEFUL_LIFE: CapexUsefulLife = {
  kitchenEquipment: 7,
  furniture: 10,
  fitout: 10,
  pos: 5,
  signage: 10,
  otherEquipment: 5,
};

export const DEFAULT_TAX: TaxSettings = {
  vatFood: BENCHMARKS.vatFood.value,
  vatBeverage: BENCHMARKS.vatFood.value,
  vatAlcohol: BENCHMARKS.vatAlcohol.value,
  corporateTaxRate: BENCHMARKS.corporateTaxStandard.value,
  reducedCorporateTaxRate: BENCHMARKS.corporateTaxReduced.value,
  reducedCorporateTaxThreshold: 42500,
};

export function createDefaultOperating(
  type: RestaurantTypeId,
  city: CityId,
  locationType: LocationTypeId,
  surfaceSqm: number,
): OperatingAssumptions {
  const rentMonthly = estimateMonthlyRent(city, locationType, surfaceSqm);
  const foodCost = FOOD_COST_BY_TYPE[type].value;

  return {
    foodCostRate: foodCost,
    beverageCostRate: foodCost * 0.75,
    packagingCostRate: BENCHMARKS.packagingCost.value,
    platformCommissionRate: BENCHMARKS.platformCommission.value,
    paymentFeeRate: BENCHMARKS.paymentFees.value,
    rentMonthly,
    rentChargesMonthly: rentMonthly * 0.12,
    utilitiesMonthly: surfaceSqm * 4.5,
    insuranceMonthly: 250,
    accountingMonthly: 350,
    softwareMonthly: 180,
    telecomMonthly: 90,
    cleaningMonthly: 450,
    maintenanceMonthly: 300,
    marketingMonthly: 600,
    bankingMonthly: 80,
    miscellaneousMonthly: 200,
  };
}

export function createDefaultProfile(
  overrides: Partial<RestaurantProfile> = {},
): RestaurantProfile {
  const restaurantType = overrides.restaurantType ?? 'traditional';
  const city = overrides.city ?? 'lyon';
  const locationType = overrides.locationType ?? 'city_center';
  const surfaceSqm = overrides.surfaceSqm ?? 120;
  const ticket = createTicketBreakdown(restaurantType);

  return {
    name: overrides.name ?? 'Mon restaurant',
    city,
    locationType,
    restaurantType,
    cuisineType: overrides.cuisineType ?? 'french',
    seatingCapacity: overrides.seatingCapacity ?? 50,
    openingDaysPerWeek: overrides.openingDaysPerWeek ?? BENCHMARKS.openingDaysPerWeek.value,
    servicesPerDay: overrides.servicesPerDay ?? 2,
    openingWeeksPerYear: overrides.openingWeeksPerYear ?? 52,
    occupancyRate: overrides.occupancyRate ?? OCCUPANCY_BY_TYPE[restaurantType].value,
    surfaceSqm,
    takeawayShare: overrides.takeawayShare ?? (restaurantType === 'dark_kitchen' ? 0 : 0.08),
    deliveryShare: overrides.deliveryShare ?? (restaurantType === 'dark_kitchen' ? 0.7 : 0.05),
    ticketBreakdown: overrides.ticketBreakdown ?? ticket,
    servicePattern: overrides.servicePattern ?? {
      lunchOccupancy: 0.7,
      dinnerOccupancy: 0.85,
      weekendOccupancy: 0.9,
      lunchShare: 0.4,
      dinnerShare: 0.6,
      weekendShare: 0.35,
    },
  };
}

export function createDefaultFinancing(capex: CapexItem): Financing {
  const total =
    capex.kitchenEquipment +
    capex.furniture +
    capex.fitout +
    capex.pos +
    capex.signage +
    capex.otherEquipment;

  const equity = total * 0.35;
  const debt = total - equity;

  return {
    equity,
    debt,
    interestRate: 0.045,
    loanDurationYears: 7,
  };
}

export function createDefaultSimulation(
  overrides: Partial<RestaurantProfile> = {},
): SimulationInput {
  const profile = createDefaultProfile(overrides);
  const capex = createDefaultCapex(profile.restaurantType, profile.surfaceSqm);

  return {
    profile,
    operating: createDefaultOperating(
      profile.restaurantType,
      profile.city,
      profile.locationType,
      profile.surfaceSqm,
    ),
    staff: createStaffForType(profile.restaurantType),
    capex,
    usefulLife: DEFAULT_USEFUL_LIFE,
    financing: createDefaultFinancing(capex),
    tax: DEFAULT_TAX,
  };
}

export const DEMO_SCENARIOS = {
  parisTraditional: createDefaultSimulation({
    name: 'Bistrot parisien',
    city: 'paris',
    locationType: 'city_center',
    restaurantType: 'traditional',
    seatingCapacity: 45,
    surfaceSqm: 95,
    occupancyRate: 0.62,
  }),
  lyonTraditional: createDefaultSimulation({
    name: 'Restaurant traditionnel Lyon',
    city: 'lyon',
    locationType: 'city_center',
    restaurantType: 'traditional',
    seatingCapacity: 50,
    surfaceSqm: 120,
    occupancyRate: 0.65,
  }),
  mediumCityFastFood: createDefaultSimulation({
    name: 'Fast food ville moyenne',
    city: 'medium_city',
    locationType: 'commercial_zone',
    restaurantType: 'fast_food',
    seatingCapacity: 35,
    surfaceSqm: 80,
    occupancyRate: 0.8,
    servicesPerDay: 1,
  }),
};
