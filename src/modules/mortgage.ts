// @ts-ignore
import * as formula from '@formulajs/formulajs';

// TODO sigh...
const z = (val: number) => {
  if (val < 0.01 && val > -0.01) {
    val = 0;
  }
  if (val < 0) {
    throw new Error(`Negative mortgage balance: ${val}`);
  }
  return val;
}

// A class that calculates the monthly payment, balance, and equity of
//  a mortgage loan. It uses the formula.PMT and formula.PPMT functions
//  from the formulajs library to calculate the monthly payment and
//  principal payment, respectively.
// The pay method can be called to simulate making a payment on the
//  mortgage.
// The renew method can be used to renew the loan with a new interest rate.
// NOTE: PMT, PPMT are @expensive
export default function mortgage(
  init: {
    balance: number,
    periods: number,
    interest: number
  }
) {
  let balance = init.balance; // balance left
  let mortgage = balance; // balance for the term

  let periods = init.periods;
  let interest = init.interest / 12; // monthly
  let payment: number = formula.PMT(
    interest,
    periods,
    -mortgage,
    0,
    0
  );
  let period = 0;

  return {
    get payment() {
      return payment;
    },
    get balance() { // n..0
      return z(balance);
    },
    get equity() { // 0..n
      return init.balance - balance;
    },

    // Make a mortgage payment.
    pay: () => {
      const principal = formula.PPMT(
        interest,
        period += 1,
        periods,
        -mortgage,
        0,
        0
      );

      balance -= principal;

      return [
        principal, // principal
        payment - principal // interest
      ];
    },

    // Loan renewal.
    renew: (newInterestRate: number) => {
      mortgage = balance; // balance for the term
      periods -= period;
      period = 0;
      interest = newInterestRate / 12; // set the new interest rate
      payment = formula.PMT( // update the payment
        interest,
        periods,
        -mortgage,
        0,
        0
      );
    }
  };
}