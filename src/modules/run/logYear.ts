import { sum } from "../utils";
import * as helpers from "../run.helpers";
import { type Province } from "../../config";
import Mortgage from "../mortgage";
import { type Renter, type Buyer } from "./interfaces";

export const logYear = (opts: {
  year: number,
  renter: Renter,
  buyer: Buyer,
  province: Province,
  mortgage: ReturnType<typeof Mortgage>
}) => {
  const {year, renter, buyer, province, mortgage} = opts;

  const buyerHouse$ = sum(
    buyer.house.equity,
    -helpers.saleFees(province, buyer.house.value),
  );
  const buyerPortfolio$ = sum(
    buyer.portfolio.value,
    -sum(
      buyer.portfolio.value
      -buyer.portfolio.costs
    ) * (1 - buyer.portfolio.capitalGainsTaxRate)
  );
  const renterPortfolio$ = sum(
    renter.portfolio.value,
    -sum(
      renter.portfolio.value
      -renter.portfolio.costs
    ) * (1 - renter.portfolio.capitalGainsTaxRate)
  );

  const buyerNet$ = buyerHouse$ + buyerPortfolio$;
  const renterNet$ = renterPortfolio$;

  const buyerTotalInvestment = buyer.house.costs + buyer.portfolio.costs;
  const renterTotalInvestment = renter.portfolio.costs;

  // Log it.
  return {
    year,
    // NOTE: Object, make sure to copy the values.
    buyer: {
      $: buyerNet$,
      roi: (buyerNet$ + buyer.house.rentPaid - buyerTotalInvestment) / buyerTotalInvestment,
      province,
      portfolio: {
        $: buyerPortfolio$,
        costs: buyer.portfolio.costs, // money invested
        value: buyer.portfolio.value,
        capitalGainsTaxRate: buyer.portfolio.capitalGainsTaxRate
      },
      house: {
        $: buyerHouse$,
        costs: buyer.house.costs,
        value: buyer.house.value,
        equity: buyer.house.equity,
        rentPaid: buyer.house.rentPaid,
        interestPaid: buyer.house.interestPaid,
        principalPaid: buyer.house.principalPaid,
        principalRemaining: mortgage.balance,
        monthlyExpensesPaid: buyer.house.monthlyExpensesPaid,
        movingCostsPaid: buyer.house.movingCostsPaid,
        capitalGainsTaxRate: buyer.house.capitalGainsTaxRate
      }
    },
    renter: {
      $: renterNet$,
      roi: (renterNet$ - renterTotalInvestment) / renterTotalInvestment,
      province,
      portfolio: {
        $: renterPortfolio$,
        costs: renter.portfolio.costs, // money invested
        value: renter.portfolio.value,
        capitalGainsTaxRate: renter.portfolio.capitalGainsTaxRate
      },
      house: {
        $: 0,
        rentPaid: renter.house.rentPaid,
      }
    },
  };
};
