// @ts-ignore
import * as formula from '@formulajs/formulajs';

// APY to APR then monthly.
export const apyToAprMonthly = (apy: number) => {
  if (!apy) {
    return 0;
  }
  const monthly = formula.NOMINAL(Math.abs(apy), 12) / 12;
  return (apy < 0 ? -1 : 1) * monthly;
}
