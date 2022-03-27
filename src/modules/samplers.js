import * as math from 'mathjs';
import {jStat} from 'jstat';

// https://github.com/getguesstimate/guesstimate-app/blob/master/src/lib/guesstimator/samplers

const point = input => {
  const val = Number(input);
  return () => val;
};

const normal = input => {
  const [low, high] = input.split('-').map(d => Number(d.trim()));
  const mean = math.mean(high, low)
  const stdev = (high - mean) / 1.645
  return () => {
    // This assumes a centered 90% confidence interval,
    // e.g. the left endpoint
    // marks 0.05% on the CDF, the right 0.95%.
    return jStat.normal.sample(mean, stdev);
  };
}

// Determine which sampler/distribution to apply.
export default input => {
  // NOTE: won't correctly identify negative numbers
  if (!input.includes('-')) {
    return point(input);
  }

  return normal(input);
}