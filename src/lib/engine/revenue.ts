import type {
  RestaurantProfile,
  RevenueBreakdown,
  SimulationInput,
  TaxSettings,
} from '@/types/models';

/** Part maximale du chiffre d'affaires réalisable hors salle. */
const MAX_OFF_PREMISE_SHARE = 0.95;

export function getAverageTicketTTC(profile: RestaurantProfile): number {
  const { ticketBreakdown } = profile;
  return (
    ticketBreakdown.food +
    ticketBreakdown.beverages +
    ticketBreakdown.alcohol +
    ticketBreakdown.dessert +
    ticketBreakdown.other
  );
}

export function calculateCovers(
  profile: RestaurantProfile,
  occupancyRate = profile.occupancyRate,
) {
  const coversPerService = profile.seatingCapacity * occupancyRate;
  const coversPerDay = coversPerService * profile.servicesPerDay;
  const coversPerWeek = coversPerDay * profile.openingDaysPerWeek;
  const annualCovers = coversPerWeek * profile.openingWeeksPerYear;
  const openingDaysPerYear = profile.openingDaysPerWeek * profile.openingWeeksPerYear;

  return {
    coversPerService,
    coversPerDay,
    coversPerWeek,
    annualCovers,
    openingDaysPerYear,
  };
}

/**
 * Répartition du chiffre d'affaires entre la salle, la vente à emporter et la
 * livraison. Les parts saisies sont des parts du chiffre d'affaires total ;
 * elles sont normalisées si leur somme est trop proche de 100 %.
 */
export function getChannelMix(profile: RestaurantProfile) {
  const takeaway = Math.max(0, profile.takeawayShare);
  const delivery = Math.max(0, profile.deliveryShare);
  const offPremise = takeaway + delivery;

  if (offPremise <= MAX_OFF_PREMISE_SHARE) {
    return { dineIn: 1 - offPremise, takeaway, delivery };
  }

  const scale = MAX_OFF_PREMISE_SHARE / offPremise;
  return {
    dineIn: 1 - MAX_OFF_PREMISE_SHARE,
    takeaway: takeaway * scale,
    delivery: delivery * scale,
  };
}

/** Taux de TVA moyen pondéré par la composition du ticket. */
export function getAverageVatRate(profile: RestaurantProfile, tax: TaxSettings): number {
  const ticket = getAverageTicketTTC(profile);
  if (ticket <= 0) return tax.vatFood;

  const { food, beverages, alcohol, dessert, other } = profile.ticketBreakdown;

  return (
    ((food + dessert + other) * tax.vatFood +
      beverages * tax.vatBeverage +
      alcohol * tax.vatAlcohol) /
    ticket
  );
}

export function calculateRevenue(
  input: SimulationInput,
  occupancyRate = input.profile.occupancyRate,
): RevenueBreakdown {
  const { profile, tax } = input;
  const covers = calculateCovers(profile, occupancyRate);
  const averageTicketTTC = getAverageTicketTTC(profile);
  const mix = getChannelMix(profile);

  // Un couvert correspond à une transaction, quel que soit le canal : la
  // capacité de production est la même pour la salle, l'emporté et la livraison.
  const totalRevenueTTC = covers.annualCovers * averageTicketTTC;
  const dineInTTC = totalRevenueTTC * mix.dineIn;
  const takeawayTTC = totalRevenueTTC * mix.takeaway;
  const deliveryTTC = totalRevenueTTC * mix.delivery;

  const { food, beverages, alcohol, dessert, other } = profile.ticketBreakdown;
  const foodPart = averageTicketTTC > 0 ? (food + dessert + other) / averageTicketTTC : 1;
  const beveragePart = averageTicketTTC > 0 ? beverages / averageTicketTTC : 0;
  const alcoholPart = averageTicketTTC > 0 ? alcohol / averageTicketTTC : 0;

  const foodRevenue = (dineInTTC * foodPart) / (1 + tax.vatFood);
  const beverageRevenue = (dineInTTC * beveragePart) / (1 + tax.vatBeverage);
  const alcoholRevenue = (dineInTTC * alcoholPart) / (1 + tax.vatAlcohol);

  // La vente à emporter et la livraison sont taxées au taux « nourriture ».
  const takeawayRevenue = takeawayTTC / (1 + tax.vatFood);
  const deliveryRevenue = deliveryTTC / (1 + tax.vatFood);

  const dineInRevenue = foodRevenue + beverageRevenue + alcoholRevenue;
  const totalRevenueHT = dineInRevenue + takeawayRevenue + deliveryRevenue;
  const averageVatRate = getAverageVatRate(profile, tax);

  return {
    foodRevenue,
    beverageRevenue,
    alcoholRevenue,
    dineInRevenue,
    takeawayRevenue,
    deliveryRevenue,
    totalRevenueTTC,
    totalRevenue: totalRevenueHT,
    totalRevenueHT,
    vatCollected: totalRevenueTTC - totalRevenueHT,
    averageVatRate,
    averageTicketTTC,
    averageTicketHT: averageTicketTTC / (1 + averageVatRate),
    ...covers,
  };
}
