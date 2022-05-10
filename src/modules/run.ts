import {Random} from 'random-js';
import parse from './parse';
import mortgage from './mortgage';
import {range, sum} from './utils';
import * as formula from './formula';

const SAMPLES = 100; // number of samples

// A single run.
function run(opts) {
  const rnd = new Random();

  const years = opts.mortgage.amortization();
  const term = opts.mortgage.term();
  const saleFee = opts.rates.house.saleFee();

  let price = opts.house.price();

  const isFixedRate = Boolean(opts.rates.interest.isFixedRate());
  let currentInterestRate = opts.rates.interest.initial();
  const mgage = mortgage({
    principal: price * (1 - (opts.house.downpayment())),
    interest: currentInterestRate,
    periods: years * 12
  });

  let rent = opts.rent.current();
  let marketRent = opts.rent.market();
  let costs = sum(
    price * opts.house.downpayment(),
    // closing costs
    2000,
    // property transfer tax
    Math.min(price, 200000) * 0.01, // 1% of first $200k
    Math.min(price - 200000, 2000000) * 0.02 // 2% on the next amount up to $2m
  );
  let portfolio = costs;

  // monthly house expenses
  let expenses = sum(
    opts.house.maintenance(),
    opts.house.propertyTax(),
    opts.house.insurance()
  );

  let income = opts.income.current() / 12;

  const data = [];
  for (const year of range(years)) {
    // yearly to monthly return
    const bondsReturn = formula.apyToAprMonthly(opts.rates.bonds.return());
    const priceAppreciation = formula.apyToAprMonthly(opts.rates.house.appreciation());

    // Property crash?
    if (rnd.bool(opts.scenarios.crash.chance())) {
      price *= (1 - opts.scenarios.crash.drop());
    }

    if (year) {
      // Renew mortgage every 5 years if on fixed.
      let renew = isFixedRate && !(year % term);
      // Sell every x years.
      if (!(year % opts.scenarios.move())) {
        costs += price * saleFee;
        portfolio += price * saleFee;
        rent = marketRent; // have to pay market rent now
        // NOTE: assumes the new property has the same price!
        renew = true;
      }
      
      if (renew) {
        mgage.renew(currentInterestRate);
      }
    }

    for (const month of range(12)) {
      mgage.pay();

      const monthly = expenses + mgage.payment;

      costs += monthly - rent;
      portfolio += monthly - rent; // invest the money
      portfolio *= 1 + bondsReturn; // get the return
      price *= 1 + priceAppreciation;

      data.push({
        buy: (price * (1 - saleFee)) - mgage.balance - costs, // 5% sale fees
        rent: (portfolio - costs) * (1 - opts.rates.bonds.capitalGainsTax()),
        afford: monthly / income
      });

      // Change the latest interest rate every 3 months (4 hikes in a year).
      if ((month + 1) % 3 === 0) {
        currentInterestRate = opts.rates.interest.future();
        if (!isFixedRate) {
          // TODO
          // On variable, the new rate has to be within 1% of the previous value.
          // currentInterestRate = within(
          //   opts.rates.interest.future,
          //   currentInterestRate - 0.01,
          //   currentInterestRate + 0.01
          // );
          // And we immediately renew.
          mgage.renew(currentInterestRate);
        }
      }
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
