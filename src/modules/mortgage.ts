import * as math from 'mathjs';
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

export default function mortgage(
  init: {
    principal: number,
    periods: number,
    interest: number
  }
) {
  let principal = init.principal; // principal left
  let mortgage = principal; // principal for the term

  let periods = init.periods;
  let interest = init.interest / 12; // monthly
  let payment: number = formula.PMT(
    interest,
    periods,
    -mortgage,
    0,
    1
  );
  let balance = payment * periods; // principal + interest
  let period = 0;

  return {
    payment: () => math.round(payment, 2),
    balance: () => math.round(balance, 2), // n..0
    principal: () => math.round(principal, 2), // n..0
    equity: () => math.round(init.principal - principal, 2), // 0..n

    // Make a mortgage payment.
    pay: () => {
      principal -= formula.PPMT(
        interest,
        period += 1,
        periods,
        -mortgage,
        0,
        1
      );
      balance -= payment;

      balance = z(balance);
      principal = z(principal);
    },

    // Loan renewal.
    renew: (
      renew: {
        periods: number,
        interest: number
      }
    ) => {
      mortgage = principal; // principal for the term
      periods = renew.periods;
      period = 0;
      interest = renew.interest / 12; // set the new interest rate
      payment = formula.PMT( // update the payment
        interest,
        periods,
        -mortgage,
        0,
        1
      );
      balance = payment * periods; // principal + interest
    }
  };
}