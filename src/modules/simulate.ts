import * as d3 from 'd3';
import exec from './exec';
import {range} from './utils';

const BANDS = 7; // distribution bands

// Multiple runs/samples.
export default function simulate(inputs, setMeta, setDist, setData) {
  const child = exec(inputs);

  child.on('meta', setMeta);

  child.on('res', function processResult(samples) {
    const dist = samples.map(s => s[s.length - 1].buy).sort(d3.ascending);
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
