import {Random} from 'random-js';
import mortgage from './mortgage';
import {range, sum} from './utils';
import * as formula from './formula';

const SALE_FEE = 0.05; // sale fees in %
const TERM = 5; // 5 year mortgage term

// A single run.
export default function run(opts) {
  const rnd = new Random();

  const years = opts.mortgage.years();
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
      let renew = !(year % TERM);
      // Sell every x years.
      if (!(year % opts.scenarios.move())) {
        costs += price * SALE_FEE;
        portfolio += price * SALE_FEE;
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

      const net = sum(
        expenses,
        mgage.payment,
        -rent
      );

      costs += net;
      portfolio += net; // invest the money
      portfolio *= 1 + stocksReturn; // get the return
      price *= 1 + priceAppreciation;

      data.push([
        (price * (1 - SALE_FEE)) - mgage.balance - costs, // 5% sale fees
        (portfolio - costs) * (1 - opts.rates.stocks.capitalGainsTax())
      ]);
    }

    // End of the year increases.
    expenses *= 1 + opts.rates.house.expenses();
    rent *= 1 + opts.rates.rent.controlled();
    marketRent *= 1 + opts.rates.rent.market();
  }

  return data;
}
