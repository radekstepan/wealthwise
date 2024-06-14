import { Random } from "random-js";
import { isEvery, range, sum } from "./utils";
import Mortgage from "./mortgage";
import { closingAndTax, cmhc, saleFees } from "./run.helpers";
import * as formula from './formula';
import parse from './inputs/parse';

const SAMPLES = 1000; // number of samples

type NumFn = () => number;

interface Opts {
  mortgage: {
    amortization: NumFn;
  },
  house: {
    price: NumFn;
    downpayment: NumFn;
    maintenance: NumFn;
    propertyTax: NumFn;
    insurance: NumFn;
  },
  rates: {
    interest: {
      initial: NumFn;
      future: NumFn;
    },
    house: {
      appreciation: NumFn;
      expenses: NumFn;
    },
    bonds: {
      return: NumFn;
    },
    rent: {
      controlled: NumFn;
      market: NumFn;
    },
  },
  rent: {
    current: NumFn;
    market: NumFn;
  },
  scenarios: {
    move: NumFn;
    crash: {
      chance: NumFn;
      drop: NumFn;
    }
  }
}

interface Asset {
  costs: number,
  value: number,
}

interface User {
  portfolio: Asset,
  house: Asset, // value = house value - mortgage balance - sale fees - closing and tax
}

// 25 years of data.
export type Data = Array<{
  year: number,
  buyer: User,
  renter: User,
  rent: number,
}>;

// A single random simulation run.
function run(opts: Opts, emitMeta: boolean): Data {
  const rnd = new Random();

  const amortization = opts.mortgage.amortization();
  // Make sure the downpayment is between 0 and 1.
  const downpayment = Math.min(Math.max(opts.house.downpayment(), 0), 1);
  
  let currentHousePrice = opts.house.price();
  let currentInterestRate = opts.rates.interest.initial();

  const mgage = Mortgage({
    balance: currentHousePrice * (1 - downpayment),
    rate: currentInterestRate,
    periods: amortization * 12
  });

  let rent = opts.rent.current();
  let marketRent = opts.rent.market();

  // Initial costs of the buyer.
  const month0Costs = [
    currentHousePrice * downpayment, // downpayment
    closingAndTax(currentHousePrice), // closing and tax
    cmhc(downpayment, currentHousePrice) // cmhc insurance
  ];
  // Total initial costs.
  let costs = sum(...month0Costs);

  // Expenses of the buyer.
  let monthlyExpenses = sum(
    opts.house.maintenance(),
    opts.house.propertyTax() / 12, // yearly to monthly
    opts.house.insurance()
  );

  const buyer: User = {
    portfolio: { costs: 0, value: 0 },
    house: {
      costs,
      value: currentHousePrice * downpayment
    }
  };
  const renter: User = {
    portfolio: { costs, value: costs },
    house: { costs: 0, value: 0 } // renter does not own a house, but pays rent (= costs)
  };

  if (emitMeta) {
    self.postMessage({
      action: 'meta',
      meta: {
        downpayment: month0Costs[0], // in $
        closingAndTax: month0Costs[1], // in $
        cmhc: month0Costs[2], // in $
        expenses: monthlyExpenses, // in $, maintenance, property tax, insurance
        payment: mgage.payment // in $, monthly payment
      }
    });
  }

  // Data for each year.
  const data: Data = [];

  for (const year of range(amortization)) {
    const housePriceAppreciation = formula.apyToAprMonthly(opts.rates.house.appreciation());
    const bondsReturn = formula.apyToAprMonthly(opts.rates.bonds.return());
    const moveEvery = opts.scenarios.move();

    // Property crash?
    if (rnd.bool(Math.min(opts.scenarios.crash.chance(), 1))) {
      currentHousePrice *= (1 - Math.min(opts.scenarios.crash.drop(), 1));
    }

    for (const month of range(12)) {
      if (isEvery(month, 3)) {
        currentInterestRate = opts.rates.interest.future();
      }

      // Pay mortgage (handles empty balance).
      mgage.pay();

      buyer.house.costs += monthlyExpenses + mgage.payment; // buyer monthly costs (imputed rent)
      renter.house.costs += rent; // renter monthly costs
      const diff = monthlyExpenses + mgage.payment - rent;
      // Buyer expenses are greater than rent, invest as a renter.
      if (diff > 0) {
        renter.portfolio.costs += diff;
        renter.portfolio.value += diff;
      } else {
        // Buyer expenses are less than rent, invest as a buyer.
        buyer.portfolio.costs += -diff;
        buyer.portfolio.value += -diff;
      }

      // End of the month, appreciate the house.
      currentHousePrice *= 1 + housePriceAppreciation;
      buyer.house.value = sum(
        currentHousePrice,
        -mgage.balance, // balance owing
      );

      // Monthly portfolio appreciation.
      buyer.portfolio.value *= 1 + bondsReturn;
      renter.portfolio.value *= 1 + bondsReturn;
    } // end of month

    let renew = false;
    // Renew the fixed rate mortgage every 5 years.
    if (mgage.balance > 0 && isEvery(year, 5)) {
      renew = true;
    }
    // Moving scenario.
    if (moveEvery > 0 && isEvery(year, moveEvery)) {
      renew = true;
      // NOTE: will double count these expenses since property price is less these costs.
      const movingCosts = sum(
        saleFees(currentHousePrice),
        closingAndTax(currentHousePrice)
      );
      // Add the moving costs to the renter's portfolio.
      buyer.house.costs += movingCosts;
      renter.portfolio.costs += movingCosts;
      renter.portfolio.value += movingCosts;
      // Buyer now pays market rent.
      rent = marketRent;
    }

    if (renew) {
      mgage.renew(currentInterestRate);
    }

    // Update the yearly variables.
    monthlyExpenses *= 1 + opts.rates.house.expenses();
    rent *= 1 + opts.rates.rent.controlled();
    marketRent *= 1 + opts.rates.rent.market();

    // TODO sanity check.
    if (buyer.house.costs < 0) {
      throw new Error('Costs are negative?');
    }
    if (buyer.portfolio.costs < 0) {
      throw new Error('Costs are negative?');
    }
    if (renter.portfolio.costs < 0) {
      throw new Error('Costs are negative?');
    }

    // Log it.
    data.push({
      year,
      rent,
      // Object, make sure to copy the values.
      buyer: {
        portfolio: {
          costs: buyer.portfolio.costs,
          value: buyer.portfolio.value
        },
        house: {
          costs: buyer.house.costs,
          value: sum(
            buyer.house.value,
            // Pay seller costs (do not double count if moving).
            renew ? 0 : -saleFees(currentHousePrice),
            renew ? 0 : -closingAndTax(currentHousePrice)
          )
        }
      },
      renter: {
        portfolio: {
          costs: renter.portfolio.costs,
          value: renter.portfolio.value
        },
        house: {
          costs: renter.house.costs,
          value: 0
        }
      },
    });
  }

  return data;
}

self.onmessage = ({data: {inputs}}) => {
  const opts = parse(inputs);
  const res = range(SAMPLES).map((i) => run(opts, !i));

  self.postMessage({action: 'res', res});
};
