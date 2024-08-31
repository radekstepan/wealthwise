import Mortgage from "../mortgage";

export function initMortgage(balance: number, rate: number, amortization: number) {
  return Mortgage({
    balance,
    rate,
    periods: amortization * 12
  });
};
