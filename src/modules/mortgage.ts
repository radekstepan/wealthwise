import { pmt } from './formula';

const normalizeBalance = (val: number): number => {
  if (Math.abs(val) < 0.01) {
    val = 0;
  }
  if (val < 0) {
    throw new Error(`Negative mortgage balance: ${val}`);
  }
  return val;
}

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
    get remainingAmortization() {
      return (periods - paidPeriods) / 12;
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

    // Paydown a principal.
    paydown(principal: number) {
      balance -= principal;

      if (balance < 0) {
        throw new Error("Cannot payoff more than the principal amount");
      } else if (balance === 0) {
        payment = 0;
      }
    },

    // Renew the loan with a new interest rate
    renew(newInterestRate: number, additionalAmount: number = 0) {
      rate = newInterestRate / 12; // Convert annual rate to monthly
      
      // Add the additional amount to the balance.
      balance += additionalAmount;

      // Adjust remaining periods.
      periods = periods - paidPeriods;

      // Recalculate payment based on new balance, rate, and periods.
      payment = pmt(rate, periods, -balance);

      paidPeriods = 0; // Reset paid periods count
    },
  };
}