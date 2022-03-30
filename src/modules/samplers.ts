import * as math from 'mathjs';
import {jStat} from 'jstat';

// https://github.com/getguesstimate/guesstimate-app/blob/master/src/lib/guesstimator/samplers

export const point = (number: number) => {
  return () => number;
};

export const normal = (low: number, high: number) => {
  const mean = math.mean(high, low)
  const stdev = (high - mean) / 1.645
  return () => {
    // This assumes a centered 90% confidence interval,
    // e.g. the left endpoint
    // marks 0.05% on the CDF, the right 0.95%.
    return jStat.normal.sample(mean, stdev);
  };
}
