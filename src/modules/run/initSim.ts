import * as helpers from "../run.helpers";
import { calcClosingAndTax } from "./calcClosingAndTax";
import { calcMonthlyExpenses } from "./calcMonthlyExpenses";
import { initMortgage } from "./initMortgage";
import { initUsers } from "./initUsers";
import { type TypedInputs } from "../inputs/inputs";
import { type ParsedInputs } from "../inputs/parse";

export function initSim(opts: ParsedInputs<TypedInputs>) {
  const province = opts.province();
  const amortization = opts.mortgage.amortization();
  const term = opts.mortgage.term();
  const isFixedRate = opts.mortgage.isFixedRate();
  // Make sure the downpayment is between 0 and 1.
  const downpayment = Math.min(Math.max(opts.house.downpayment(), 0), 1);
  const capitalGainsTaxRate = opts.rates.bonds.capitalGainsTax();
  
  let currentHousePrice = opts.house.price();
  let currentInterestRate = opts.rates.interest.initial();
  let newHousePrice = currentHousePrice;

  // Closing costs and land transfer tax.
  const closingAndTax = calcClosingAndTax(opts, province, currentHousePrice);
  const originalBalance = currentHousePrice * (1 - downpayment);
  const mortgage = initMortgage(originalBalance, currentInterestRate, amortization);

  let rent = opts.rent.current();
  let marketRent = opts.rent.market();

  const downpaymentAmount = currentHousePrice - originalBalance;
  const cmhc = helpers.cmhc(downpayment, currentHousePrice);
  let monthlyExpenses = calcMonthlyExpenses(opts);

  const {buyer, renter} = initUsers({
    downpaymentAmount,
    closingAndTax,
    cmhc,
    province,
    capitalGainsTaxRate,
    currentHousePrice,
    mortgageBalance: mortgage.balance
  });

  return {
    province, amortization, term, isFixedRate, downpayment, capitalGainsTaxRate,
    currentHousePrice, currentInterestRate, newHousePrice, closingAndTax,
    originalBalance, mortgage, rent, marketRent, downpaymentAmount, cmhc,
    monthlyExpenses, buyer, renter
  };
};
