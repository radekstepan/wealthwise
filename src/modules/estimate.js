import * as fn from '@formulajs/formulajs';

const range = count => Array(count).fill(true).map((_, i) => i);

export default function estimate(opts) {
  let expenses = opts.price * opts.downpayment;
  let portfolio = expenses;

  const payment = fn.PMT( // principal and interest
    opts.rates.interest / 12,
    opts.years * 12,
    -opts.price * (1 - opts.downpayment)
  );

  // monthly compount market return
  const market = fn.NOMINAL(opts.rates.market, 12) / 12;

  const data = [];

  let mortgage = payment * 12 * opts.years;
  for (const year in range(opts.years)) {
    for (const month in range(12)) {
      let monthly = 0;

      monthly += opts.maintenance;
      monthly += opts.taxes;
      monthly += opts.insurance;
      monthly += payment; // NOTE make sure not to overpay if > 25 years
      monthly -= opts.rent;

      portfolio += monthly; // invest the money
      portfolio *= 1 + market; // get the return

      expenses += monthly;
      mortgage -= payment;  // NOTE make sure not to overpay if > 25 years
      
      data.push({
        buy: (opts.price * 0.95) - mortgage - expenses,
        rent: portfolio - expenses
      });
    }

    opts.maintenance *= 1 + opts.rates.expenses;
    opts.taxes *= 1 + opts.rates.expenses;
    opts.insurance *= 1 + opts.rates.expenses;
    opts.rent *= 1 + opts.rates.rent;
    opts.price *= 1 + opts.rates.appreciation;
  }

  return data;
}
