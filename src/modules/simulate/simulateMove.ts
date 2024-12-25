import { sum } from "mathjs";
import Mortgage from "../mortgage";
import { isEvery } from "../utils";
import { Province } from "../../config";
import * as helpers from "../run.helpers";
import { type Sample } from "../samplers";
import { type Buyer, type Renter } from "../../interfaces";

export const simulateMove = ({
  moveEvery,
  renew,
  year,
  simulateYears,
  mortgage,
  newHousePrice,
  currentHousePrice,
  province,
  buyer,
  renter,
  rent,
  marketRent,
  closingCosts
}: {
  moveEvery: number,
  renew: boolean,
  year: number,
  simulateYears: number,
  mortgage: ReturnType<typeof Mortgage>,
  newHousePrice: number,
  currentHousePrice: number,
  province: Province,
  buyer: Buyer,
  renter: Renter,
  rent: number,
  marketRent: number,
  closingCosts: Sample
}) => {
  let nextRent = rent;
  let nextCurrentHousePrice = currentHousePrice;
  let nextRenew = renew;
  let additionalBalance = 0;

  // Moving scenario (make sure we do not move in the last year).
  if (moveEvery > 0 && isEvery(year, moveEvery) && year !== simulateYears) {
    nextRenew = true;

    // The premium of getting into new to add to the principal.
    const newHousePremium = Math.max(0, newHousePrice - currentHousePrice);

    // Add the premium towards the balance if the mortgage is still to be paid off.
    if (mortgage.balance) {
      additionalBalance = newHousePremium;
    }

    const movingCosts = sum(
      helpers.saleFees(province, currentHousePrice),
      closingCosts(), // closing costs
      helpers.landTransferTax(province, currentHousePrice, false), // land transfer tax
      !mortgage.balance ? newHousePremium : 0 // add the premium as cash if the balance has been paid off
    );
    // Add the moving costs to the renter's portfolio.
    buyer.house.costs += movingCosts;
    buyer.house.movingCostsPaid += movingCosts;
    renter.portfolio.costs += movingCosts;
    renter.portfolio.value += movingCosts;
    // Buyer now pays market rent.
    nextRent = marketRent;

    nextCurrentHousePrice = newHousePrice;
  }

  return {
    additionalBalance,
    nextRenew,
    nextRent,
    nextCurrentHousePrice
  };
};
