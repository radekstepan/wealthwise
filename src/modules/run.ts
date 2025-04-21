import { Random } from "random-js";
import { range, sum } from "./utils";
import parse, { type ParsedInputs } from './inputs/parse';
import { type TypedInputs } from "./inputs/inputs";
import { type Buyer, type Renter, type Data } from "../interfaces";
import * as helpers from "./fees";
import { simulateYear } from "./simulate/simulateYear";
import Mortgage from "./mortgage";
import { type MetaState } from "../atoms/metaAtom";
import { postMessage } from "./postMessage";

const SAMPLES = 1000; // default fallback

// A single random simulation run.
export function run(opts: ParsedInputs<TypedInputs>, emitMetaState: boolean): Data {
  const rnd = new Random();

  // Initialize simulation state
  const province = opts.province();
  const amortization = opts.mortgage.amortization();
  const simulateYears = opts.scenarios.simulate.years();
  const term = opts.mortgage.term();
  const isFixedRate = opts.mortgage.isFixedRate();
  const downpayment = Math.min(Math.max(opts.house.downpayment(), 0), 1);
  const capitalGainsTaxRate = opts.rates.bonds.capitalGainsTax();

  let currentHousePrice = opts.house.price();
  let currentInterestRate = opts.rates.interest.initial();
  let newHousePrice = currentHousePrice;

  const closingAndTax = sum(
    opts.house.closingCosts(),
    helpers.landTransferTax(province, currentHousePrice, true)
  );
  const originalBalance = currentHousePrice * (1 - downpayment);
  const mortgage = Mortgage({
    balance: originalBalance,
    rate: currentInterestRate,
    periods: amortization * 12
  });

  let rent = opts.rent.current();
  let marketRent = opts.rent.market();
  let rentalIncome = opts.rent.rentalIncome();

  const downpaymentAmount = currentHousePrice - originalBalance;
  const cmhc = helpers.cmhc(downpayment, currentHousePrice);
  // Expenses of the buyer.
  let monthlyExpenses = sum(
    opts.house.maintenance(),
    opts.house.propertyTax() / 12, // yearly to monthly
    opts.house.insurance()
  );

  const initialCostsForBuyer = sum(
    downpaymentAmount,
    closingAndTax, // closing costs and land transfer tax
    cmhc
  );
  const buyer: Buyer = {
    $: 0,
    roi: 0,
    province,
    portfolio: {
      $: 0,
      costs: 0,
      value: 0,
      capitalGainsTaxRate
    },
    house: {
      $: 0,
      costs: initialCostsForBuyer,
      value: currentHousePrice,
      equity: downpaymentAmount,
      capitalGainsTaxRate: 0,
      rentPaid: 0,
      rentalIncomeReceived: 0,
      interestPaid: 0,
      principalPaid: downpaymentAmount,
      principalRemaining: mortgage.balance,
      monthlyExpensesPaid: 0,
      movingCostsPaid: sum(
        closingAndTax,
        cmhc
      ),
    }
  };
  const renter: Renter = {
    $: 0,
    roi: 0,
    province,
    portfolio: {
      $: 0,
      costs: initialCostsForBuyer,
      value: initialCostsForBuyer,
      capitalGainsTaxRate
    },
    house: {
      $: 0,
      rentPaid: 0,
    },
  };

  let init = {
    province, amortization, term, isFixedRate, downpayment, capitalGainsTaxRate,
    currentHousePrice, currentInterestRate, newHousePrice, closingAndTax,
    originalBalance, mortgage, rent, marketRent, rentalIncome, downpaymentAmount, cmhc,
    monthlyExpenses, buyer, renter, simulateYears
  };

  if (emitMetaState) {
    const meta: MetaState = {
      cmhc,
      downpayment: downpaymentAmount,
      closingAndTax: closingAndTax,
      expenses: monthlyExpenses,
      payment: mortgage.payment
    };

    postMessage({
      action: 'meta',
      meta
    });
  }

  // Data for each year.
  const data: Data = [];

  for (const year of range(init.simulateYears)) {
    const {yearData, updatedValues} = simulateYear(year, init, opts, rnd);
    data.push(yearData);
    // Update init with the new values for the next iteration.
    init = {...init, ...updatedValues};
  }

  if (init.mortgage.balance && init.simulateYears >= init.amortization) {
    throw new Error("Mortgage has not been paid off");
  }

  return data;
}

// Export for web worker.
if (typeof self !== 'undefined') {
  self.onmessage = ({data: {inputs, samples}}: { // 'samples' is the potential override
    data: {inputs: TypedInputs, samples?: number}
  }) => {
    const opts = parse(inputs); // Parse the raw inputs received

    let numSamples: number;
    if (typeof samples === 'number' && samples > 0) {
        numSamples = samples;
        console.log(`Worker using samples override: ${numSamples}`);
    } else {
        numSamples = opts.scenarios.simulate.samples() || SAMPLES;
        console.log(`Worker using samples from form input: ${numSamples}`);
    }

    numSamples = Math.max(1, numSamples);

    const res = range(numSamples).map((i) => run(opts, !i));

    postMessage({action: 'res', res});
  };
}
