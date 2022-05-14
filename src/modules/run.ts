import {Random} from 'random-js';
import parse from './parse';
import mortgage from './mortgage';
import * as formula from './formula';
import {buyWorth, closingAndTax, month0Costs, rentWorth, saleFees} from './run.helpers';
import {range, sum, isEvery} from './utils';

const SAMPLES = 100; // number of samples

// A single run.
function run(opts) {
  const rnd = new Random();

  const years = opts.mortgage.amortization();
  const term = opts.mortgage.term();

  let price = opts.house.price();
  const downpayment = Math.min(opts.house.downpayment(), 1);

  const isFixedRate = Boolean(opts.rates.interest.isFixedRate());
  let currentInterestRate = opts.rates.interest.initial();
  const mgage = mortgage({
    balance: price * (1 - downpayment),
    interest: currentInterestRate,
    periods: years * 12
  });

  let rent = opts.rent.current();
  let marketRent = opts.rent.market();
  let costs = month0Costs(price, downpayment);
  let portfolio = costs; // our initial investment

  // monthly house expenses
  let expenses = sum(
    opts.house.maintenance(),
    opts.house.propertyTax() / 12, // yearly
    opts.house.insurance()
  );

  let income = opts.income.current() / 12;

  const data = [];
  for (const year of range(years)) {
    // yearly to monthly return
    const bondsReturn = formula.apyToAprMonthly(opts.rates.bonds.return());
    const priceAppreciation = formula.apyToAprMonthly(opts.rates.house.appreciation());

    // Property crash?
    if (rnd.bool(Math.min(opts.scenarios.crash.chance(), 1))) {
      price *= (1 - Math.min(opts.scenarios.crash.drop(), 1));
    }

    let renew = false;
    if (year) {
      // Renew mortgage every 5 years if on fixed.
      renew = isFixedRate && isEvery(year, term);
      // Sell every x years.
      if (isEvery(year, Math.max(opts.scenarios.move(), 1))) {
        const moveCosts = saleFees(price) + closingAndTax(price);
        costs += moveCosts;
        portfolio += moveCosts;
        rent = marketRent; // have to pay market rent now
        // NOTE: assumes the new property has the same price!
        renew = true;
      }
      
      if (renew) {
        mgage.renew(currentInterestRate);
      }
    }

    for (const month of range(12)) {
      // Start of the month.
      if (year) {
        // Change the latest interest rate every 3 months (4 hikes in a year).
        // TODO variable should be within 1% of the previous value.
        if (isEvery(month, 3)) {
          currentInterestRate = opts.rates.interest.future();
          // We immediately renew on a variable rate.
          if (!isFixedRate) {
            mgage.renew(currentInterestRate);
          }
        }
      }

      mgage.pay();

      const monthly = expenses + mgage.payment;
      costs += monthly - rent;
      portfolio += monthly - rent; // invest the money

      // End of the month.
      portfolio *= 1 + bondsReturn; // get the return
      price *= 1 + priceAppreciation;

      // Log it.
      data.push({
        buy: buyWorth(price, month, renew, mgage.balance, costs),
        rent: rentWorth(portfolio, costs, opts.rates.bonds.capitalGainsTax()),
        afford: monthly / income
      });
    }

    // End of the year increases.
    expenses *= 1 + opts.rates.house.expenses();
    rent *= 1 + opts.rates.rent.controlled();
    marketRent *= 1 + opts.rates.rent.market();
    income *= 1 + opts.income.raises();
  }

  return data;
}

// TODO keep emitting data as they come through
self.onmessage = ({data: {inputs}}) => {
  const opts = parse(inputs);
  const res = range(SAMPLES).map(() => run(opts));

  self.postMessage({res});
};
