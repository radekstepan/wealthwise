export enum Province {
  AB = "Alberta",
  BC = "British Columbia",
  ON = "Ontario",
  Toronto = "Ontario (Toronto)",
}

interface Asset {
  $: number, // net worth
  costs: number,
  value: number,
  capitalGainsTaxRate: number, // 0...1
}

export interface House extends Asset {
  rentPaid: number,
  equity: number, // value minus principal balance remaining
  capitalGainsTaxRate: 0, // 0 = owner occupied
  interestPaid: number,
  principalPaid: number,
  principalRemaining: number,
  monthlyExpensesPaid: number,
  movingCostsPaid: number,
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
