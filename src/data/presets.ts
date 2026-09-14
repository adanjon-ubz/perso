import {
  BENCHMARKS,
  CITY_LABELS,
  DEFAULT_SALARIES,
  FOOD_COST_BY_TYPE,
  getOccupancyBenchmark,
  getRentBenchmark,
  getTicketBenchmark,
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
  StaffRoleId,
  TaxSettings,
} from '@/types/models';

export const CITY_OPTIONS: Array<{ id: CityId; label: string }> = (
  Object.keys(CITY_LABELS) as CityId[]
).map((id) => ({ id, label: CITY_LABELS[id] }));

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

/**
 * Productivité de référence : nombre de couverts servis par jour et par ETP,
 * tous postes confondus (cuisine, salle, encadrement).
 *
 * Ces valeurs sont calibrées pour que l'effectif par défaut place la masse
 * salariale dans la fourchette du panel FIDUCIAL (24 % à 38 % du CA) plutôt
 * que sur un effectif fixe indépendant de la taille de l'établissement.
 */
export const COVERS_PER_FTE: Record<RestaurantTypeId, number> = {
  fast_food: 20,
  burger: 18,
  pizza: 18,
  traditional: 11,
  brasserie: 12,
  cafe_brunch: 13,
  asian: 12,
  premium: 6,
  dark_kitchen: 22,
  other: 12,
};

interface TeamTemplate {
  /** Postes présents quel que soit le volume d'activité. */
  fixed: Array<{ role: StaffRoleId; fte: number }>;
  /** Répartition de l'effectif restant. */
  pool: Array<{ role: StaffRoleId; weight: number }>;
}

const TEAM_TEMPLATE: Record<RestaurantTypeId, TeamTemplate> = {
  fast_food: {
    fixed: [{ role: 'manager', fte: 1 }],
    pool: [
      { role: 'cook', weight: 0.4 },
      { role: 'cashier', weight: 0.3 },
      { role: 'polyvalent', weight: 0.3 },
    ],
  },
  burger: {
    fixed: [{ role: 'manager', fte: 1 }],
    pool: [
      { role: 'cook', weight: 0.4 },
      { role: 'cashier', weight: 0.2 },
      { role: 'waiter', weight: 0.4 },
    ],
  },
  pizza: {
    fixed: [{ role: 'head_chef', fte: 1 }],
    pool: [
      { role: 'cook', weight: 0.4 },
      { role: 'cashier', weight: 0.25 },
      { role: 'delivery', weight: 0.35 },
    ],
  },
  traditional: {
    fixed: [{ role: 'head_chef', fte: 1 }],
    pool: [
      { role: 'cook', weight: 0.25 },
      { role: 'commis', weight: 0.15 },
      { role: 'waiter', weight: 0.45 },
      { role: 'dishwasher', weight: 0.15 },
    ],
  },
  brasserie: {
    fixed: [{ role: 'head_chef', fte: 1 }],
    pool: [
      { role: 'cook', weight: 0.25 },
      { role: 'commis', weight: 0.1 },
      { role: 'waiter', weight: 0.4 },
      { role: 'bartender', weight: 0.15 },
      { role: 'dishwasher', weight: 0.1 },
    ],
  },
  cafe_brunch: {
    fixed: [{ role: 'manager', fte: 1 }],
    pool: [
      { role: 'cook', weight: 0.3 },
      { role: 'barista', weight: 0.35 },
      { role: 'waiter', weight: 0.35 },
    ],
  },
  asian: {
    fixed: [{ role: 'head_chef', fte: 1 }],
    pool: [
      { role: 'cook', weight: 0.3 },
      { role: 'commis', weight: 0.15 },
      { role: 'waiter', weight: 0.4 },
      { role: 'dishwasher', weight: 0.15 },
    ],
  },
  premium: {
    fixed: [
      { role: 'head_chef', fte: 1 },
      { role: 'sous_chef', fte: 1 },
      { role: 'room_manager', fte: 1 },
    ],
    pool: [
      { role: 'chef_de_partie', weight: 0.25 },
      { role: 'commis', weight: 0.2 },
      { role: 'waiter', weight: 0.35 },
      { role: 'dishwasher', weight: 0.1 },
      { role: 'bartender', weight: 0.1 },
    ],
  },
  dark_kitchen: {
    fixed: [{ role: 'manager', fte: 1 }],
    pool: [
      { role: 'cook', weight: 0.7 },
      { role: 'polyvalent', weight: 0.3 },
    ],
  },
  other: {
    fixed: [{ role: 'head_chef', fte: 1 }],
    pool: [
      { role: 'cook', weight: 0.3 },
      { role: 'waiter', weight: 0.5 },
      { role: 'dishwasher', weight: 0.2 },
    ],
  },
};

let staffCounter = 0;

export function createStaffMember(
  role: StaffRoleId,
  count = 1,
  weeklyHours = 35,
): StaffMember {
  staffCounter += 1;
  return {
    id: `staff-${staffCounter}`,
    role,
    count,
    grossMonthlySalary: DEFAULT_SALARIES[role].value,
    employmentType: weeklyHours >= 35 ? 'full_time' : 'part_time',
    weeklyHours,
    mealsPerDay: 1,
  };
}

/** Convertit un volume d'ETP en effectif réel, en complétant par du temps partiel. */
function toStaffMember(role: StaffRoleId, fte: number): StaffMember | null {
  if (fte < 0.25) return null;

  const count = Math.max(1, Math.round(fte));
  const weeklyHours = Math.min(39, Math.max(10, Math.round((35 * fte) / count)));

  return createStaffMember(role, count, weeklyHours);
}

/**
 * Construit une équipe par défaut dimensionnée pour le volume d'activité.
 * Le dirigeant n'est pas salarié par défaut dans les concepts indépendants :
 * l'utilisateur doit ajouter sa rémunération s'il se salarie.
 */
export function createStaffForType(
  type: RestaurantTypeId,
  coversPerDay: number,
): StaffMember[] {
  const template = TEAM_TEMPLATE[type];
  const fixedFte = template.fixed.reduce((sum, item) => sum + item.fte, 0);
  const targetFte = Math.max(fixedFte, coversPerDay / COVERS_PER_FTE[type]);
  const poolFte = targetFte - fixedFte;

  const members = [
    ...template.fixed.map((item) => toStaffMember(item.role, item.fte)),
    ...template.pool.map((item) => toStaffMember(item.role, poolFte * item.weight)),
  ];

  return members.filter((member): member is StaffMember => member !== null);
}

export function estimateMonthlyRent(
  city: CityId,
  locationType: LocationTypeId,
  surfaceSqm: number,
): number {
  const benchmark = getRentBenchmark(city, locationType);
  return Math.round((benchmark.value * surfaceSqm) / 12);
}

/**
 * Nombre de rotations de salle par jour, et non de plages horaires : un couvert
 * occupe une place pendant la durée du repas, donc une même place se revend
 * plusieurs fois par service en restauration rapide (repas court) alors qu'elle
 * ne se revend quasiment pas en gastronomique (repas long).
 */
export const SERVICES_PER_DAY_BY_TYPE: Record<RestaurantTypeId, number> = {
  fast_food: 4,
  burger: 3,
  pizza: 3,
  traditional: 2,
  brasserie: 2.5,
  cafe_brunch: 3,
  asian: 2.5,
  premium: 1.5,
  dark_kitchen: 4,
  other: 2,
};

/** Répartition par défaut du chiffre d'affaires entre salle, emporté et livraison. */
export const CHANNEL_MIX_BY_TYPE: Record<
  RestaurantTypeId,
  { takeawayShare: number; deliveryShare: number }
> = {
  fast_food: { takeawayShare: 0.35, deliveryShare: 0.15 },
  burger: { takeawayShare: 0.2, deliveryShare: 0.15 },
  pizza: { takeawayShare: 0.3, deliveryShare: 0.25 },
  traditional: { takeawayShare: 0.05, deliveryShare: 0.03 },
  brasserie: { takeawayShare: 0.05, deliveryShare: 0.03 },
  cafe_brunch: { takeawayShare: 0.2, deliveryShare: 0.05 },
  asian: { takeawayShare: 0.15, deliveryShare: 0.15 },
  premium: { takeawayShare: 0, deliveryShare: 0 },
  dark_kitchen: { takeawayShare: 0.1, deliveryShare: 0.85 },
  other: { takeawayShare: 0.08, deliveryShare: 0.05 },
};

export function createTicketBreakdown(
  type: RestaurantTypeId,
  city: CityId = 'medium_city',
  locationType: LocationTypeId = 'city_center',
) {
  const ticket = getTicketBenchmark(type, city, locationType).value;
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

/**
 * Charges d'exploitation par défaut, exprimées en part du chiffre d'affaires HT.
 *
 * Le panel FIDUCIAL situe les « autres charges externes » autour de 15 % du CA
 * et les « impôts et taxes » autour de 2 %, hors loyer. Les postes ci-dessous
 * reconstituent cette enveloppe plutôt que d'appliquer des montants forfaitaires
 * indépendants de la taille de l'établissement.
 */
const OPERATING_COST_SHARE = {
  utilities: 0.035,
  insurance: 0.006,
  cleaning: 0.009,
  maintenance: 0.01,
  marketing: 0.015,
  banking: 0.003,
  taxesAndDuties: 0.018,
  miscellaneous: 0.01,
} as const;

export function createDefaultOperating(
  type: RestaurantTypeId,
  city: CityId,
  locationType: LocationTypeId,
  surfaceSqm: number,
  estimatedAnnualRevenue: number,
): OperatingAssumptions {
  const rentMonthly = estimateMonthlyRent(city, locationType, surfaceSqm);
  const foodCost = FOOD_COST_BY_TYPE[type].value;
  const monthlyRevenue = Math.max(0, estimatedAnnualRevenue) / 12;
  const share = (rate: number, floor: number) =>
    Math.round(Math.max(monthlyRevenue * rate, floor));

  return {
    foodCostRate: foodCost,
    beverageCostRate: foodCost * 0.75,
    packagingCostRate: BENCHMARKS.packagingCost.value,
    platformCommissionRate: BENCHMARKS.platformCommission.value,
    paymentFeeRate: BENCHMARKS.paymentFees.value,
    rentMonthly,
    rentChargesMonthly: Math.round(rentMonthly * 0.12),
    utilitiesMonthly: share(OPERATING_COST_SHARE.utilities, surfaceSqm * 6),
    insuranceMonthly: share(OPERATING_COST_SHARE.insurance, 180),
    accountingMonthly: 400,
    softwareMonthly: 200,
    telecomMonthly: 90,
    cleaningMonthly: share(OPERATING_COST_SHARE.cleaning, 200),
    maintenanceMonthly: share(OPERATING_COST_SHARE.maintenance, 200),
    marketingMonthly: share(OPERATING_COST_SHARE.marketing, 250),
    bankingMonthly: share(OPERATING_COST_SHARE.banking, 60),
    taxesAndDutiesMonthly: share(OPERATING_COST_SHARE.taxesAndDuties, 150),
    miscellaneousMonthly: share(OPERATING_COST_SHARE.miscellaneous, 150),
  };
}

export function createDefaultProfile(
  overrides: Partial<RestaurantProfile> = {},
): RestaurantProfile {
  const restaurantType = overrides.restaurantType ?? 'traditional';
  const city = overrides.city ?? 'lyon';
  const locationType = overrides.locationType ?? 'city_center';
  const surfaceSqm = overrides.surfaceSqm ?? 120;
  const ticket = createTicketBreakdown(restaurantType, city, locationType);
  const channelMix = CHANNEL_MIX_BY_TYPE[restaurantType];

  return {
    name: overrides.name ?? 'Mon restaurant',
    city,
    locationType,
    restaurantType,
    cuisineType: overrides.cuisineType ?? 'french',
    seatingCapacity: overrides.seatingCapacity ?? 50,
    openingDaysPerWeek: overrides.openingDaysPerWeek ?? BENCHMARKS.openingDaysPerWeek.value,
    servicesPerDay: overrides.servicesPerDay ?? SERVICES_PER_DAY_BY_TYPE[restaurantType],
    openingWeeksPerYear: overrides.openingWeeksPerYear ?? 50,
    occupancyRate:
      overrides.occupancyRate ?? getOccupancyBenchmark(restaurantType, locationType).value,
    surfaceSqm,
    takeawayShare: overrides.takeawayShare ?? channelMix.takeawayShare,
    deliveryShare: overrides.deliveryShare ?? channelMix.deliveryShare,
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

/** Couverts servis par jour pour un profil donné. */
export function getCoversPerDay(profile: RestaurantProfile): number {
  return profile.seatingCapacity * profile.occupancyRate * profile.servicesPerDay;
}

/**
 * Estimation rapide du chiffre d'affaires HT, utilisée pour dimensionner les
 * charges d'exploitation par défaut avant le premier calcul complet.
 */
export function estimateAnnualRevenue(profile: RestaurantProfile): number {
  const ticketTTC = Object.values(profile.ticketBreakdown).reduce((sum, part) => sum + part, 0);
  const annualCovers =
    getCoversPerDay(profile) * profile.openingDaysPerWeek * profile.openingWeeksPerYear;

  return (annualCovers * ticketTTC) / (1 + BENCHMARKS.vatFood.value);
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
      estimateAnnualRevenue(profile),
    ),
    staff: createStaffForType(profile.restaurantType, getCoversPerDay(profile)),
    capex,
    usefulLife: DEFAULT_USEFUL_LIFE,
    financing: createDefaultFinancing(capex),
    tax: DEFAULT_TAX,
  };
}

export const DEMO_SCENARIOS = {
  parisBistro: createDefaultSimulation({
    name: 'Petit bistrot parisien',
    city: 'paris',
    locationType: 'city_center',
    restaurantType: 'traditional',
    seatingCapacity: 32,
    surfaceSqm: 70,
    occupancyRate: 0.62,
  }),
  lyonTraditional: createDefaultSimulation({
    name: 'Restaurant traditionnel — Lyon',
    city: 'lyon',
    locationType: 'city_center',
    restaurantType: 'traditional',
    seatingCapacity: 50,
    surfaceSqm: 120,
    occupancyRate: 0.6,
  }),
  mediumCityTraditional: createDefaultSimulation({
    name: 'Restaurant traditionnel — ville moyenne',
    city: 'medium_city',
    locationType: 'city_center',
    restaurantType: 'traditional',
    seatingCapacity: 60,
    surfaceSqm: 140,
    occupancyRate: 0.58,
  }),
  fastFood: createDefaultSimulation({
    name: 'Fast food — zone commerciale',
    city: 'medium_city',
    locationType: 'commercial_zone',
    restaurantType: 'fast_food',
    seatingCapacity: 40,
    surfaceSqm: 90,
    occupancyRate: 0.84,
  }),
};

export const DEMO_SCENARIO_OPTIONS = [
  { id: 'parisBistro' as const, label: 'Bistrot parisien' },
  { id: 'lyonTraditional' as const, label: 'Traditionnel Lyon' },
  { id: 'mediumCityTraditional' as const, label: 'Ville moyenne' },
  { id: 'fastFood' as const, label: 'Fast food' },
];
