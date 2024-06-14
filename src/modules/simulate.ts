import * as d3 from 'd3';
import exec from './exec';
import {range, sum} from './utils';
import { type Data } from './run';
import { type ChartData } from '../components/chart/Chart';

const BANDS = 7; // distribution bands
const YEARS = 25; // TODO hard-coded

type Samples = Array<Data>; // samples * years

interface DataPoint {
  net: number,
  costs: number,
  rent: number,
}

// Multiple runs/samples.
// Simulating multiple scenarios for comparing buying vs. renting a property.
//  It takes inputs and runs them a child process, which returns results
//  that are used to calculate distribution bands and quantiles for the buy
//  and rent scenarios. The bands and quantiles are then used to set the dist
//  and data variables, which are used for visualization.
export default function simulate(inputs, setMeta, setDist, setData: (data: ChartData) => void) {
  const child = exec(inputs);

  child.on('meta', setMeta);

  child.on('res', function processResult(samples: Samples) {
    // Distribution of end results as a buyer (net worth).
    const dist = samples
      .map(s => {
        const {buyer} = s[s.length - 1]; // last year in this sample
        return sum(
          // Net house value.
          buyer.house.value
          -buyer.house.costs,
          // Net portfolio appreciation.
          buyer.portfolio.value,
          -buyer.portfolio.costs
        );
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
    for (const year of range(YEARS)) {
      const buy: Array<DataPoint> = [];
      const rent: Array<DataPoint> = [];
      for (const sample of samples) {
        const sampleYear = sample[year];

        buy.push({
          net: sum(
            sampleYear.buyer.house.value,
            -sampleYear.buyer.house.costs,
            sampleYear.buyer.portfolio.value,
            -sampleYear.buyer.portfolio.costs,
            +sampleYear.renter.house.costs, // cancel out rent
          ),
          costs: sum(
            sampleYear.buyer.house.costs,
            sampleYear.buyer.portfolio.costs,
            -sampleYear.renter.house.costs, // cancel out rent
          ),
          rent: sampleYear.rent,
        });
        rent.push({
          net: sum(
            sampleYear.renter.portfolio.value,
            -sampleYear.renter.portfolio.costs
            // do not include rent
          ),
          costs: sum(
            sampleYear.renter.portfolio.costs
            // do not include rent
          ),
          rent: sampleYear.rent,
        });
      }
  
      buy.sort((a, b) => d3.ascending(a.net, b.net));
      rent.sort((a, b) => d3.ascending(a.net, b.net));

      for (const [q, p] of [0.05, 0.5, 0.95].entries()) {
        // NOTE: https://github.com/d3/d3-array/blob/main/src/quantile.js#L19
        const b = buy[Math.floor(samples.length * p)];
        const r = rent[Math.floor(samples.length * p)];

        data[q][year] = {
          buyer: b.net,
          renter: r.net
        };
      }
    }
  
    setData(data);
  });
}
