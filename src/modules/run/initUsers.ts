import { Province } from "../../config";
import { sum } from "../utils";
import { type Buyer, type Renter } from "./interfaces";

export const initUsers = ({
  downpaymentAmount,
  closingAndTax,
  cmhc,
  province,
  capitalGainsTaxRate,
  currentHousePrice,
  mortgageBalance
}: {
  downpaymentAmount: number,
  closingAndTax: number,
  cmhc: number,
  province: Province,
  capitalGainsTaxRate: number,
  currentHousePrice: number,
  mortgageBalance: number
}) => {
  // Initial costs of the buyer.
  let costs = sum(
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
      costs,
      value: currentHousePrice,
      equity: downpaymentAmount,
      capitalGainsTaxRate: 0,
      rentPaid: 0,
      interestPaid: 0,
      principalPaid: downpaymentAmount,
      principalRemaining: mortgageBalance,
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
      costs,
      value: costs,
      capitalGainsTaxRate
    },
    house: {
      $: 0,
      rentPaid: 0,
    },
  };

  return {
    buyer,
    renter
  };
};
