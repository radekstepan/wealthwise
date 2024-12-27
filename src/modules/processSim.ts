import * as d3 from 'd3';
import {range} from './utils';
import { type ChartDataPoint, type ChartData } from '../components/chart/Chart';
import { type DistState } from '../atoms/distAtom';
import { type Data, type Renter, type Buyer } from '../interfaces';

const BANDS = 7; // distribution bands

type Samples = Array<Data>; // samples * years

export const processSim = (
  setDist: (next: DistState) => void,
  setData: (data: ChartData) => void
) => (samples: Samples) => {
  // Distribution of end results as a buyer (net worth).
  const dist = samples
    .map(s => {
      const {buyer} = s[s.length - 1]; // last year in this sample
      return buyer.$;
    })
    .sort(d3.ascending);

  const min = d3.quantile(dist, 0.05);
  const max = d3.quantile(dist, 0.95);
  const band = (max - min) / BANDS;
  const bands = [0];
  let i = 0;
  let l = min + band;
  for (const d of dist) {
    if (d < min || d > max) continue;

    if (d <= l) {
      bands[i] += 1
    } else {
      i += 1;
      l += band;
      bands.push(0);
    }
  }

  setDist(bands.map((d, i) => [
    [min + (i * band), min + ((1 + i) * band)],
    d
  ]));

  const data: ChartData = [[], [], []]; // quantiles
  // For each year.
  for (const year of range(samples[0].length)) {
    const buy: Array<Buyer> = [];
    const rent: Array<Renter> = [];
    for (const sample of samples) {
      const sampleYear = sample[year];
      buy.push(sampleYear.buyer);
      rent.push(sampleYear.renter);
    }

    buy.sort((a, b) => d3.ascending(a.$, b.$));
    rent.sort((a, b) => d3.ascending(a.$, b.$));

    for (const [q, p] of [0.05, 0.5, 0.95].entries()) {
      // NOTE: https://github.com/d3/d3-array/blob/main/src/quantile.js#L19
      const b = buy[Math.floor(samples.length * p)];
      const r = rent[Math.floor(samples.length * p)];

      const dataPoint: ChartDataPoint = {
        buyer: b,
        renter: r
      };

      data[q][year] = dataPoint;
    }
  }

  setData(data);
};
