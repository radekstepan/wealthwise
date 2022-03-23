import * as fn from '@formulajs/formulajs';

const range = count => Array(count).fill(true).map((_, i) => i);

export default function estimate(opts) {
  let {price, maintenance, taxes, insurance, rent} = opts;
  let expenses = price * (opts.downpayment / 100);
  let portfolio = expenses;

  // monthly principal and interest
  const payment = fn.PMT(
    opts.rates.interest / 100 / 12,
    opts.years * 12,
    -opts.price * (1 - (opts.downpayment / 100))
  );

  // monthly compount market return
  const market = fn.NOMINAL(opts.rates.market / 100, 12) / 12;

  const data = [];

  let mortgage = payment * 12 * opts.years;
  for (const year in range(opts.years)) {
    for (const month in range(12)) {
      let monthly = 0;

      monthly += maintenance;
      monthly += taxes;
      monthly += insurance;
      monthly += payment; // NOTE make sure not to overpay if > 25 years
      monthly -= rent;

      portfolio += monthly; // invest the money
      portfolio *= 1 + market; // get the return

      expenses += monthly;
      mortgage -= payment;  // NOTE make sure not to overpay if > 25 years
      
      data.push({
        buy: (price * 0.95) - mortgage - expenses,
        rent: portfolio - expenses
      });
    }

    maintenance *= 1 + (opts.rates.expenses / 100);
    taxes *= 1 + (opts.rates.expenses / 100);
    insurance *= 1 + (opts.rates.expenses / 100);
    rent *= 1 + (opts.rates.rent / 100);
    price *= 1 + (opts.rates.appreciation / 100);
  }

  return data;
}
