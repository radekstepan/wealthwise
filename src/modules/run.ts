import { Random } from "random-js";
import { isEvery, range, sum } from "./utils";
import Mortgage from "./mortgage";
import { closingAndTax, cmhc, saleFees } from "./run.helpers";
import * as formula from './formula';
import parse from './inputs/parse';
import { type MetaState } from "../atoms/metaAtom";
import { type Sample } from "./samplers";

const SAMPLES = 1000; // number of samples

// TODO this should be inferred from the inputs.
interface Opts {
  mortgage: {
    amortization: Sample;
    term: Sample;
    isFixedRate: Sample;
  },
  house: {
    price: Sample;
    downpayment: Sample;
    maintenance: Sample;
    propertyTax: Sample;
    insurance: Sample;
  },
  rates: {
    interest: {
      initial: Sample;
      future: Sample;
    },
    house: {
      appreciation: Sample;
      expenses: Sample;
    },
    bonds: {
      return: Sample;
      capitalGainsTax: Sample;
    },
    rent: {
      controlled: Sample;
      market: Sample;
    },
  },
  rent: {
    current: Sample;
    market: Sample;
  },
  scenarios: {
    move: Sample;
    crash: {
      chance: Sample;
      drop: Sample;
    }
  }
}

interface Asset {
  costs: number,
  value: number,
  capitalGainsTaxRate: number, // 0...1
}

interface House extends Asset {
  capitalGainsTaxRate: 0, // 0 = owner occupied
}

interface User {
  portfolio: Asset,
  rentPaid: number, 
}

export interface Renter extends User {};
export interface Buyer extends User {
  house: House,
};

// 25 years of data.
export type Data = Array<{
  year: number,
  buyer: Buyer,
  renter: Renter,
}>;

// A single random simulation run.
function run(opts: Opts, emitMeta: boolean): Data {
  const rnd = new Random();

  const amortization = opts.mortgage.amortization();
  const term = opts.mortgage.term();
  const isFixedRate = Boolean(opts.mortgage.isFixedRate());
  // Make sure the downpayment is between 0 and 1.
  const downpayment = Math.min(Math.max(opts.house.downpayment(), 0), 1);

  const capitalGainsTaxRate = opts.rates.bonds.capitalGainsTax();

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

  const buyer: Buyer = {
    portfolio: { costs: 0, value: 0, capitalGainsTaxRate },
    house: {
      costs,
      value: currentHousePrice * downpayment,
      capitalGainsTaxRate: 0
    },
    rentPaid: 0
  };
  const renter: Renter = {
    portfolio: {
      costs,
      value: costs,
      capitalGainsTaxRate
    },
    rentPaid: 0
  };

  if (emitMeta) {
    const meta: MetaState = {
      downpayment: month0Costs[0],
      closingAndTax: month0Costs[1],
      cmhc: month0Costs[2],
      expenses: monthlyExpenses,
      payment: mgage.payment
    };

    self.postMessage({
      action: 'meta',
      meta
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
      // Pay mortgage (handles empty balance).
      mgage.pay();

      // Pay rent.
      buyer.rentPaid += rent;
      renter.rentPaid += rent;

      const diff = monthlyExpenses + mgage.payment - rent;
      // Buyer expenses are greater than rent, invest as a renter.
      if (diff > 0) {
        buyer.house.costs += diff;
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

      // Interest rate change.
      if (isEvery(month, 3)) {
        currentInterestRate = opts.rates.interest.future();

        // Renew variable rate mortgage all the time.
        if (!isFixedRate && mgage.balance > 0) {
          mgage.renew(currentInterestRate);
        }
      }
    } // end of month

    let renew = false;
    if (isFixedRate) {
      // Renew the fixed rate mortgage every 5 years.
      if (mgage.balance > 0 && isEvery(year, term)) {
        renew = true;
      }
    }
    // Moving scenario (make sure we do not move in the last year).
    if (moveEvery > 0 && isEvery(year, moveEvery) && year !== amortization) {
      renew = true;
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
      // Object, make sure to copy the values.
      buyer: {
        rentPaid: buyer.rentPaid,
        portfolio: {
          costs: buyer.portfolio.costs,
          value: buyer.portfolio.value,
          capitalGainsTaxRate
        },
        house: {
          costs: buyer.house.costs,
          value: buyer.house.value,
          capitalGainsTaxRate: 0
        }
      },
      renter: {
        rentPaid: renter.rentPaid,
        portfolio: {
          costs: renter.portfolio.costs,
          value: renter.portfolio.value,
          capitalGainsTaxRate
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
