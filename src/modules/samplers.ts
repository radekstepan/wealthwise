import * as math from 'mathjs';
import {jStat} from 'jstat';

// https://github.com/getguesstimate/guesstimate-app/blob/master/src/lib/guesstimator/samplers

export type Sample<T = number> = () => T;

// Just return the value, typed.
export const invariant: <T>(val: T) => Sample<T> = val => () => val;

// A sample that always returns the same value.
export const point = (number: number): Sample => {
  return () => number;
};

// Generates a random sample from a normal (i.e. Gaussian) distribution
//  with a specified mean and standard deviation.
export const normal = (low: number, high: number): Sample => {
  const mean = math.mean(high, low);
  const stdev = (high - mean) / 1.645;
  return () => {
    // This assumes a centered 90% confidence interval,
    // e.g. the left endpoint
    // marks 0.05% on the CDF, the right 0.95%.
    return jStat.normal.sample(mean, stdev);
  };
}
