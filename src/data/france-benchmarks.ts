import type {
  BenchmarkValue,
  CityId,
  LocationTypeId,
  RestaurantTypeId,
  StaffRoleId,
} from '@/types/models';

/* -------------------------------------------------------------------------- */
/*  Paie : SMIC, minimum garanti, réduction générale (RGDU)                    */
/* -------------------------------------------------------------------------- */

/** Durée mensuelle légale : 35 h × 52 / 12. */
export const MONTHLY_LEGAL_HOURS = 151.67;

/** SMIC horaire brut au 1er juin 2026 (arrêté du 22 mai 2026). */
export const SMIC_HOURLY_GROSS = 12.31;

/** SMIC mensuel brut au 1er juin 2026, base 35 h. */
export const SMIC_MONTHLY_GROSS = 1867.02;

/**
 * Paramètres de la réduction générale dégressive unique (RGDU), en vigueur
 * depuis le 1er janvier 2026.
 *
 * Coefficient = Tmin + Tdelta × [0,5 × (3 × SMIC annuel de référence / rémunération
 * annuelle brute − 1)]^P, plafonné à Tmin + Tdelta et nul à partir de 3 SMIC.
 *
 * Le « SMIC annuel de référence » est gelé à la valeur du 1er janvier 2026
 * (1 823,03 €/mois) : il ne suit pas la revalorisation du 1er juin 2026.
 */
export const RGDU = {
  tMin: 0.02,
  /** Employeur de moins de 50 salariés, FNAL à 0,10 % (décret n° 2025-1446). */
  tDelta: 0.3773,
  exponent: 1.75,
  annualReferenceSmic: 21876.4,
  monthlyReferenceSmic: 1823.03,
  /** Plafond du coefficient : Tmin + Tdelta. */
  maxCoefficient: 0.3973,
  /** Plus aucune réduction à partir de ce multiple du SMIC de référence. */
  ceilingSmicMultiple: 3,
} as const;

/**
 * Taux de cotisations patronales avant réduction, employeur HCR de moins de
 * 50 salariés. La réforme 2026 ayant supprimé les taux réduits maladie et
 * allocations familiales au profit de la seule RGDU, on applique les taux
 * pleins puis la RGDU.
 */
export const EMPLOYER_CONTRIBUTIONS = {
  healthInsurance: 0.13,
  oldAge: 0.1066,
  familyAllowances: 0.0525,
  /** Taux net collectif AT/MP observé en restauration (part mutualisée 0,49 %). */
  workAccident: 0.022,
  /** Agirc-Arrco T1 (6,01 %) + CEG (1,29 %). */
  complementaryPension: 0.073,
  /** Assurance chômage (4,00 %) + AGS (0,25 %). */
  unemployment: 0.0425,
  fnal: 0.001,
  autonomySolidarity: 0.003,
  /** Formation professionnelle, taxe d'apprentissage, dialogue social. */
  trainingAndApprenticeship: 0.0123,
  /** Mutuelle, prévoyance et médecine du travail (ordre de grandeur TPE). */
  healthCoverAndOccupationalMedicine: 0.017,
} as const;

/** Somme des taux ci-dessus : assiette patronale avant RGDU. */
export const GROSS_EMPLOYER_RATE = Object.values(EMPLOYER_CONTRIBUTIONS).reduce(
  (total, rate) => total + rate,
  0,
);

/**
 * Part des cotisations entrant dans le champ de la RGDU : maladie 13,00 %,
 * vieillesse 10,66 %, allocations familiales 5,25 %, AT/MP pour sa part
 * mutualisée 0,49 %, Agirc-Arrco 6,01 %, FNAL 0,10 %, CSA 0,30 % et chômage
 * 4,00 %. Le reste (CEG, AGS, AT/MP au-delà de 0,49 %, formation, mutuelle)
 * reste dû quel que soit le niveau de salaire.
 */
export const RGDU_ELIGIBLE_CONTRIBUTIONS = 0.3981;

/**
 * Avantage en nature nourriture HCR : 1 minimum garanti par repas
 * (4,35 € depuis le 1er juin 2026, 4,25 € de janvier à mai).
 */
export const HCR_MEAL_BENEFIT = 4.35;

/** Jours travaillés par an retenus pour valoriser les repas du personnel. */
export const WORKED_DAYS_PER_YEAR = 228;

/* -------------------------------------------------------------------------- */
/*  Grille conventionnelle HCR (IDCC 1979, avenant n° 33 du 19 juin 2024)      */
/* -------------------------------------------------------------------------- */

export type HcrLevel = 'I' | 'II' | 'III' | 'IV' | 'V';
export type HcrStep = 1 | 2 | 3;

/** Minima horaires bruts de l'avenant n° 33, toujours applicables en 2026. */
export const HCR_WAGE_GRID: Record<HcrLevel, Record<HcrStep, number>> = {
  I: { 1: 12.0, 2: 12.08, 3: 12.18 },
  II: { 1: 12.28, 2: 12.55, 3: 13.17 },
  III: { 1: 13.32, 2: 13.54, 3: 14.0 },
  IV: { 1: 14.4, 2: 14.77, 3: 15.4 },
  V: { 1: 18.43, 2: 21.78, 3: 28.12 },
};

/**
 * Minimum horaire réellement applicable : le SMIC prime sur le minimum
 * conventionnel lorsque celui-ci lui est inférieur (niveaux I et II-1 en 2026).
 */
export function hcrHourlyFloor(level: HcrLevel, step: HcrStep): number {
  return Math.max(HCR_WAGE_GRID[level][step], SMIC_HOURLY_GROSS);
}

export function hcrMonthlyFloor(level: HcrLevel, step: HcrStep): number {
  return Math.round(hcrHourlyFloor(level, step) * MONTHLY_LEGAL_HOURS * 100) / 100;
}

/* -------------------------------------------------------------------------- */
/*  Ratios sectoriels                                                          */
/* -------------------------------------------------------------------------- */

const FIDUCIAL =
  'FIDUCIAL, Observatoire de la restauration (édition 2025, résultats 2024, panel de 400 points de vente)';
const FIDUCIAL_URL =
  'https://www.fiducial.fr/Hotellerie-Restauration/comptabilite/L-Observatoire-FIDUCIAL-de-la-restauration';

export const BENCHMARKS = {
  foodCostTraditional: {
    value: 0.32,
    low: 0.26,
    high: 0.36,
    unit: '% CA',
    source: FIDUCIAL,
    url: FIDUCIAL_URL,
    year: 2025,
    type: 'benchmark' as const,
    label: 'Coût matière — restauration traditionnelle',
    note: 'Déduit des marges brutes du panel (64 % à 74 % du CA selon la tranche de chiffre d’affaires).',
  },
  foodCostFastFood: {
    value: 0.3,
    low: 0.26,
    high: 0.34,
    unit: '% CA',
    source: FIDUCIAL,
    url: FIDUCIAL_URL,
    year: 2025,
    type: 'benchmark' as const,
    label: 'Coût matière — restauration rapide',
    note: 'Déduit des marges brutes du panel.',
  },
  materialLoss: {
    value: 0.0236,
    low: 0.01,
    high: 0.04,
    unit: '% des achats',
    source: FIDUCIAL,
    url: FIDUCIAL_URL,
    year: 2025,
    type: 'benchmark' as const,
    label: 'Taux de perte matière',
  },
  laborCostShare: {
    value: 0.33,
    low: 0.24,
    high: 0.38,
    unit: '% CA',
    source: FIDUCIAL,
    url: FIDUCIAL_URL,
    year: 2025,
    type: 'benchmark' as const,
    label: 'Charges de personnel / CA',
    note: 'Moyenne du panel 33 %. La fourchette recouvre les écarts par tranche de CA (24 % à 38 %).',
  },
  rentShare: {
    value: 0.04,
    low: 0.0,
    high: 0.06,
    unit: '% CA',
    source: FIDUCIAL,
    url: FIDUCIAL_URL,
    year: 2025,
    type: 'benchmark' as const,
    label: 'Locations immobilières / CA',
    note: 'Poste « locations immobilières » du panel : 4 % en moyenne, jusqu’à 6 % pour les petits CA. Nul pour un exploitant propriétaire de ses murs.',
  },
  ebitdaMargin: {
    value: 0.14,
    low: 0.13,
    high: 0.18,
    unit: '% CA',
    source: FIDUCIAL,
    url: FIDUCIAL_URL,
    year: 2025,
    type: 'benchmark' as const,
    label: 'Excédent brut d’exploitation / CA',
  },
  netMargin: {
    value: 0.05,
    low: 0.03,
    high: 0.12,
    unit: '% CA',
    source: `${FIDUCIAL} ; retraitement`,
    url: FIDUCIAL_URL,
    year: 2025,
    type: 'hypothesis' as const,
    label: 'Marge nette après rémunération du dirigeant',
    note: 'Le panel affiche 9 % à 15 % de résultat net avant IR, mais une large part des points de vente sont des entreprises individuelles où la rémunération de l’exploitant ne figure pas en charges de personnel. La valeur retenue corrige cet effet ; elle n’est pas une donnée publiée.',
  },
  averageTicketTraditional: {
    value: 35,
    low: 25,
    high: 55,
    unit: '€ TTC',
    source: FIDUCIAL,
    url: FIDUCIAL_URL,
    year: 2025,
    type: 'benchmark' as const,
    label: 'Ticket moyen — restauration traditionnelle',
    note: 'Ticket moyen tous segments confondus : 30,72 € TTC. Plat du jour moyen : 17,28 € TTC.',
  },
  averageTicketFastFood: {
    value: 19,
    low: 12,
    high: 25,
    unit: '€ TTC',
    source: FIDUCIAL,
    url: FIDUCIAL_URL,
    year: 2025,
    type: 'benchmark' as const,
    label: 'Ticket moyen — restauration rapide',
  },
  occupancyTraditional: {
    value: 0.58,
    low: 0.45,
    high: 0.7,
    unit: '%',
    source: FIDUCIAL,
    url: FIDUCIAL_URL,
    year: 2025,
    type: 'benchmark' as const,
    label: 'Taux de remplissage — restauration traditionnelle',
    note: '58 % en 2024 contre 60 % l’année précédente.',
  },
  occupancyFastFood: {
    value: 0.84,
    low: 0.7,
    high: 0.94,
    unit: '%',
    source: FIDUCIAL,
    url: FIDUCIAL_URL,
    year: 2025,
    type: 'benchmark' as const,
    label: 'Taux de remplissage — restauration rapide',
    note: '84 % en 2024 contre 94 % l’année précédente.',
  },
  openingDaysPerWeek: {
    value: 6,
    low: 5,
    high: 7,
    unit: 'jours',
    source: FIDUCIAL,
    url: FIDUCIAL_URL,
    year: 2025,
    type: 'benchmark' as const,
    label: 'Jours d’ouverture par semaine',
    note: 'Profil du restaurant « type » du panel : 2 services par jour, 6 jours sur 7, en ville moyenne.',
  },
  vatFood: {
    value: 0.1,
    low: 0.1,
    high: 0.1,
    unit: '%',
    source: 'Service-Public / DGFiP — TVA applicable à la restauration',
    url: 'https://entreprendre.service-public.gouv.fr/vosdroits/F22399',
    year: 2026,
    type: 'benchmark' as const,
    label: 'TVA nourriture et boissons sans alcool',
  },
  vatAlcohol: {
    value: 0.2,
    low: 0.2,
    high: 0.2,
    unit: '%',
    source: 'Service-Public / DGFiP — TVA applicable aux boissons alcoolisées',
    url: 'https://entreprendre.service-public.gouv.fr/vosdroits/F22399',
    year: 2026,
    type: 'benchmark' as const,
    label: 'TVA boissons alcoolisées',
  },
  corporateTaxStandard: {
    value: 0.25,
    low: 0.25,
    high: 0.25,
    unit: '%',
    source: 'economie.gouv.fr — impôt sur les sociétés',
    url: 'https://www.economie.gouv.fr/entreprises/gerer-sa-fiscalite-et-ses-impots/limpot-sur-les-benefices-ir-et/limpot-sur-les-societes',
    year: 2026,
    type: 'benchmark' as const,
    label: 'Impôt sur les sociétés — taux normal',
  },
  corporateTaxReduced: {
    value: 0.15,
    low: 0.15,
    high: 0.15,
    unit: '%',
    source: 'economie.gouv.fr — taux réduit d’IS pour les PME',
    url: 'https://www.economie.gouv.fr/entreprises/gerer-sa-fiscalite-et-ses-impots/limpot-sur-les-benefices-ir-et/limpot-sur-les-societes',
    year: 2026,
    type: 'benchmark' as const,
    label: 'Impôt sur les sociétés — taux réduit (≤ 42 500 €)',
  },
  smicMonthly: {
    value: SMIC_MONTHLY_GROSS,
    low: 1823.03,
    high: SMIC_MONTHLY_GROSS,
    unit: '€ brut/mois',
    source: 'URSSAF — montant du Smic (arrêté du 22 mai 2026)',
    url: 'https://www.urssaf.fr/accueil/outils-documentation/taux-baremes/montant-smic.html',
    year: 2026,
    type: 'benchmark' as const,
    label: 'SMIC mensuel brut',
    note: '12,31 €/h depuis le 1er juin 2026 (12,02 €/h du 1er janvier au 31 mai).',
  },
  employerRateAtSmic: {
    value: Math.round((GROSS_EMPLOYER_RATE - RGDU.maxCoefficient) * 1000) / 1000,
    low: 0.05,
    high: 0.12,
    unit: '% du brut',
    source: 'Calcul à partir des taux URSSAF 2026 et de la RGDU (décret n° 2025-1446)',
    url: 'https://www.urssaf.fr/accueil/employeur/beneficier-exonerations/reduction-generale-cotisation.html',
    year: 2026,
    type: 'hypothesis' as const,
    label: 'Coût patronal effectif au niveau du SMIC',
    note: 'Assiette patronale pleine diminuée du coefficient maximal de RGDU. Estimation, non opposable.',
  },
  mealBenefit: {
    value: HCR_MEAL_BENEFIT,
    low: 4.25,
    high: HCR_MEAL_BENEFIT,
    unit: '€ / repas',
    source: 'URSSAF / arrêté du 28 avril 2003 — avantage en nature nourriture HCR (1 minimum garanti)',
    url: 'https://www.urssaf.fr/accueil/outils-documentation/taux-baremes/avantages-en-nature.html',
    year: 2026,
    type: 'benchmark' as const,
    label: 'Avantage en nature repas HCR',
    note: '4,35 € par repas depuis le 1er juin 2026 (4,25 € de janvier à mai), contre 5,50 € au régime général.',
  },
  platformCommission: {
    value: 0.28,
    low: 0.15,
    high: 0.35,
    unit: '% CA livraison',
    source: 'Ordre de grandeur des commissions pratiquées par les plateformes de livraison',
    year: 2026,
    type: 'hypothesis' as const,
    label: 'Commission des plateformes de livraison',
    note: 'Aucune donnée publique consolidée : fourchette d’usage, à remplacer par vos conditions contractuelles.',
  },
  paymentFees: {
    value: 0.015,
    low: 0.008,
    high: 0.025,
    unit: '% CA',
    source: 'Ordre de grandeur des frais monétiques (commission carte + location TPE)',
    year: 2026,
    type: 'hypothesis' as const,
    label: 'Frais de paiement',
  },
  packagingCost: {
    value: 0.03,
    low: 0.02,
    high: 0.05,
    unit: '% CA emporté',
    source: 'Hypothèse opérateur — emballages de la vente à emporter et de la livraison',
    year: 2026,
    type: 'hypothesis' as const,
    label: 'Emballages',
  },
  primeCostTarget: {
    value: 0.65,
    low: 0.6,
    high: 0.7,
    unit: '% CA',
    source: 'Pratique de gestion : coût matière + masse salariale chargée',
    year: 2026,
    type: 'hypothesis' as const,
    label: 'Prime cost cible',
    note: 'Repère de pilotage courant, pas une donnée statistique.',
  },
} satisfies Record<string, BenchmarkValue>;

/* -------------------------------------------------------------------------- */
/*  Déclinaison par type de restaurant                                         */
/* -------------------------------------------------------------------------- */

function derive(
  base: BenchmarkValue,
  overrides: Partial<BenchmarkValue> & { value: number },
): BenchmarkValue {
  return { ...base, type: 'hypothesis', ...overrides };
}

export const FOOD_COST_BY_TYPE: Record<RestaurantTypeId, BenchmarkValue> = {
  fast_food: BENCHMARKS.foodCostFastFood,
  burger: derive(BENCHMARKS.foodCostFastFood, {
    value: 0.31,
    low: 0.27,
    high: 0.35,
    label: 'Coût matière — burger',
  }),
  pizza: derive(BENCHMARKS.foodCostFastFood, {
    value: 0.28,
    low: 0.24,
    high: 0.32,
    label: 'Coût matière — pizza',
  }),
  traditional: BENCHMARKS.foodCostTraditional,
  brasserie: derive(BENCHMARKS.foodCostTraditional, {
    value: 0.31,
    low: 0.28,
    high: 0.34,
    label: 'Coût matière — brasserie',
  }),
  cafe_brunch: derive(BENCHMARKS.foodCostTraditional, {
    value: 0.29,
    low: 0.25,
    high: 0.33,
    label: 'Coût matière — café / brunch',
  }),
  asian: derive(BENCHMARKS.foodCostTraditional, {
    value: 0.3,
    low: 0.26,
    high: 0.34,
    label: 'Coût matière — asiatique',
  }),
  premium: derive(BENCHMARKS.foodCostTraditional, {
    value: 0.35,
    low: 0.3,
    high: 0.4,
    label: 'Coût matière — gastronomique',
  }),
  dark_kitchen: derive(BENCHMARKS.foodCostFastFood, {
    value: 0.32,
    low: 0.28,
    high: 0.36,
    label: 'Coût matière — dark kitchen',
  }),
  other: BENCHMARKS.foodCostTraditional,
};

export const TICKET_BY_TYPE: Record<RestaurantTypeId, BenchmarkValue> = {
  fast_food: BENCHMARKS.averageTicketFastFood,
  burger: derive(BENCHMARKS.averageTicketFastFood, {
    value: 18,
    low: 13,
    high: 24,
    label: 'Ticket moyen — burger',
  }),
  pizza: derive(BENCHMARKS.averageTicketFastFood, {
    value: 17,
    low: 12,
    high: 22,
    label: 'Ticket moyen — pizza',
  }),
  traditional: BENCHMARKS.averageTicketTraditional,
  brasserie: derive(BENCHMARKS.averageTicketTraditional, {
    value: 31,
    low: 24,
    high: 42,
    label: 'Ticket moyen — brasserie',
  }),
  cafe_brunch: derive(BENCHMARKS.averageTicketTraditional, {
    value: 19,
    low: 13,
    high: 28,
    label: 'Ticket moyen — café / brunch',
  }),
  asian: derive(BENCHMARKS.averageTicketTraditional, {
    value: 23,
    low: 16,
    high: 32,
    label: 'Ticket moyen — asiatique',
  }),
  premium: derive(BENCHMARKS.averageTicketTraditional, {
    value: 75,
    low: 55,
    high: 150,
    label: 'Ticket moyen — gastronomique',
  }),
  dark_kitchen: derive(BENCHMARKS.averageTicketFastFood, {
    value: 22,
    low: 15,
    high: 30,
    label: 'Ticket moyen — dark kitchen',
    note: 'Panier livraison, généralement multi-convives.',
  }),
  other: BENCHMARKS.averageTicketTraditional,
};

export const CITY_LABELS: Record<CityId, string> = {
  paris: 'Paris',
  lyon: 'Lyon',
  marseille: 'Marseille',
  bordeaux: 'Bordeaux',
  lille: 'Lille',
  toulouse: 'Toulouse',
  nantes: 'Nantes',
  nice: 'Nice',
  strasbourg: 'Strasbourg',
  montpellier: 'Montpellier',
  rennes: 'Rennes',
  medium_city: 'Ville moyenne',
  other: 'Autre',
};

/**
 * Écart de prix de la restauration par rapport à la moyenne nationale. L'INSEE
 * mesure un niveau de prix supérieur de 8,4 % en Île-de-France, écart porté à
 * plus de 20 % sur la restauration à Paris intra-muros, où le loyer et le
 * salaire médian sont les plus élevés.
 */
export const CITY_TICKET_MULTIPLIER: Record<CityId, number> = {
  paris: 1.22,
  nice: 1.1,
  lyon: 1.07,
  bordeaux: 1.06,
  nantes: 1.02,
  toulouse: 1.02,
  marseille: 1.0,
  montpellier: 1.0,
  strasbourg: 1.0,
  rennes: 1.0,
  lille: 0.99,
  medium_city: 0.93,
  other: 0.93,
};

/** Le positionnement dans la ville déplace également le prix acceptable. */
export const LOCATION_TICKET_MULTIPLIER: Record<LocationTypeId, number> = {
  premium_center: 1.12,
  city_center: 1,
  residential: 0.95,
  commercial_zone: 0.92,
  periphery: 0.9,
};

/**
 * Tous les concepts ne répercutent pas l'écart territorial de la même façon :
 * la restauration rapide est largement pilotée par des cartes nationales et
 * varie peu d'une ville à l'autre, alors qu'un restaurant traditionnel ou
 * gastronomique cale son prix sur son marché local.
 */
const TICKET_LOCATION_SENSITIVITY: Record<RestaurantTypeId, number> = {
  fast_food: 0.4,
  burger: 0.5,
  pizza: 0.5,
  dark_kitchen: 0.4,
  cafe_brunch: 0.8,
  asian: 0.8,
  traditional: 1,
  brasserie: 1,
  premium: 1,
  other: 0.8,
};

/**
 * Ticket moyen attendu pour un concept à un emplacement donné. Le type de
 * restaurant fixe le niveau, la localisation l'ajuste.
 */
export function getTicketBenchmark(
  restaurantType: RestaurantTypeId,
  city: CityId,
  locationType: LocationTypeId,
): BenchmarkValue {
  const base = TICKET_BY_TYPE[restaurantType];
  const territorial = CITY_TICKET_MULTIPLIER[city] * LOCATION_TICKET_MULTIPLIER[locationType];
  const multiplier = 1 + (territorial - 1) * TICKET_LOCATION_SENSITIVITY[restaurantType];
  const round = (amount: number) => Math.round(amount * 2) / 2;

  if (multiplier === 1) return base;

  return {
    ...base,
    value: round(base.value * multiplier),
    low: round(base.low * multiplier),
    high: round(base.high * multiplier),
    type: 'hypothesis',
    source: `${base.source} ; ajusté de ${Math.round((multiplier - 1) * 100)} % pour « ${CITY_LABELS[city]} — ${LOCATION_LABELS[locationType]} » (écarts de prix territoriaux INSEE)`,
    note: 'Ajustement territorial indicatif appliqué au ticket moyen du concept. Modifiable librement.',
  };
}

/**
 * Effet du positionnement sur le flux : un emplacement n° 1 travaille midi et
 * soir, une périphérie dépend d'une clientèle de destination. L'amplitude est
 * volontairement modérée, le concept pesant davantage que l'adresse.
 */
export const LOCATION_OCCUPANCY_MULTIPLIER: Record<LocationTypeId, number> = {
  premium_center: 1.08,
  city_center: 1,
  residential: 0.92,
  commercial_zone: 0.95,
  periphery: 0.88,
};

export const OCCUPANCY_BY_TYPE: Record<RestaurantTypeId, BenchmarkValue> = {
  fast_food: BENCHMARKS.occupancyFastFood,
  burger: derive(BENCHMARKS.occupancyFastFood, { value: 0.78, label: 'Remplissage — burger' }),
  pizza: derive(BENCHMARKS.occupancyFastFood, { value: 0.76, label: 'Remplissage — pizza' }),
  traditional: BENCHMARKS.occupancyTraditional,
  brasserie: derive(BENCHMARKS.occupancyTraditional, {
    value: 0.6,
    label: 'Remplissage — brasserie',
  }),
  cafe_brunch: derive(BENCHMARKS.occupancyTraditional, {
    value: 0.55,
    label: 'Remplissage — café / brunch',
  }),
  asian: derive(BENCHMARKS.occupancyTraditional, { value: 0.58, label: 'Remplissage — asiatique' }),
  premium: derive(BENCHMARKS.occupancyTraditional, {
    value: 0.5,
    label: 'Remplissage — gastronomique',
  }),
  dark_kitchen: derive(BENCHMARKS.occupancyFastFood, {
    value: 0.85,
    label: 'Remplissage — dark kitchen',
    note: 'Le « remplissage » représente ici le taux d’utilisation de la capacité de production.',
  }),
  other: BENCHMARKS.occupancyTraditional,
};

/** Remplissage attendu pour un concept à un type d'emplacement donné. */
export function getOccupancyBenchmark(
  restaurantType: RestaurantTypeId,
  locationType: LocationTypeId,
): BenchmarkValue {
  const base = OCCUPANCY_BY_TYPE[restaurantType];
  const multiplier = LOCATION_OCCUPANCY_MULTIPLIER[locationType];
  const cap = (ratio: number) => Math.min(0.98, Math.round(ratio * multiplier * 100) / 100);

  if (multiplier === 1) return base;

  return {
    ...base,
    value: cap(base.value),
    low: cap(base.low),
    high: cap(base.high),
    type: 'hypothesis',
    source: `${base.source} ; modulé pour un emplacement « ${LOCATION_LABELS[locationType]} »`,
    note: 'Ajustement indicatif du flux selon l’emplacement. Le remplissage réel dépend surtout de la notoriété du lieu.',
  };
}

/* -------------------------------------------------------------------------- */
/*  Loyers commerciaux                                                         */
/* -------------------------------------------------------------------------- */

/**
 * Loyer moyen observé, toutes localisations confondues (€/m²/an HT HC).
 * Le loyer d'un emplacement donné est ensuite reconstruit en appliquant un
 * multiplicateur de positionnement, plutôt que de prétendre disposer d'un
 * barème exact par quartier.
 */
export const CITY_RENT_BASE: Record<CityId, { value: number; sourced: boolean }> = {
  paris: { value: 525, sourced: true },
  lyon: { value: 243, sourced: true },
  marseille: { value: 209, sourced: true },
  bordeaux: { value: 241, sourced: true },
  lille: { value: 225, sourced: false },
  toulouse: { value: 246, sourced: true },
  nantes: { value: 235, sourced: false },
  nice: { value: 300, sourced: false },
  strasbourg: { value: 225, sourced: false },
  montpellier: { value: 247, sourced: true },
  rennes: { value: 239, sourced: true },
  medium_city: { value: 139, sourced: true },
  other: { value: 160, sourced: false },
};

/** Positionnement de l'emplacement par rapport au loyer moyen de la ville. */
export const LOCATION_RENT_MULTIPLIER: Record<LocationTypeId, number> = {
  premium_center: 2.6,
  city_center: 1.5,
  residential: 0.75,
  commercial_zone: 0.6,
  periphery: 0.45,
};

const RENT_SOURCE =
  'Hiscox 2026 (loyers moyens de locaux commerciaux par ville) et B&E Partners (Paris intra-muros, 375–625 €/m²/an, moyenne 520 €), recoupés avec les fourchettes CBRE Paris et Haussmann Expertise Lyon / Nice';
const RENT_URL = 'https://www.hiscox.fr/blog/immobilier-professionnel-2026-quelles-villes-offrent-les-meilleurs-rendements';

export const LOCATION_LABELS: Record<LocationTypeId, string> = {
  premium_center: 'centre-ville premium',
  city_center: 'centre-ville',
  residential: 'quartier résidentiel',
  commercial_zone: 'zone commerciale',
  periphery: 'périphérie',
};

/**
 * Benchmark indicatif de loyer. La dispersion réelle d'une rue à l'autre est
 * considérable : la fourchette retenue est volontairement large.
 */
export function getRentBenchmark(city: CityId, locationType: LocationTypeId): BenchmarkValue {
  const base = CITY_RENT_BASE[city];
  const value = Math.round(base.value * LOCATION_RENT_MULTIPLIER[locationType]);

  return {
    value,
    low: Math.round(value * 0.6),
    high: Math.round(value * 1.8),
    unit: '€/m²/an',
    source: base.sourced
      ? `${RENT_SOURCE} ; positionnement « ${LOCATION_LABELS[locationType]} » appliqué au loyer moyen de la ville`
      : `Interpolation à partir de villes comparables — ${RENT_SOURCE}`,
    url: RENT_URL,
    year: 2026,
    type: 'hypothesis',
    label: `Loyer indicatif — ${LOCATION_LABELS[locationType]}`,
    note: 'Benchmark indicatif. Le loyer réel dépend de la rue, du linéaire de façade, de la présence d’une extraction (prime de 15 à 25 %) et du droit au bail.',
  };
}

/* -------------------------------------------------------------------------- */
/*  Salaires par poste                                                         */
/* -------------------------------------------------------------------------- */

export const STAFF_ROLE_LABELS: Record<StaffRoleId, string> = {
  manager: 'Directeur / gérant',
  head_chef: 'Chef de cuisine',
  sous_chef: 'Second de cuisine',
  cook: 'Cuisinier',
  commis: 'Commis de cuisine',
  chef_de_partie: 'Chef de partie',
  dishwasher: 'Plongeur',
  waiter: 'Serveur',
  room_manager: 'Responsable de salle',
  cashier: 'Caissier',
  polyvalent: 'Employé polyvalent',
  barista: 'Barista',
  bartender: 'Barman',
  delivery: 'Livreur',
  admin: 'Responsable administratif',
};

/** Rattachement indicatif de chaque poste à la classification HCR. */
export const STAFF_ROLE_HCR_POSITION: Record<StaffRoleId, { level: HcrLevel; step: HcrStep }> = {
  manager: { level: 'V', step: 1 },
  head_chef: { level: 'IV', step: 3 },
  sous_chef: { level: 'IV', step: 1 },
  cook: { level: 'III', step: 1 },
  commis: { level: 'I', step: 2 },
  chef_de_partie: { level: 'III', step: 3 },
  dishwasher: { level: 'I', step: 1 },
  waiter: { level: 'II', step: 2 },
  room_manager: { level: 'IV', step: 1 },
  cashier: { level: 'I', step: 3 },
  polyvalent: { level: 'I', step: 2 },
  barista: { level: 'II', step: 2 },
  bartender: { level: 'II', step: 3 },
  delivery: { level: 'I', step: 2 },
  admin: { level: 'IV', step: 2 },
};

/** Rémunération de marché pratiquée au-dessus du minimum conventionnel. */
const MARKET_SALARY: Record<StaffRoleId, { value: number; high: number }> = {
  manager: { value: 3200, high: 4200 },
  head_chef: { value: 3000, high: 3800 },
  sous_chef: { value: 2500, high: 3000 },
  cook: { value: 2300, high: 2800 },
  commis: { value: 1950, high: 2200 },
  chef_de_partie: { value: 2400, high: 2900 },
  dishwasher: { value: 1900, high: 2100 },
  waiter: { value: 2100, high: 2500 },
  room_manager: { value: 2600, high: 3200 },
  cashier: { value: 1950, high: 2200 },
  polyvalent: { value: 2000, high: 2300 },
  barista: { value: 2050, high: 2400 },
  bartender: { value: 2200, high: 2700 },
  delivery: { value: 1900, high: 2100 },
  admin: { value: 2800, high: 3500 },
};

function buildSalaryBenchmark(role: StaffRoleId): BenchmarkValue {
  const { level, step } = STAFF_ROLE_HCR_POSITION[role];
  const floor = hcrMonthlyFloor(level, step);
  const market = MARKET_SALARY[role];

  return {
    value: Math.max(market.value, floor),
    low: floor,
    high: Math.max(market.high, floor),
    unit: '€ brut/mois',
    source: `Plancher : convention collective HCR (IDCC 1979), avenant n° 33 — niveau ${level}, échelon ${step}, primauté du SMIC appliquée. Valeur centrale : estimation de marché.`,
    url: 'https://code.travail.gouv.fr/contribution/1979-quel-est-le-salaire-minimum',
    year: 2026,
    type: 'hypothesis',
    label: `Salaire — ${STAFF_ROLE_LABELS[role]}`,
    note: `Minimum conventionnel applicable : ${floor.toFixed(2)} € brut/mois pour 151,67 h. La valeur centrale est une estimation de marché, pas une donnée publiée.`,
  };
}

export const DEFAULT_SALARIES: Record<StaffRoleId, BenchmarkValue> = Object.fromEntries(
  (Object.keys(STAFF_ROLE_LABELS) as StaffRoleId[]).map((role) => [role, buildSalaryBenchmark(role)]),
) as Record<StaffRoleId, BenchmarkValue>;

/* -------------------------------------------------------------------------- */
/*  Sources                                                                    */
/* -------------------------------------------------------------------------- */

export const METHODOLOGY_SOURCES = [
  {
    title: 'FIDUCIAL — Observatoire de la restauration, édition 2025',
    description:
      'Ratios de gestion établis sur les résultats 2024 de 400 points de vente : ticket moyen (30,72 € TTC), taux de remplissage (58 % en traditionnel, 84 % en rapide), marge brute, charges de personnel, EBE. L’édition 2026 est parue en septembre 2026 mais ses ratios détaillés ne sont pas publics à la date de cette version.',
    url: FIDUCIAL_URL,
  },
  {
    title: 'URSSAF — Montant du SMIC',
    description:
      'SMIC horaire brut de 12,31 € et mensuel de 1 867,02 € depuis le 1er juin 2026 (arrêté du 22 mai 2026) ; minimum garanti de 4,35 €.',
    url: 'https://www.urssaf.fr/accueil/outils-documentation/taux-baremes/montant-smic.html',
  },
  {
    title: 'URSSAF — Réduction générale dégressive unique (RGDU)',
    description:
      'Formule du coefficient applicable depuis le 1er janvier 2026, SMIC annuel de référence de 21 876,40 € gelé au 1er janvier, extinction à 3 SMIC.',
    url: 'https://www.urssaf.fr/accueil/employeur/beneficier-exonerations/reduction-generale-cotisation.html',
  },
  {
    title: 'Convention collective HCR (IDCC 1979) — avenant n° 33 du 19 juin 2024',
    description:
      'Grille des minima conventionnels par niveau et échelon, toujours en vigueur en 2026, sous réserve de la primauté du SMIC.',
    url: 'https://code.travail.gouv.fr/contribution/1979-quel-est-le-salaire-minimum',
  },
  {
    title: 'Service-Public — TVA applicable à la restauration',
    description:
      'Taux de 10 % sur les repas et les boissons sans alcool, 20 % sur les boissons alcoolisées.',
    url: 'https://entreprendre.service-public.gouv.fr/vosdroits/F22399',
  },
  {
    title: 'economie.gouv.fr — Impôt sur les sociétés',
    description: 'Taux normal de 25 % et taux réduit de 15 % jusqu’à 42 500 € de bénéfice.',
    url: 'https://www.economie.gouv.fr/entreprises/gerer-sa-fiscalite-et-ses-impots/limpot-sur-les-benefices-ir-et/limpot-sur-les-societes',
  },
  {
    title: 'Bpifrance Création — Prévisions financières',
    description: 'Méthodologie du prévisionnel, du plan de financement et du seuil de rentabilité.',
    url: 'https://bpifrance-creation.fr/encyclopedie/previsions-financieres-business-plan/previsions-financieres/previsions-financieres',
  },
  {
    title: 'Loyers commerciaux — repères de marché',
    description:
      'Loyers moyens par ville (Hiscox 2026), Paris intra-muros 375–625 €/m²/an (B&E Partners, base DVF), fourchettes par secteur CBRE et Haussmann Expertise.',
    url: RENT_URL,
  },
] as const;
