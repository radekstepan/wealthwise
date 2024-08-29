import { Random } from "random-js";
import { isEvery, range, sum } from "./utils";
import Mortgage from "./mortgage";
import * as helpers from "./run.helpers";
import * as formula from './formula';
import parse, { type ParsedInputs } from './inputs/parse';
import { type TypedInputs } from "./inputs/inputs";
import { type MetaState } from "../atoms/metaAtom";
import { logYear } from "./run/logYear";
import { initUsers } from "./run/initUsers";
import { type Data } from "./run/interfaces";
import { simCrash } from "./run/simCrash";
import { simMonth } from "./run/simMonth";
import { simPaydown } from "./run/simPaydown";
import { simMove } from "./run/simMove";

const SAMPLES = 1000; // number of samples

// A single random simulation run.
function run(opts: ParsedInputs<TypedInputs>, emitMeta: boolean): Data {
  const rnd = new Random();

  const province = opts.province();

  const amortization = opts.mortgage.amortization();
  const term = opts.mortgage.term();
  const isFixedRate = opts.mortgage.isFixedRate();
  // Make sure the downpayment is between 0 and 1.
  const downpayment = Math.min(Math.max(opts.house.downpayment(), 0), 1);
  const capitalGainsTaxRate = opts.rates.bonds.capitalGainsTax();

  let currentHousePrice = opts.house.price();
  let currentInterestRate = opts.rates.interest.initial();
  let newHousePrice = currentHousePrice; // how much a new home costs

  // Closing costs and land transfer tax.
  const closingAndTax = sum(
    opts.house.closingCosts(), // fees
    helpers.landTransferTax(province, currentHousePrice, true) // land transfer tax
  );

  const anniversaryPaydownRate = opts.scenarios.mortgage.anniversaryPaydown();
  const originalBalance = currentHousePrice * (1 - downpayment);

  const mgage = Mortgage({
    balance: originalBalance,
    rate: currentInterestRate,
    periods: amortization * 12
  });

  let rent = opts.rent.current();
  let marketRent = opts.rent.market();

  const downpaymentAmount = currentHousePrice - originalBalance;
  const cmhc = helpers.cmhc(downpayment, currentHousePrice); // cmhc insurance

  // Expenses of the buyer.
  let monthlyExpenses = sum(
    opts.house.maintenance(),
    opts.house.propertyTax() / 12, // yearly to monthly
    opts.house.insurance()
  );

  const {buyer, renter} = initUsers({
    downpaymentAmount,
    closingAndTax,
    cmhc,
    province,
    capitalGainsTaxRate,
    currentHousePrice,
    mgage
  });

  if (emitMeta) {
    const meta: MetaState = {
      downpayment: downpaymentAmount,
      closingAndTax,
      cmhc,
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
    const moveEvery = opts.scenarios.move.tenureYears();

    // Property crash?
    const crashDrop = simCrash({random: rnd, opts});
    if (crashDrop) {
      currentHousePrice *= crashDrop;
      newHousePrice *= crashDrop;      
    }

    for (const month of range(12)) {
      const nextMonth = simMonth({
        month,
        mortgage: mgage,
        buyer,
        renter,
        monthlyExpenses,
        rent,
        housePriceAppreciation,
        bondsReturn,
        currentHousePrice,
        newHousePrice,
        currentInterestRate,
        isFixedRate,
        nextInterestRate: opts.rates.interest.future
      });
      currentHousePrice = nextMonth.nextCurrentHousePrice;
      newHousePrice = nextMonth.nextNewHousePrice;
      currentInterestRate = nextMonth.nextCurrentInterestRate;
    } // end of month

    // Apply anniversary paydown at the end of each year
    simPaydown({
      mortgage: mgage,
      anniversaryPaydownRate,
      originalBalance,
      buyer,
      renter
    });

    // Apply premium to new home price.
    newHousePrice *= 1 + opts.scenarios.move.annualMoveUpCost();

    let renew = false;
    if (isFixedRate) {
      // Renew the fixed rate mortgage every 5 years.
      if (mgage.balance > 0 && isEvery(year, term)) {
        renew = true;
      }
    }
    // Moving scenario (make sure we do not move in the last year).
    const nextMove = simMove({
      moveEvery,
      renew,
      year,
      amortization,
      mortgage: mgage,
      newHousePrice,
      currentHousePrice,
      province,
      buyer,
      renter,
      rent,
      marketRent,
      closingCosts: opts.house.closingCosts
    });

    renew = nextMove.nextRenew;
    rent = nextMove.nextRent;
    currentHousePrice = nextMove.nextCurrentHousePrice;
    const {additionalBalance} = nextMove;

    if (renew && mgage.balance > 0) {
      mgage.renew(currentInterestRate, additionalBalance);
    }

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
    data.push(logYear({
      year,
      renter,
      buyer,
      province,
      mortgage: mgage
    }));

    // Update the yearly variables.
    monthlyExpenses *= 1 + opts.rates.house.expenses();
    rent *= 1 + opts.rates.rent.controlled();
    marketRent *= 1 + opts.rates.rent.market();
  }

  if (mgage.balance) {
    throw new Error("Mortgage has not been paid off");
  }

  return data;
}

self.onmessage = ({data: {inputs}}: {
  data: {inputs: TypedInputs}
}) => {
  const opts = parse(inputs);
  const res = range(SAMPLES).map((i) => run(opts, !i));

  self.postMessage({action: 'res', res});
};
