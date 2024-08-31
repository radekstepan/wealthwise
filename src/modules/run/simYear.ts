import { Random } from "random-js";
import * as formula from '../formula';
import { initSim } from "./initSim";
import { isEvery, range } from "../utils";
import { simPaydown } from "./simPaydown";
import { simMonth } from "./simMonth";
import { simCrash } from "./simCrash";
import { type TypedInputs } from "../inputs/inputs";
import { type ParsedInputs } from "../inputs/parse";
import { simMove } from "./simMove";
import { logYear } from "./logYear";

export function simYear(year: number, init: ReturnType<typeof initSim>, opts: ParsedInputs<TypedInputs>, random: Random) {
  let {
    currentHousePrice, newHousePrice, currentInterestRate,
    monthlyExpenses, rent, marketRent
  } = init;

  const {
    originalBalance, province, mortgage, buyer, renter
  } = init;

  const housePriceAppreciation = formula.apyToAprMonthly(opts.rates.house.appreciation());
  const bondsReturn = formula.apyToAprMonthly(opts.rates.bonds.return());
  const moveEvery = opts.scenarios.move.tenureYears();
  const anniversaryPaydownRate = opts.scenarios.mortgage.anniversaryPaydown();

  // Property crash?
  const crashDrop = simCrash({random, opts});
  if (crashDrop) {
    currentHousePrice *= crashDrop;
    newHousePrice *= crashDrop;      
  }

  // Simulate each month of the year.
  for (const month of range(12)) {
    const nextMonth = simMonth({
      month,
      mortgage,
      buyer,
      renter,
      monthlyExpenses,
      rent,
      housePriceAppreciation,
      bondsReturn,
      currentHousePrice,
      newHousePrice,
      currentInterestRate,
      isFixedRate: init.isFixedRate,
      nextInterestRate: opts.rates.interest.future
    });
    currentHousePrice = nextMonth.nextCurrentHousePrice;
    newHousePrice = nextMonth.nextNewHousePrice;
    currentInterestRate = nextMonth.nextCurrentInterestRate;
  }

  // Apply anniversary paydown at the end of each year.
  simPaydown({
    mortgage,
    anniversaryPaydownRate,
    originalBalance,
    buyer,
    renter
  });

  // Apply premium to new home price.
  newHousePrice *= 1 + opts.scenarios.move.annualMoveUpCost();

  // Check for mortgage renewal.
  let renew = false;
  if (init.isFixedRate) {
    // Renew the fixed rate mortgage every 5 years.
    if (mortgage.balance > 0 && isEvery(year, init.term)) {
      renew = true;
    }
  }

  // Moving scenario (make sure we do not move in the last year).
  const nextMove = simMove({
    moveEvery,
    renew,
    year,
    amortization: init.amortization,
    mortgage,
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

  // Renew mortgage if necessary.
  if (renew && mortgage.balance > 0) {
    mortgage.renew(currentInterestRate, additionalBalance);
  }

  // Error checking.
  if (buyer.house.costs < 0 || buyer.portfolio.costs < 0 || renter.portfolio.costs < 0) {
    throw new Error('Costs are negative');
  }

  // Log the year's data.
  const yearData = logYear({
    year,
    renter,
    buyer,
    province,
    mortgage
  });

  // Update yearly variables.
  monthlyExpenses *= 1 + opts.rates.house.expenses();
  rent *= 1 + opts.rates.rent.controlled();
  marketRent *= 1 + opts.rates.rent.market();

  // Return updated values along with the year's data
  return {
    yearData,
    updatedValues: {
      currentHousePrice,
      newHousePrice,
      currentInterestRate,
      mortgage,
      buyer,
      renter,
      monthlyExpenses,
      rent,
      marketRent
    }
  };
};
