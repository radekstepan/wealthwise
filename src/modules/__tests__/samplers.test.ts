import * as d3 from 'd3';
import {normal, point, invariant} from '../samplers';
import {range} from '../utils';

describe('samplers', () => {
  describe('normal', () => {
    test('normal distribution', () => {
      const sample = normal(0, 2);
      const samples = range(10000).map(sample).sort();

      expect(d3.quantile(samples, 0.05)!).toBeCloseTo(0, 1);
      expect(d3.quantile(samples, 0.50)!).toBeCloseTo(1, 1);
      expect(d3.quantile(samples, 0.95)!).toBeCloseTo(2, 1);
    });
  });

  describe('point', () => {
    test('returns a function that always returns the same number', () => {
      const sample = point(5);
      
      // Test multiple calls return the same value
      expect(sample()).toBe(5);
      expect(sample()).toBe(5);
      expect(sample()).toBe(5);
    });

    test('works with different numbers', () => {
      const negativeSample = point(-10);
      const zeroSample = point(0);
      const decimalSample = point(3.14);

      expect(negativeSample()).toBe(-10);
      expect(zeroSample()).toBe(0);
      expect(decimalSample()).toBe(3.14);
    });
  });

  describe('invariant', () => {
    test('returns a function that always returns the same value for numbers', () => {
      const sample = invariant(42);
      
      expect(sample()).toBe(42);
      expect(sample()).toBe(42);
    });

    test('works with different types', () => {
      const stringSample = invariant('test');
      const booleanSample = invariant(true);
      const arraySample = invariant([1, 2, 3]);
      const objectSample = invariant({ key: 'value' });

      expect(stringSample()).toBe('test');
      expect(booleanSample()).toBe(true);
      expect(arraySample()).toEqual([1, 2, 3]);
      expect(objectSample()).toEqual({ key: 'value' });
    });

    test('maintains type safety', () => {
      const numberSample = invariant<number>(5);
      const stringSample = invariant<string>('hello');
      
      // TypeScript should catch type errors if we tried to assign wrong types
      const numberResult: number = numberSample();
      const stringResult: string = stringSample();
      
      expect(typeof numberResult).toBe('number');
      expect(typeof stringResult).toBe('string');
    });
  });
});
