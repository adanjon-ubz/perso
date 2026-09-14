import type { RestaurantProfile, RevenueBreakdown, SimulationInput, TaxSettings } from '@/types/models';

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

export function calculateCovers(profile: RestaurantProfile, occupancyRate = profile.occupancyRate) {
  const coversPerService = profile.seatingCapacity * occupancyRate;
  const coversPerDay = coversPerService * profile.servicesPerDay;
  const coversPerWeek = coversPerDay * profile.openingDaysPerWeek;
  const annualCovers = coversPerWeek * profile.openingWeeksPerYear;

  return {
    coversPerService,
    coversPerDay,
    coversPerWeek,
    annualCovers,
  };
}

function weightedVatRate(profile: RestaurantProfile, tax: TaxSettings): number {
  const ticket = getAverageTicketTTC(profile);
  if (ticket <= 0) return tax.vatFood;

  const foodShare = profile.ticketBreakdown.food / ticket;
  const beverageShare = profile.ticketBreakdown.beverages / ticket;
  const alcoholShare = profile.ticketBreakdown.alcohol / ticket;
  const dessertShare = profile.ticketBreakdown.dessert / ticket;
  const otherShare = profile.ticketBreakdown.other / ticket;

  return (
    foodShare * tax.vatFood +
    beverageShare * tax.vatBeverage +
    alcoholShare * tax.vatAlcohol +
    dessertShare * tax.vatFood +
    otherShare * tax.vatFood
  );
}

export function calculateRevenue(
  input: SimulationInput,
  occupancyRate = input.profile.occupancyRate,
): RevenueBreakdown {
  const { profile, tax } = input;
  const covers = calculateCovers(profile, occupancyRate);
  const averageTicketTTC = getAverageTicketTTC(profile);
  const dineInRevenueTTC = covers.annualCovers * averageTicketTTC;
  const takeawayRevenueTTC = dineInRevenueTTC * profile.takeawayShare;
  const deliveryRevenueTTC = dineInRevenueTTC * profile.deliveryShare;

  const ticket = averageTicketTTC;
  const foodRevenueTTC =
    dineInRevenueTTC *
    ((profile.ticketBreakdown.food +
      profile.ticketBreakdown.dessert +
      profile.ticketBreakdown.other) /
      ticket || 0);
  const beverageRevenueTTC =
    dineInRevenueTTC * (profile.ticketBreakdown.beverages / ticket || 0);
  const alcoholRevenueTTC =
    dineInRevenueTTC * (profile.ticketBreakdown.alcohol / ticket || 0);

  const foodRevenue = foodRevenueTTC / (1 + tax.vatFood);
  const beverageRevenue = beverageRevenueTTC / (1 + tax.vatBeverage);
  const alcoholRevenue = alcoholRevenueTTC / (1 + tax.vatAlcohol);
  const takeawayRevenue = takeawayRevenueTTC / (1 + tax.vatFood);
  const deliveryRevenue = deliveryRevenueTTC / (1 + tax.vatFood);

  const vatRate = weightedVatRate(profile, tax);
  const totalRevenueTTC =
    dineInRevenueTTC + takeawayRevenueTTC + deliveryRevenueTTC;
  const totalRevenueHT =
    foodRevenue + beverageRevenue + alcoholRevenue + takeawayRevenue + deliveryRevenue;
  const averageTicketHT = averageTicketTTC / (1 + vatRate);

  return {
    foodRevenue,
    beverageRevenue,
    alcoholRevenue,
    takeawayRevenue,
    deliveryRevenue,
    totalRevenueTTC,
    totalRevenue: totalRevenueHT,
    totalRevenueHT,
    averageTicketTTC,
    averageTicketHT,
    ...covers,
  };
}
