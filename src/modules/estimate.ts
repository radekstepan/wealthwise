import * as d3 from 'd3';
// @ts-ignore
import * as formula from '@formulajs/formulajs';
import sample from './sample';
import mortgage from './mortgage';
import {range, sum} from './utils';

const SAMPLES = 100; // number of samples
const SALE_FEE = 0.05; // sale fees in %
const TERM = 5; // 5 year mortgage term

// A single run.
function run(opts) {
  let price = opts.price();
  const mgage = mortgage({
    principal: price * (1 - (opts.downpayment() / 100)),
    interest: opts.rates.initialInterest() / 100,
    periods: opts.years * 12
  });

  let rent = opts.rent();
  let maintenance = opts.maintenance();
  let propertyTax = opts.propertyTax();
  let insurance = opts.insurance();
  let marketRent = opts.marketRent();
  let expenses = price * (opts.downpayment() / 100);
  let portfolio = expenses;

  const data = [];
  for (const year of range(opts.years)) {
    // monthly compount market return
    const stocksReturn = formula.NOMINAL(opts.rates.stocks() / 100, 12) / 12;
    const priceAppreciation = formula.NOMINAL(opts.rates.appreciation() / 100, 12) / 12;

    // Property crash.
    if (!year) {
      price *= (1 - (opts.scenarios.crash / 100));
    }

    if (year) {
      // Renew mortgage every 5 years.
      let renew = !(year % TERM);
      // Sell every x years.
      if (!(year % opts.scenarios.sell)) {
        const fee = price * SALE_FEE; // sale fee
        expenses += fee;
        portfolio += fee;
        rent = marketRent; // have to pay market rent now

        if ((price - mgage.principal()) < 0) {
          throw new Error('Jingle mail!');
        }
        // NOTE: assumes the new property has the same price!
        renew = true;
      }
      
      if (renew) {
        mgage.renew({
          interest: opts.rates.futureInterest() / 100,
          periods: (opts.years - year) * 12
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

      portfolio += monthly; // invest the money
      portfolio *= 1 + stocksReturn; // get the return

      expenses += monthly;

      price *= 1 + priceAppreciation;
      
      data.push({
        buy: (price * (1 - SALE_FEE)) - mgage.balance() - expenses, // 5% sale fees
        rent: (portfolio - expenses) * (1 - (opts.rates.capitalGainsTax() / 100))
      });
    }

    // End of the year.
    const ratesExpenses = opts.rates.expenses();
    maintenance *= 1 + (ratesExpenses / 100);
    propertyTax *= 1 + (ratesExpenses / 100);
    insurance *= 1 + (ratesExpenses / 100);
    rent *= 1 + (opts.rates.rent() / 100);
    marketRent *= 1 + (opts.rates.marketRent() / 100);
  }

  return data;
}

// Multiple runs/samples.
export default function estimate(inputs) {
  const opts = sample(inputs);
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
