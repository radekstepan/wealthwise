import * as d3 from 'd3';
import parse from './parse';
import run from './run';
import {range} from './utils';

const SAMPLES = 100; // number of samples

// Multiple runs/samples.
export default function estimate(inputs) {
  const opts = parse(inputs);
  const samples = range(SAMPLES).map(() => run(opts));

  const data = [[], [], []]; // quantiles
  // For each month.
  for (const i of range(samples[0].length)) {
    const buy = [], rent = [];
    for (const sample of samples) {
      buy.push(sample[i][0]);
      rent.push(sample[i][1]);
    }

    buy.sort(d3.ascending);
    rent.sort(d3.ascending);
    
    data[0][i] = {
      buy: d3.quantile(buy, 0.05),
      rent: d3.quantile(rent, 0.05)
    };
    data[1][i] = {
      buy: d3.quantile(buy, 0.50),
      rent: d3.quantile(rent, 0.50)
    };
    data[2][i] = {
      buy: d3.quantile(buy, 0.95),
      rent: d3.quantile(rent, 0.95)
    };
  }

  return data;
}
