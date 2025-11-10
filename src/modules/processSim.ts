import * as d3 from 'd3';
import {range} from './utils';
import { type ChartDataPoint, type ChartData } from '../components/chart/Chart';
import { type DistState } from '../atoms/distAtom';
import { type Data, type Renter, type Buyer } from '../interfaces';

const BANDS = 10; // distribution bands

export type Samples = Array<Data>; // samples * years

export const processSim = (
  setDist: (next: DistState) => void,
  setData: (data: ChartData) => void
) => (samples: Samples) => {
  // Distribution of end results (net worth).
  const buyerOutcomes = samples.map(s => s[s.length - 1].buyer.$);
  const renterOutcomes = samples.map(s => s[s.length - 1].renter.$);

  if (buyerOutcomes.length > 1 && renterOutcomes.length > 1) {
    setDist({
      buyer: buyerOutcomes,
      renter: renterOutcomes,
    });
  } else {
    setDist(null);
  }

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
