import * as d3 from 'd3';
import exec from './exec';
import {range} from './utils';

// Multiple runs/samples.
export default function simulate(inputs, setMeta, setData) {
  const child = exec(inputs);

  child.on('meta', setMeta);

  child.on('res', function processResult(samples) {
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
  
    setData(data);
  });
}
