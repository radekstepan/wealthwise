import { Random } from "random-js";
import { isEvery, range, sum } from "./utils";
import Mortgage from "./mortgage";
import * as helpers from "./run.helpers";
import * as formula from './formula';
import parse, { type ParsedInputs } from './inputs/parse';
import { type TypedInputs } from "./inputs/inputs";
import { type MetaState } from "../atoms/metaAtom";

const SAMPLES = 1000; // number of samples

interface Asset {
  costs: number,
  value: number,
  capitalGainsTaxRate: number, // 0...1
}

export interface House extends Asset {
  equity: number, // value minus principal balance remaining
  capitalGainsTaxRate: 0, // 0 = owner occupied
  rentPaid: number,
  interestPaid: number,
  principalPaid: number,
  monthlyExpensesPaid: number,
}

export interface RentalHouse extends House {
  value: 0,
  equity: 0,
  interestPaid: 0,
  principalPaid: 0,
  monthlyExpensesPaid: 0
}

interface User<THouse extends House> {
  portfolio: Asset,
  house: THouse,
}

export type Buyer = User<House>;
export type Renter = User<RentalHouse>;

// 25 years of data.
export type Data = Array<{
  year: number,
  buyer: Buyer,
  renter: Renter,
}>;

// A single random simulation run.
function run(opts: ParsedInputs<TypedInputs>, emitMeta: boolean): Data {
  const rnd = new Random();

  const province = opts.province();

  const amortization = opts.mortgage.amortization();
  const term = opts.mortgage.term();
  const isFixedRate = Boolean(opts.mortgage.isFixedRate());
  // Make sure the downpayment is between 0 and 1.
  const downpayment = Math.min(Math.max(opts.house.downpayment(), 0), 1);
  const capitalGainsTaxRate = opts.rates.bonds.capitalGainsTax();

  let currentHousePrice = opts.house.price();
  let currentInterestRate = opts.rates.interest.initial();
  let newHousePrice = currentHousePrice; // how much a new home costs

  // Closing costs and land transfer tax.
  const closingAndTax = sum(
    opts.house.closingCosts(), // fees
    helpers.landTransferTax(province, currentHousePrice) // land transfer tax
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

  // Initial costs of the buyer.
  const month0Costs = [
    downpaymentAmount,
    closingAndTax, // closing costs and land transfer tax
    helpers.cmhc(downpayment, currentHousePrice) // cmhc insurance
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
      value: currentHousePrice,
      equity: downpaymentAmount,
      capitalGainsTaxRate: 0,
      rentPaid: 0,
      interestPaid: 0,
      principalPaid: downpaymentAmount,
      monthlyExpensesPaid: 0,
    }
  };
  const renter: Renter = {
    portfolio: {
      costs,
      value: costs,
      capitalGainsTaxRate
    },
    house: {
      costs: 0,
      value: 0,
      equity: 0,
      capitalGainsTaxRate: 0,
      rentPaid: 0,
      interestPaid: 0,
      principalPaid: 0,
      monthlyExpensesPaid: 0,
    },
  };

  if (emitMeta) {
    const meta: MetaState = {
      downpayment: month0Costs[0],
      closingAndTax,
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
    const moveEvery = opts.scenarios.move.tenureYears();

    // Property crash?
    if (rnd.bool(Math.min(opts.scenarios.crash.chance(), 1))) {
      const crashDrop = 1 - Math.min(opts.scenarios.crash.drop(), 1);
      currentHousePrice *= crashDrop;
      newHousePrice *= crashDrop;
    }

    for (const month of range(12)) {
      // Pay mortgage (handles empty balance).
      const [principal, interest] = mgage.pay();

      // Add up the principal, interest, monthly expenses.
      buyer.house.principalPaid += principal;
      buyer.house.interestPaid += interest;
      buyer.house.monthlyExpensesPaid += monthlyExpenses;

      // Pay rent.
      buyer.house.rentPaid += rent;
      renter.house.rentPaid += rent;

      // Buyer and rented costs.
      buyer.house.costs += monthlyExpenses + mgage.payment;
      renter.house.costs += rent;

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
      newHousePrice *= 1 + housePriceAppreciation;
      buyer.house.value = currentHousePrice,
      buyer.house.equity = sum(
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

    // Apply anniversary paydown at the end of each year
    if (mgage.balance > 0 && anniversaryPaydownRate > 0) {
      // Make sure we don't paydown more than the remaining balance.
      const paydownAmount = Math.min(mgage.balance, originalBalance * anniversaryPaydownRate);

      if (paydownAmount < 0) {
        throw new Error("Paydown is negative?");
      }

      // Reduce the principal.
      mgage.paydown(paydownAmount);
      buyer.house.principalPaid += paydownAmount;
      // The buyer's house equity increases.
      buyer.house.costs += paydownAmount;
      buyer.house.equity += paydownAmount;
      // Add the paydown to renter's portfolio.
      renter.portfolio.costs += paydownAmount;
      renter.portfolio.value += paydownAmount;
    }

    // Apply premium to new home price.
    newHousePrice *= 1 + opts.scenarios.move.annualMoveUpCost();

    let renew = false;
    let additionalBalance = 0;
    if (isFixedRate) {
      // Renew the fixed rate mortgage every 5 years.
      if (mgage.balance > 0 && isEvery(year, term)) {
        renew = true;
      }
    }
    // Moving scenario (make sure we do not move in the last year).
    if (moveEvery > 0 && isEvery(year, moveEvery) && year !== amortization) {
      renew = true;

      // The premium of getting into new to add to the principal.
      const newHousePremium = Math.max(0, newHousePrice - currentHousePrice);

      // Add the premium towards the balance if the mortgage is still to be paid off.
      if (mgage.balance) {
        additionalBalance = newHousePremium;
      }

      const movingCosts = sum(
        helpers.saleFees(province, currentHousePrice),
        opts.house.closingCosts(), // closing costs
        helpers.landTransferTax(province, currentHousePrice), // land transfer tax
        !mgage.balance ? newHousePremium : 0 // add the premium as cash if the balance has been paid off
      );
      // Add the moving costs to the renter's portfolio.
      buyer.house.costs += movingCosts;
      renter.portfolio.costs += movingCosts;
      renter.portfolio.value += movingCosts;
      // Buyer now pays market rent.
      rent = marketRent;

      currentHousePrice = newHousePrice;
    }

    if (renew && mgage.balance > 0) {
      mgage.renew(currentInterestRate, additionalBalance);
    }

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
        portfolio: {
          costs: buyer.portfolio.costs, // money invested
          value: buyer.portfolio.value,
          capitalGainsTaxRate
        },
        house: {
          costs: buyer.house.costs,
          value: buyer.house.value,
          equity: buyer.house.equity,
          rentPaid: buyer.house.rentPaid,
          interestPaid: buyer.house.interestPaid,
          principalPaid: buyer.house.principalPaid,
          monthlyExpensesPaid: buyer.house.monthlyExpensesPaid,
          capitalGainsTaxRate: 0,
        }
      },
      renter: {
        portfolio: {
          costs: renter.portfolio.costs, // money invested
          value: renter.portfolio.value,
          capitalGainsTaxRate
        },
        house: {
          costs: renter.portfolio.costs, // rentPaid
          value: 0,
          equity: 0,
          rentPaid: renter.house.rentPaid,
          interestPaid: 0,
          principalPaid: 0,
          monthlyExpensesPaid: 0,
          capitalGainsTaxRate: 0,
        }
      },
    });

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
