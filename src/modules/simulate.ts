import * as d3 from 'd3';
import exec from './exec';
import {range} from './utils';

const BANDS = 7; // distribution bands

// Multiple runs/samples.
export default function simulate(inputs, setMeta, setDist, setData) {
  const child = exec(inputs);

  child.on('meta', setMeta);

  child.on('res', function processResult(samples) {
    // Distribution.
    const dist = samples
      .map(s => s[s.length - 1].property - s[s.length - 1].costs)
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

    const data = [[], [], []]; // quantiles
    // For each year.
    for (const year of range(samples[0].length)) {
      const buy = [], rent = [];
      for (const sample of samples) {
        // NOTE a simple comparison without taxes and fees.
        buy.push({
          net: sample[year].property - sample[year].costs,
          costs: sample[year].costs,
          rent: sample[year].rent,
        });
        rent.push({
          net: sample[year].portfolio - sample[year].costs,
          costs: sample[year].costs,
          rent: sample[year].rent,
        });
      }
  
      buy.sort((a, b) => d3.ascending(a.net, b.net));
      rent.sort((a, b) => d3.ascending(a.net, b.net));

      for (const [q, p] of [0.05, 0.5, 0.95].entries()) {
        const b = buy[Math.floor(samples.length * p)];
        const r = rent[Math.floor(samples.length * p)];

        data[q][year] = {
          buy: b.net,
          rent: r.net,
          buyCosts: b.costs,
          rentCosts: r.costs,
          buyRent: b.rent,
          rentRent: r.rent
        };
      }
    }
  
    setData(data);
  });
}
