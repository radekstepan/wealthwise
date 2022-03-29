import * as math from 'mathjs';
// @ts-ignore
import * as formula from '@formulajs/formulajs';

// TODO sigh...
const z = (val: number) => {
  if (val < 0.01 && val > -0.01) {
    val = 0;
  }
  if (val < 0) {
    throw new Error('NOTE make sure not to overpay if > 25 years');
  }
  return val;
}

export default function mortgage(
  opts: {
    principal: number,
    periods: number,
    interest: number
  }
) {
  let {principal, periods} = opts;
  let interest = opts.interest / 12; // monthly

  let payment: number = formula.PMT(
    interest,
    opts.periods,
    -opts.principal,
    0,
    1
  );

  let balance = math.round(payment * periods, 2); // payments remaining

  return {
    payment: () => math.round(payment, 2),
    balance: () => math.round(balance, 2),
    principal: () => math.round(principal, 2),

    // Make a mortgage payment.
    pay: ({period}) => {
      principal -= formula.PPMT(
        interest,
        period,
        opts.periods,
        -opts.principal,
        0,
        1
      );
      balance -= payment;

      balance = z(balance);
      principal = z(principal);
    },

    // Loan renewal.
    renew: (opts) => {
      interest = opts.interest / 12;
      payment = formula.PMT(
        interest,
        opts.periods, // TODO
        -principal
      );
      balance = payment * opts.periods; // payments remaining
    }
  };
}