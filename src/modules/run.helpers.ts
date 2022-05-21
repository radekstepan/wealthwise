import {sum} from './utils';

export const closingAndTax = (price: number) => sum(
  // closing costs https://www.ratehub.ca/mortgage-payment-calculator
  2450,
  // land transfer tax
  Math.min(price, 200000) * 0.01,
  Math.min(Math.max(price - 200000, 0), 2000000) * 0.02,
  Math.max(price - 2000000, 0) * 0.03
);

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

// https://wowa.ca/calculators/cost-selling-house
export const saleFees = (price: number) => sum(
  750, // legal fees
  sum(
    Math.min(price, 100000) * 0.03, // 3% on the first $100k
    Math.max(price - 100000, 0) * 0.015 // 1.5% on the rest
  ) * 2 * 1.05 // 2 agents + sales tax
);

// Net worth as a buyer.
export const buyWorth = (
  price: number, // property price
  month: number, // which month are we in?
  didRenew: boolean, // did we renew this month?
  balanceRemaining: number, // on the mortgage
  costs: number // expenses incurred so far
) => sum(
  price,
  !month && didRenew ? 0 : -saleFees(price), // do not "pay" sale fees 2x
  -balanceRemaining,
  -costs // includes sale fees in the month we move
);

// Net worth as a rented.
export const rentWorth = (
  portfolio: number, // portfolio value
  costs: number, // expenses incurred so far = our investment
  capitalGainsTax: number // 0.00 - 1.00
) => (portfolio - costs) * (1 - capitalGainsTax);
