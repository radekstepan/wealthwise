import * as formula from '@formulajs/formulajs';

// TODO test this whole module
export default function mortgage(opts) {
  let {principal, periods} = opts;
  let interest = opts.interest / 12; // monthly

  let payment = formula.PMT(
    interest,
    periods,
    -principal
  );
  let balance = payment * periods; // payments remaining

  return {
    // Make a mortgage payment.
    pay: ({period}) => {
      principal -= formula.PPMT(
        interest,
        period,
        periods,
        -principal
      );

      balance -= payment;
      if (balance < 0) {
        throw new Error('NOTE make sure not to overpay if > 25 years');
      }

      return {
        balance,
        principal,
        payment
      }
    },
    // Loan renewal.
    renew: (opts) => {
      interest = opts.interest / 12;
      payment = formula.PMT(
        interest,
        opts.periods,
        -principal
      );
      balance = payment * opts.periods; // payments remaining
    }
  };
}