import Mortgage from "../mortgage";
import { isEvery, sum } from "../utils";
import { type Sample } from "../samplers";
import { type Buyer, type Renter } from "../../interfaces";

export const simulateMonth = ({
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
  isFixedRate,
  nextInterestRate
}: {
  month: number,
  mortgage: ReturnType<typeof Mortgage>,
  buyer: Buyer,
  renter: Renter,
  monthlyExpenses: number,
  rent: number,
  housePriceAppreciation: number,
  bondsReturn: number,
  currentHousePrice: number,
  newHousePrice: number,
  currentInterestRate: number,
  isFixedRate: number,
  nextInterestRate: Sample
}) => {
  // Pay mortgage (handles empty balance).
  const [principal, interest] = mortgage.pay();

  // Add up the principal, interest, monthly expenses.
  buyer.house.principalPaid += principal;
  buyer.house.interestPaid += interest;
  buyer.house.monthlyExpensesPaid += monthlyExpenses;

  // Pay rent.
  buyer.house.rentPaid += rent;
  renter.house.rentPaid += rent;

  // Buyer and renter costs.
  buyer.house.costs += monthlyExpenses + mortgage.payment;

  const diff = monthlyExpenses + mortgage.payment - rent;
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
  const nextCurrentHousePrice = currentHousePrice * (1 + housePriceAppreciation);
  const nextNewHousePrice = newHousePrice * (1 + housePriceAppreciation);
  buyer.house.value = nextCurrentHousePrice,
  buyer.house.equity = sum(
    nextCurrentHousePrice,
    -mortgage.balance, // balance owing
  );

  // Monthly portfolio appreciation.
  buyer.portfolio.value *= 1 + bondsReturn;
  renter.portfolio.value *= 1 + bondsReturn;

  // Interest rate change.
  let nextCurrentInterestRate = currentInterestRate;
  if (isEvery(month, 3)) {
    nextCurrentInterestRate = nextInterestRate();

    // Renew variable rate mortgage all the time.
    if (!isFixedRate && mortgage.balance > 0) {
      mortgage.renew(nextCurrentInterestRate);
    }
  }

  return {
    nextCurrentHousePrice,
    nextNewHousePrice,
    nextCurrentInterestRate
  }
};
