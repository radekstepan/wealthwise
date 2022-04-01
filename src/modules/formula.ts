// @ts-ignore
import * as formula from '@formulajs/formulajs';

// APY to APR then monthly.
export const apyToAprMonthly = (apy: number) => formula.NOMINAL(apy, 12) / 12;
