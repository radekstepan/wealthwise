import {sum} from './utils';

// This function calculates closing costs and land transfer tax for a given
//  property price. The closing costs are fixed at $2450, and the land
//  transfer tax is calculated based on the property price. For property
//  prices up to $200,000, the tax rate is 1%. For property prices between
//  $200,000 and $2,000,000, the tax rate is 2%. For property prices above
//  $2,000,000, the tax rate is 3%.
export const closingAndTax = (price: number) => sum(
  // closing costs https://www.ratehub.ca/mortgage-payment-calculator
  2450,
  // land transfer tax
  Math.min(price, 200000) * 0.01,
  Math.min(Math.max(price - 200000, 0), 2000000) * 0.02,
  Math.max(price - 2000000, 0) * 0.03
);

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
// https://wowa.ca/calculators/cost-selling-house
export const saleFees = (price: number) => sum(
  750, // legal fees
  sum(
    Math.min(price, 100000) * 0.03, // 3% on the first $100k
    Math.max(price - 100000, 0) * 0.015 // 1.5% on the rest
  ) * 2 * 1.05 // 2 agents + sales tax
);

// Calculates the net worth of a buyer in a property transaction. It takes
//  the property price, a boolean value indicating whether the buyer has
//  renewed the property in the current month, the remaining balance on the
//  buyer's mortgage, and the total expenses incurred so far by the buyer
//  in the transaction. The net worth is calculated by adding the property
//  price and the remaining mortgage balance, and subtracting any sale fees
//  and expenses incurred. If the buyer has renewed the property in the
//  current month, no sale fees are subtracted from the net worth calculation.
const buyWorth = (
  price: number, // property price
  didRenew: boolean, // did we renew this month?
  balanceRemaining: number, // on the mortgage
  costs: number // expenses incurred so far
) => sum(
  price,
  didRenew ? 0 : -saleFees(price), // do not "pay" sale fees 2x
  -balanceRemaining,
  -costs // includes sale fees in the month we move
);

// Net worth as a renter.
const rentWorth = (
  portfolio: number, // portfolio value
  costs: number, // expenses incurred so far = our investment
  capitalGainsTax: number // 0.00 - 1.00
) => (portfolio - costs) * (1 - capitalGainsTax);

// Use BAX interest rate expectations, then switch to a guess.
// export const Interest = (interest) => {
//   const initial = interest.initial();
  
//   const keys = Object.keys(interest.bax.expectations);
//   const rates = [initial].concat(keys.map(key => Math.max(sum(
//     initial,
//     interest.bax.expectations[key](),
//     interest.bax.spread[key]()
//   ), 0.02))); // 2% minimum

//   return () => rates.length ? rates.shift() : interest.future();
// }