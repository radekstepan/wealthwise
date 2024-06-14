// @ts-ignore
import * as formula from '@formulajs/formulajs';

// This code is using the NOMINAL function to convert an annual
//  percentage yield (APY) to an annual percentage rate (APR).
// The NOMINAL function is used to convert an annual rate that
//  is compounded more frequently than once per year to a rate
//  that is compounded once per year. It takes two arguments:
//  the annual rate and the number of times per year that the
//  rate is compounded.
// The resulting monthly rate is being multiplied by -1 if the
//  original APY was negative, so that the sign of the APR matches
//  the sign of the original APY.
export const apyToAprMonthly = (apy: number) => {
  if (!apy) {
    return 0;
  }
  const monthly = formula.NOMINAL(Math.abs(apy), 12) / 12;
  return (apy < 0 ? -1 : 1) * monthly;
}

export const pmt = (rate: number, nper: number, pv: number) => rate * pv * Math.pow((1 + rate), nper) / (1 - Math.pow((1 + rate), nper));
