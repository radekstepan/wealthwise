import * as d3 from 'd3';
// @ts-ignore
import * as formula from '@formulajs/formulajs';
import Chance from 'chance';
import parse from './parse';
import mortgage from './mortgage';
import {range, sum} from './utils';

const SAMPLES = 100; // number of samples
const SALE_FEE = 0.05; // sale fees in %
const TERM = 5; // 5 year mortgage term

// A single run.
function run(opts) {
  const chance = new Chance();
  const years = opts.mortgage.years();
  let price = opts.house.price();

  const mgage = mortgage({
    principal: price * (1 - (opts.house.downpayment())),
    interest: opts.rates.interest.initial(),
    periods: years * 12
  });

  let rent = opts.rent.current();
  let marketRent = opts.rent.market();
  let maintenance = opts.house.maintenance();
  let propertyTax = opts.house.propertyTax();
  let insurance = opts.house.insurance();
  let expenses = price * opts.house.downpayment();
  let portfolio = expenses;

  const data = [];
  for (const year of range(years)) {
    // monthly compount market return
    const stocksReturn = formula.NOMINAL(opts.rates.stocks.return(), 12) / 12;
    const priceAppreciation = formula.NOMINAL(opts.rates.house.appreciation(), 12) / 12;

    // Property crash?
    if (chance.floating({min: 0, max: 1, fixed: 2}) < opts.scenarios.crash.chance()) {
      price *= (1 - opts.scenarios.crash.drop());
    }

    if (year) {
      // Renew mortgage every 5 years.
      let renew = !(year % TERM);
      // Sell every x years.
      if (!(year % opts.scenarios.move())) {
        const fee = price * SALE_FEE; // sale fee
        expenses += fee;
        portfolio += fee;
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

      const monthly = sum(
        maintenance,
        propertyTax,
        insurance,
        mgage.payment(),
        -rent
      );

      expenses += monthly;
      portfolio += monthly; // invest the money
      portfolio *= 1 + stocksReturn; // get the return
      price *= 1 + priceAppreciation;

      data.push({
        buy: (price * (1 - SALE_FEE)) - mgage.balance() - expenses, // 5% sale fees
        rent: (portfolio - expenses) * (1 - opts.rates.stocks.capitalGainsTax())
      });
    }

    // End of the year.
    const ratesExpenses = opts.rates.house.expenses();
    maintenance *= 1 + ratesExpenses;
    propertyTax *= 1 + ratesExpenses;
    insurance *= 1 + ratesExpenses;
    rent *= 1 + opts.rates.rent.controlled();
    marketRent *= 1 + opts.rates.rent.market();
  }

  return data;
}

// Multiple runs/samples.
export default function estimate(inputs) {
  const opts = parse(inputs);
  const samples = range(SAMPLES).map(() => run(opts));

  const data = [];
  // 0..300 months
  for (const i of range(samples[0].length)) {
    let buy = [], rent = [];
    for (const s of samples) {
      buy.push(s[i].buy);
      rent.push(s[i].rent);
    }
    data.push([buy.sort(d3.ascending), rent.sort(d3.ascending)]);
  }

  return [0.05, 0.5, 0.95].map(
    q => data.map(([buy, rent]) => ({
      buy: Math.round(d3.quantile(buy, q)),
      rent: Math.round(d3.quantile(rent, q))
    }))
  );
}
