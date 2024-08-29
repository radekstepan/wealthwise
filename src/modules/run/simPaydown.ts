import Mortgage from "../mortgage";
import { type Buyer, type Renter } from "./interfaces";

export const simPaydown = ({
  mortgage,
  anniversaryPaydownRate,
  originalBalance,
  buyer,
  renter
}: {
  mortgage: ReturnType<typeof Mortgage>,
  anniversaryPaydownRate: number,
  originalBalance: number,
  buyer: Buyer,
  renter: Renter
}) => {
  // Apply anniversary paydown at the end of each year
  if (mortgage.balance > 0 && anniversaryPaydownRate > 0) {
    // Make sure we don't paydown more than the remaining balance.
    const paydownAmount = Math.min(mortgage.balance, originalBalance * anniversaryPaydownRate);

    if (paydownAmount < 0) {
      throw new Error("Paydown is negative?");
    }

    // Reduce the principal.
    mortgage.paydown(paydownAmount);
    buyer.house.principalPaid += paydownAmount;
    // The buyer's house equity increases.
    buyer.house.costs += paydownAmount;
    buyer.house.equity += paydownAmount;
    // Add the paydown to renter's portfolio.
    renter.portfolio.costs += paydownAmount;
    renter.portfolio.value += paydownAmount;
  }
};
