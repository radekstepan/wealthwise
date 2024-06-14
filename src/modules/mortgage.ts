import { pmt } from './formula';

// Normalize small floating-point values to zero and ensure no negative balances
const normalizeBalance = (val: number): number => {
  if (Math.abs(val) < 0.01) {
    val = 0;
  }
  if (val < 0) {
    throw new Error(`Negative mortgage balance: ${val}`);
  }
  return val;
}

// Class-like function to manage mortgage calculations and operations
export default function Mortgage(
  init: {
    balance: number, // Property price sans downpayment
    periods: number, // Amortization period in months (years * 12)
    rate: number     // Annual interest rate
  }
) {
  let { balance, periods, rate } = init;
  rate = rate / 12; // Convert annual rate to monthly
  let payment = pmt(rate, periods, -balance);
  let paidPeriods = 0;

  return {
    get payment() {
      return payment;
    },
    get balance() {
      return normalizeBalance(balance);
    },
    get equity() {
      return init.balance - balance;
    },

    // Simulate making a mortgage payment
    pay() {
      if (balance <= 0) {
        payment = 0;
        return [0, 0]; // No payment needed
      }

      const interest = balance * rate;
      let principal = payment - interest;

      if (principal > balance) {
        principal = balance;
        payment = interest + principal; // Adjust final payment
      }

      balance -= principal;
      paidPeriods++;

      if (balance <= 0) {
        balance = 0;
        payment = 0;
      }

      return [principal, interest];
    },

    // Renew the loan with a new interest rate
    renew(newInterestRate: number) {
      rate = newInterestRate / 12; // Convert annual rate to monthly
      periods = periods - paidPeriods; // Adjust remaining periods
      payment = pmt(rate, periods, -balance); // Recalculate payment
      paidPeriods = 0; // Reset paid periods count
    },
  };
}
