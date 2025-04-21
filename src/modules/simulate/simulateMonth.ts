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
  rentalIncome,
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
  rentalIncome: number,
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
  buyer.house.rentalIncomeReceived += rentalIncome;

  // Pay rent.
  buyer.house.rentPaid += rent; // buyer still has imputed rent cost
  renter.house.rentPaid += rent;

  // Buyer total cash outlay for housing this month
  const buyerMonthlyOutlay = monthlyExpenses + mortgage.payment;
  // Renter total cash outlay for housing this month
  const renterMonthlyOutlay = rent;

  // Buyer and renter costs.
  buyer.house.costs += buyerMonthlyOutlay; // costs include expenses and mortgage payment

  // Difference in cash flow between buyer and renter
  // Positive diff means buyer spends more, renter invests the difference
  // Negative diff means renter spends more, buyer invests the difference (or less is drawn from portfolio)
  const diff = buyerMonthlyOutlay - renterMonthlyOutlay - rentalIncome; // subtract rental income from buyer's effective outlay

  if (diff > 0) {
    // Buyer expenses (after income) are greater than rent, renter invests the difference.
    renter.portfolio.costs += diff;
    renter.portfolio.value += diff;
  } else {
    // Renter expenses are greater or buyer has net income, buyer invests the difference.
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
