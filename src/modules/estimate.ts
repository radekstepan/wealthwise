import * as d3 from 'd3';
// @ts-ignore
import * as formula from '@formulajs/formulajs';
import sample from './sample';
import mortgage from './mortgage';
import {range, sum} from './utils';

// A single run.
function run(opts) {
  let price = opts.price();
  const downpayment = opts.downpayment();

  const mgage = mortgage({
    principal: price * (1 - (downpayment / 100)),
    interest: opts.rates.initialInterest() / 100,
    periods: opts.years * 12
  });

  let rent = opts.rent();
  let maintenance = opts.maintenance();
  let propertyTax = opts.propertyTax();
  let insurance = opts.insurance();
  let marketRent = rent;
  let expenses = price * (downpayment / 100);
  let portfolio = expenses;

  const data = [];
  for (const year of range(opts.years)) {
    // monthly compount market return
    const stocksReturn = formula.NOMINAL(opts.rates.stocks() / 100, 12) / 12;
    const priceAppreciation = formula.NOMINAL(opts.rates.appreciation() / 100, 12) / 12;

    // Renew mortgage every 5 years.
    if (year && !(year % 5)) {
      mgage.renew({
        interest: opts.rates.futureInterest() / 100,
        periods: (opts.years - year) * 12
      });
    }
    // Sell at 5% fee?
    // TODO what happens to the mortgage?
    // if (year && !(year % opts.scenarios.sell)) {
    //   expenses += price * 0.05;
    //   portfolio += price * 0.05;
    //   rent = marketRent; // have to pay market rent now
    // }

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
        buy: (price * 0.95) - mgage.balance() - expenses, // 5% sale fees
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
  const samples = range(100).map(() => run(opts));

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
