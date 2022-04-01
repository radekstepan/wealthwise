import {Random} from 'random-js';
import mortgage from './mortgage';
import {range, sum} from './utils';
import * as formula from './formula';

// A single run.
export default function run(opts) {
  const rnd = new Random();

  const years = opts.mortgage.amortization();
  const term = opts.mortgage.term();
  const saleFee = opts.rates.house.saleFee();

  let price = opts.house.price();

  const mgage = mortgage({
    principal: price * (1 - (opts.house.downpayment())),
    interest: opts.rates.interest.initial(),
    periods: years * 12
  });

  let rent = opts.rent.current();
  let marketRent = opts.rent.market();
  let costs = price * opts.house.downpayment();
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
    const stocksReturn = formula.apyToAprMonthly(opts.rates.stocks.return());
    const priceAppreciation = formula.apyToAprMonthly(opts.rates.house.appreciation());

    // Property crash?
    if (rnd.bool(opts.scenarios.crash.chance())) {
      price *= (1 - opts.scenarios.crash.drop());
    }

    if (year) {
      // Renew mortgage every 5 years.
      let renew = !(year % term);
      // Sell every x years.
      if (!(year % opts.scenarios.move())) {
        costs += price * saleFee;
        portfolio += price * saleFee;
        rent = marketRent; // have to pay market rent now
        // NOTE: assumes the new property has the same price!
        renew = true;
      }
      
      if (renew) {
        mgage.renew({
          interest: opts.rates.interest.future(),
          periods: (years - year) * 12
        });
      }
    }

    for (const month of range(12)) {
      mgage.pay();

      const monthly = expenses + mgage.payment;

      costs += monthly - rent;
      portfolio += monthly - rent; // invest the money
      portfolio *= 1 + stocksReturn; // get the return
      price *= 1 + priceAppreciation;

      data.push({
        buy: (price * (1 - saleFee)) - mgage.balance - costs, // 5% sale fees
        rent: (portfolio - costs) * (1 - opts.rates.stocks.capitalGainsTax()),
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
