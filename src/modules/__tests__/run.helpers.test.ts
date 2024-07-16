import { Province } from '../../config';
import {cmhc, saleFees} from '../run.helpers';

describe('run.helpers', () => {
  describe('cmhc', () => {
    test('5% on $150k', () => {
      expect(cmhc(0.05, 150000)).toBe(5700);
    });

    test('10% on $300k', () => {
      expect(cmhc(0.1, 300000)).toBe(8370);
    });

    test('15% on $500k', () => {
      expect(cmhc(0.15, 500000)).toBe(11900);
    });

    test('20% on $650k', () => {
      expect(cmhc(0.2, 650000)).toBe(0);
    });
  });

  describe('saleFees', () => {
    // https://wowa.ca/calculators/cost-selling-house
    test('$500k', () => {
      expect(saleFees(Province.Alberta, 500000)).toBe(19650);
    });
  });
});
