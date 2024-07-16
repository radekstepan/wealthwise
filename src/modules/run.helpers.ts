import { Province } from '../config';
import {sum} from './utils';

// https://www.truenorthmortgage.ca/tools/land-transfer-tax-calculator
export const landTransferTax = (province: Province, houseValue: number) => {
  switch (province) {
    case Province.Alberta:
      return Math.ceil(houseValue / 5000) * 5;
    default:
      return 0;
  }
};

// Calculate the Canada Mortgage and Housing Corporation (CMHC)
//  insurance premium on a home mortgage loan.
// https://wowa.ca/calculators/cmhc-insurance
// TODO only works on max 25 year mortgages
export const cmhc = (downpayment: number, price: number) => {
  if (downpayment >= 0.2) {
    return 0;
  }
  if (price > 1000000) {
    return 0; // not applicable
  }
  if (downpayment < 0.05) {
    return 0; // not applicable
  }
  if (downpayment < 0.1) {
    return ((1 - downpayment) * price) * 0.04;
  }
  if (downpayment < 0.15) {
    return ((1 - downpayment) * price) * 0.031;
  }
  return ((1 - downpayment) * price) * 0.028;
};

// This function calculates the cost of selling a house. The function
//  takes a single argument, price, which is the sale price of the house.
//  The function first adds $750 to the total cost for legal fees, then
//  calculates the cost of the real estate agents' commissions. The
//  commission is 3% on the first $100,000 of the sale price, and 1.5% on
//  any amount above $100,000. The commission is then multiplied by two
//  to account for two agents, and increased by 5% to account for sales tax.
// https://www.truenorthmortgage.ca/tools/land-transfer-tax-calculator
export const saleFees = (province: Province, houseValue: number) => {
  let salesTax = 1;
  if (province === Province.Alberta) {
    salesTax = 1.05;
  }

  return sum(
    750, // legal fees
    sum(
      Math.min(houseValue, 100000) * 0.03, // 3% on the first $100k
      Math.max(houseValue - 100000, 0) * 0.015 // 1.5% on the rest
    ) * 2 * salesTax // 2 agents + sales tax
  );
};
