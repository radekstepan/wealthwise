import { Random } from "random-js";
import * as formula from '../formula';
import { isEvery, range, sum } from "../utils";
import { simulatePaydown } from "./simulatePaydown";
import { simulateMonth } from "./simulateMonth";
import { simulateCrash } from "./simulateCrash";
import { simulateMove } from "./simulateMove";
import { logYear } from "../logYear";
import { type TypedInputs } from "../inputs/inputs";
import { type ParsedInputs } from "../inputs/parse";
import { type MonthlyExpenseBreakdown, type MonthlyCarryingCost } from "../../interfaces";

export function simulateYear(year: number, init: any, opts: ParsedInputs<TypedInputs>, random: Random) {
  let {
    currentHousePrice, newHousePrice, currentInterestRate,
    monthlyExpenses, monthlyExpenseBreakdown, rent, marketRent, rentalIncome
  } = init;

  let expenseBreakdown: MonthlyExpenseBreakdown = monthlyExpenseBreakdown as MonthlyExpenseBreakdown;

  const {
    originalBalance, province, mortgage, buyer, renter
  } = init;

  const housePriceAppreciation = formula.apyToAprMonthly(opts.rates.house.appreciation());
  const bondsReturn = formula.apyToAprMonthly(opts.rates.bonds.return());
  const moveEvery = opts.scenarios.move.tenureYears();
  const anniversaryPaydownRate = opts.scenarios.mortgage.anniversaryPaydown();

  // Property crash?
  const crashDrop = simulateCrash({random, opts});
  if (crashDrop) {
    currentHousePrice *= crashDrop;
    newHousePrice *= crashDrop;      
  }

  const yearCarryingCosts: Array<MonthlyCarryingCost> = [];

  // Simulate each month of the year.
  for (const month of range(12)) {
    const absoluteMonth = year * 12 + month;
    const nextMonth = simulateMonth({
      month,
      absoluteMonth,
      mortgage,
      buyer,
      renter,
      monthlyExpenses,
  monthlyExpenseBreakdown: expenseBreakdown,
      rent,
      rentalIncome,
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
    yearCarryingCosts.push(nextMonth.carryingCost);
  }

  // Apply anniversary paydown at the end of each year.
  simulatePaydown({
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
  const nextMove = simulateMove({
    moveEvery,
    renew,
    year,
    simulateYears: init.simulateYears,
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
    mortgage,
    carryingCosts: yearCarryingCosts
  });

  // Update yearly variables.
  const houseExpenseGrowth = 1 + opts.rates.house.expenses();
  const nextBreakdown: MonthlyExpenseBreakdown = {
    maintenance: expenseBreakdown.maintenance * houseExpenseGrowth,
    propertyTax: expenseBreakdown.propertyTax * houseExpenseGrowth,
    insurance: expenseBreakdown.insurance * houseExpenseGrowth,
    hoa: expenseBreakdown.hoa * houseExpenseGrowth,
    other: expenseBreakdown.other * houseExpenseGrowth
  };
  expenseBreakdown = nextBreakdown;
  monthlyExpenses = sum(
    expenseBreakdown.maintenance,
    expenseBreakdown.propertyTax,
    expenseBreakdown.insurance,
    expenseBreakdown.hoa,
    expenseBreakdown.other
  );
  rent *= 1 + opts.rates.rent.controlled();
  marketRent *= 1 + opts.rates.rent.market();
  rentalIncome *= 1 + opts.rates.rent.rentalIncome();

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
      monthlyExpenseBreakdown: expenseBreakdown,
      rent,
      marketRent,
      rentalIncome
    }
  };
};
