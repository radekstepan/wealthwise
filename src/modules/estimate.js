import * as d3 from 'd3';
import * as formula from '@formulajs/formulajs';
import sample from '../modules/sample';

const range = count => Array(count).fill(true).map((_, i) => i);
const sum = (...args) => args.reduce((t, d) => t + d, 0);

// A single run.
function run(opts) {
  const downpayment = opts.downpayment();
  const years = opts.years();
  const sell = opts.scenarios.sell();

  let price = opts.price();
  let rent = opts.rent();
  let maintenance = opts.maintenance();
  let propertyTax = opts.propertyTax();
  let insurance = opts.insurance();
  let marketRent = rent;
  let expenses = price * (downpayment / 100);
  let portfolio = expenses;

  // monthly principal and interest
  const payment = formula.PMT(
    // TODO incorrect
    opts.rates.interest() / 100 / 12,
    years * 12,
    -price * (1 - (downpayment / 100))
  );

  const data = [];

  let mortgage = payment * 12 * years;
  for (const year of range(years)) {
    // monthly compount market return
    const stocksReturn = formula.NOMINAL(opts.rates.stocks() / 100, 12) / 12;
    const priceAppreciation = formula.NOMINAL(opts.rates.appreciation() / 100, 12) / 12;

    for (const month of range(12)) {
      const monthly = sum(
        maintenance,
        propertyTax,
        insurance,
        payment, // NOTE make sure not to overpay if > 25 years
        -rent
      );

      portfolio += monthly; // invest the money
      portfolio *= 1 + stocksReturn; // get the return

      expenses += monthly;
      mortgage -= payment;  // NOTE make sure not to overpay if > 25 years

      price *= 1 + priceAppreciation;
      
      data.push({
        buy: (price * 0.95) - mortgage - expenses, // 5% sale fees
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

    // Every 5 years the interest rate changes.
    if (year && !(year % 5)) {
      // TODO
    }

    // Sell at 5% fee?
    // TODO what happens to the mortgage?
    if (year && !(year % sell)) {
      expenses += price * 0.05;
      portfolio += price * 0.05;
      rent = marketRent; // have to pay market rent now
    }
  }

  return data;
}

// Multiple runs/samples.
export default function estimate(inputs) {
  const opts = sample(inputs);

  const samples = [];
  for (const i of range(100)) {
    samples.push(run(opts));
  }

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
