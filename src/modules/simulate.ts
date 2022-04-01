import * as d3 from 'd3';
import parse from './parse';
import run from './run';
import {range} from './utils';

const SAMPLES = 100; // number of samples

// Multiple runs/samples.
export default function simulate(inputs) {
  const opts = parse(inputs);
  const samples = range(SAMPLES).map(() => run(opts));

  const data = [[], [], []]; // quantiles
  // For each month.
  for (const m of range(samples[0].length)) {
    const buy = [], rent = [], afford = [];
    for (const sample of samples) {
      buy.push(sample[m].buy);
      rent.push(sample[m].rent);
      afford.push(sample[m].afford);
    }

    buy.sort(d3.ascending);
    rent.sort(d3.ascending);
    afford.sort(d3.ascending);

    for (const [q, p] of [0.05, 0.5, 0.95].entries()) {
      data[q][m] = {
        buy: d3.quantile(buy, p),
        rent: d3.quantile(rent, p),
        afford: d3.quantile(afford, p)
      };
    }
  }

  return data;
}
