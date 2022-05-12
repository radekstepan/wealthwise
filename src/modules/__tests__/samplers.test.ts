import * as d3 from 'd3';
import {normal} from '../samplers';
import {range} from '../utils';

const r = (n: number) => Math.abs(Math.round(n));

describe('samplers', () => {
  describe('normal', () => {
    test('normal distribution', () => {
      const sample = normal(0, 2);
      const samples = range(10000).map(sample).sort();

      expect(r(d3.quantile(samples, 0.05))).toEqual(0);
      expect(r(d3.quantile(samples, 0.50))).toEqual(1);
      expect(r(d3.quantile(samples, 0.95))).toEqual(2);
    });
  });
});
