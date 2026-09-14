export type BenchmarkType = 'benchmark' | 'hypothesis';

export interface BenchmarkValue {
  value: number;
  low: number;
  high: number;
  unit: string;
  source: string;
  year: number;
  type: BenchmarkType;
  label?: string;
  url?: string;
  note?: string;
}

export type CityId =
  | 'paris'
  | 'lyon'
  | 'marseille'
  | 'bordeaux'
  | 'lille'
  | 'toulouse'
  | 'nantes'
  | 'nice'
  | 'strasbourg'
  | 'montpellier'
  | 'rennes'
  | 'medium_city'
  | 'other';

export type LocationTypeId =
  | 'premium_center'
  | 'city_center'
  | 'residential'
  | 'commercial_zone'
  | 'periphery';

export type RestaurantTypeId =
  | 'fast_food'
  | 'burger'
  | 'pizza'
  | 'traditional'
  | 'brasserie'
  | 'cafe_brunch'
  | 'asian'
  | 'premium'
  | 'dark_kitchen'
  | 'other';

export type CuisineTypeId =
  | 'french'
  | 'italian'
  | 'asian'
  | 'american'
  | 'mediterranean'
  | 'vegetarian'
  | 'mixed'
  | 'other';

export type StaffRoleId =
  | 'manager'
  | 'head_chef'
  | 'sous_chef'
  | 'cook'
  | 'commis'
  | 'chef_de_partie'
  | 'dishwasher'
  | 'waiter'
  | 'room_manager'
  | 'cashier'
  | 'polyvalent'
  | 'barista'
  | 'bartender'
  | 'delivery'
  | 'admin';

export type EmploymentType = 'full_time' | 'part_time';

export interface StaffMember {
  id: string;
  role: StaffRoleId;
  count: number;
  grossMonthlySalary: number;
  employmentType: EmploymentType;
  weeklyHours: number;
  mealsPerDay: number;
}

export interface TicketBreakdown {
  food: number;
  beverages: number;
  alcohol: number;
  dessert: number;
  other: number;
}

export interface ServicePattern {
  lunchOccupancy: number;
  dinnerOccupancy: number;
  weekendOccupancy: number;
  lunchShare: number;
  dinnerShare: number;
  weekendShare: number;
}

export interface OperatingAssumptions {
  foodCostRate: number;
  beverageCostRate: number;
  packagingCostRate: number;
  platformCommissionRate: number;
  paymentFeeRate: number;
  rentMonthly: number;
  rentChargesMonthly: number;
  utilitiesMonthly: number;
  insuranceMonthly: number;
  accountingMonthly: number;
  softwareMonthly: number;
  telecomMonthly: number;
  cleaningMonthly: number;
  maintenanceMonthly: number;
  marketingMonthly: number;
  bankingMonthly: number;
  /** CFE, taxe foncière, taxes locales et assimilées. */
  taxesAndDutiesMonthly: number;
  miscellaneousMonthly: number;
}

export interface CapexItem {
  kitchenEquipment: number;
  furniture: number;
  fitout: number;
  pos: number;
  signage: number;
  otherEquipment: number;
}

export interface CapexUsefulLife {
  kitchenEquipment: number;
  furniture: number;
  fitout: number;
  pos: number;
  signage: number;
  otherEquipment: number;
}

export interface Financing {
  equity: number;
  debt: number;
  interestRate: number;
  loanDurationYears: number;
}

export interface TaxSettings {
  vatFood: number;
  vatBeverage: number;
  vatAlcohol: number;
  corporateTaxRate: number;
  reducedCorporateTaxRate: number;
  reducedCorporateTaxThreshold: number;
}

export interface RestaurantProfile {
  name: string;
  city: CityId;
  locationType: LocationTypeId;
  restaurantType: RestaurantTypeId;
  cuisineType: CuisineTypeId;
  seatingCapacity: number;
  openingDaysPerWeek: number;
  servicesPerDay: number;
  openingWeeksPerYear: number;
  occupancyRate: number;
  surfaceSqm: number;
  takeawayShare: number;
  deliveryShare: number;
  ticketBreakdown: TicketBreakdown;
  servicePattern: ServicePattern;
}

export interface SimulationInput {
  profile: RestaurantProfile;
  operating: OperatingAssumptions;
  staff: StaffMember[];
  capex: CapexItem;
  usefulLife: CapexUsefulLife;
  financing: Financing;
  tax: TaxSettings;
}

export interface RevenueBreakdown {
  /** Montants hors taxes, sauf mention contraire. */
  foodRevenue: number;
  beverageRevenue: number;
  alcoholRevenue: number;
  dineInRevenue: number;
  takeawayRevenue: number;
  deliveryRevenue: number;
  totalRevenueTTC: number;
  /** Chiffre d'affaires HT : ligne haute du compte de résultat. */
  totalRevenue: number;
  totalRevenueHT: number;
  vatCollected: number;
  averageVatRate: number;
  averageTicketTTC: number;
  averageTicketHT: number;
  coversPerService: number;
  coversPerDay: number;
  coversPerWeek: number;
  annualCovers: number;
  openingDaysPerYear: number;
}

export interface VariableCosts {
  foodPurchases: number;
  beveragePurchases: number;
  packaging: number;
  platformCommissions: number;
  paymentFees: number;
  total: number;
}

export interface StaffCostLine {
  role: StaffRoleId;
  count: number;
  fte: number;
  grossAnnualSalary: number;
  mealBenefit: number;
  employerCostRate: number;
  employerContributions: number;
  annualEmployerCost: number;
  conventionalMinimum: number;
  belowConventionalMinimum: boolean;
  hourlyGross: number;
}

export interface LaborCosts {
  lines: StaffCostLine[];
  totalHeadcount: number;
  totalFte: number;
  totalGross: number;
  totalEmployerCost: number;
  hasSalaryBelowMinimum: boolean;
}

export interface FixedCosts {
  rent: number;
  rentCharges: number;
  utilities: number;
  insurance: number;
  accounting: number;
  software: number;
  telecom: number;
  cleaning: number;
  maintenance: number;
  marketing: number;
  banking: number;
  taxesAndDuties: number;
  miscellaneous: number;
  total: number;
}

export interface DepreciationBreakdown {
  kitchenEquipment: number;
  furniture: number;
  fitout: number;
  pos: number;
  signage: number;
  otherEquipment: number;
  total: number;
}

export interface FinancingCosts {
  annualInterest: number;
  annualPrincipalRepayment: number;
  averageOutstandingDebt: number;
  totalInterestOverLoan: number;
}

export interface PnLResult {
  revenue: RevenueBreakdown;
  variableCosts: VariableCosts;
  grossMargin: number;
  grossMarginRate: number;
  laborCosts: LaborCosts;
  fixedCosts: FixedCosts;
  ebitda: number;
  ebitdaMargin: number;
  depreciation: DepreciationBreakdown;
  operatingResult: number;
  financing: FinancingCosts;
  preTaxIncome: number;
  corporateTax: number;
  netIncome: number;
  netMargin: number;
}

export interface BreakEvenResult {
  breakEvenRevenue: number;
  breakEvenCoversAnnual: number;
  breakEvenCoversPerDay: number;
  /** Taux de remplissage requis. Peut dépasser 100 % si le modèle n'est pas atteignable. */
  breakEvenOccupancy: number;
  isAchievable: boolean;
  fixedCostBase: number;
  variableCostRate: number;
  contributionMarginRate: number;
}

export interface CashFlowResult {
  /** Récurrent : résultat net + amortissements. */
  operatingCashFlow: number;
  /** Récurrent : remboursement du principal. */
  debtService: number;
  /** Récurrent : cash disponible après service de la dette. */
  freeCashFlow: number;
  /** Démarrage : investissement initial. */
  initialInvestment: number;
  /** Démarrage : apport + emprunt. */
  initialFunding: number;
  /** Démarrage : trésorerie restante après investissement. */
  initialCashPosition: number;
}

export interface DriverImpact {
  id: string;
  label: string;
  impact: number;
  direction: 'positive' | 'negative';
}

export interface Insight {
  id: string;
  level: 'success' | 'warning' | 'danger' | 'info';
  message: string;
}

export interface ScenarioResult {
  id: 'pessimistic' | 'base' | 'optimistic';
  label: string;
  pnl: PnLResult;
  breakEven: BreakEvenResult;
  cashFlow: CashFlowResult;
}

export interface SensitivityCell {
  occupancy: number;
  ticket: number;
  netIncome: number;
}

export interface OccupancyCurvePoint {
  occupancy: number;
  netIncome: number;
  ebitda: number;
  revenue: number;
  totalCosts: number;
  coversPerDay: number;
}

/** Ratios de pilotage dérivés du P&L, calculés une seule fois par le moteur. */
export interface SimulationRatios {
  monthlyRevenue: number;
  coversPerDay: number;
  foodCostShare: number;
  variableCostShare: number;
  laborShare: number;
  rentShare: number;
  primeCost: number;
  returnOnEquity: number;
  /** Années nécessaires pour récupérer l'investissement via le cash-flow. */
  paybackYears: number;
}

export interface SimulationResult {
  pnl: PnLResult;
  breakEven: BreakEvenResult;
  cashFlow: CashFlowResult;
  ratios: SimulationRatios;
  drivers: DriverImpact[];
  insights: Insight[];
  scenarios: ScenarioResult[];
  sensitivity: SensitivityCell[];
  occupancyCurve: OccupancyCurvePoint[];
  totalCapex: number;
}
