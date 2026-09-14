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
  foodRevenue: number;
  beverageRevenue: number;
  alcoholRevenue: number;
  takeawayRevenue: number;
  deliveryRevenue: number;
  totalRevenueTTC: number;
  totalRevenue: number;
  totalRevenueHT: number;
  averageTicketTTC: number;
  averageTicketHT: number;
  coversPerService: number;
  coversPerDay: number;
  coversPerWeek: number;
  annualCovers: number;
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
  grossAnnualSalary: number;
  employerCostRate: number;
  annualEmployerCost: number;
}

export interface LaborCosts {
  lines: StaffCostLine[];
  totalGross: number;
  totalEmployerCost: number;
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
  remainingDebt: number;
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
  breakEvenOccupancy: number;
  variableCostRate: number;
  contributionMarginRate: number;
}

export interface CashFlowResult {
  operatingCashFlow: number;
  investingCashFlow: number;
  financingCashFlow: number;
  netCashFlow: number;
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

export interface SimulationResult {
  pnl: PnLResult;
  breakEven: BreakEvenResult;
  cashFlow: CashFlowResult;
  drivers: DriverImpact[];
  insights: Insight[];
  scenarios: ScenarioResult[];
  sensitivity: SensitivityCell[];
  occupancyCurve: Array<{
    occupancy: number;
    netIncome: number;
    ebitda: number;
    revenue: number;
    coversPerDay: number;
  }>;
  totalCapex: number;
  returnOnEquity: number;
}
