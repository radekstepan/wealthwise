export enum Province {
  AB = "Alberta",
  BC = "British Columbia",
  ON = "Ontario",
  Toronto = "Ontario (Toronto)",
  NoLTT = "No Land Transfer Tax",
}

interface Asset {
  $: number, // net worth
  costs: number,
  value: number,
  capitalGainsTaxRate: number, // 0...1
}

export type CarryingCostCategory =
  | 'interest'
  | 'property_tax'
  | 'insurance'
  | 'maintenance'
  | 'hoa'
  | 'other';

export interface MonthlyCarryingCostComponent {
  category: CarryingCostCategory,
  amount: number,
}

export interface MonthlyCarryingCost {
  absoluteMonth: number,
  year: number,
  month: number,
  gross: number,
  net: number,
  rent: number,
  rentalIncome: number,
  principal: number,
  appreciation: number,
  equityDelta: number,
  opportunityCost: number,
  components: Array<MonthlyCarryingCostComponent>,
}

export interface CarryingCostSeriesPoint {
  absoluteMonth: number,
  year: number,
  month: number,
  gross: number,
  net: number,
  rent: number,
  rentalIncome: number,
  opportunityCost: number,
  equityDelta: number,
  principal: number,
  appreciation: number,
  components: Record<CarryingCostCategory, number>,
}

export type CarryingCostSeries = Array<CarryingCostSeriesPoint>;

export interface MonthlyExpenseBreakdown {
  maintenance: number,
  propertyTax: number,
  insurance: number,
  hoa: number,
  other: number,
}

export interface House extends Asset {
  rentPaid: number,
  rentalIncomeReceived: number,
  equity: number, // value minus principal balance remaining
  capitalGainsTaxRate: 0, // 0 = owner occupied
  interestPaid: number,
  principalPaid: number,
  principalRemaining: number,
  monthlyExpensesPaid: number,
  movingCostsPaid: number,
  carryingCosts?: Array<MonthlyCarryingCost>,
}

export type RentalHouse = Pick<House, '$'|'rentPaid'>;

interface User<THouse extends House|RentalHouse> {
  $: number, // net worth
  roi: number, // return on investment
  province: Province,
  portfolio: Asset,
  house: THouse,
}

export type Buyer = User<House>;
export type Renter = User<RentalHouse>;

// 25 years of data.
export type Data = Array<{
  year: number,
  buyer: Buyer,
  renter: Renter,
}>;
