import { r, round, range, range1, sum, isEvery, within } from '../utils';

describe('utils', () => {
  describe('isEvery', () => {
    test('every n times', () => {
      expect(isEvery(0, 3)).toBeFalsy();
      expect(isEvery(1, 3)).toBeFalsy();
      expect(isEvery(2, 3)).toBeFalsy();
      expect(isEvery(3, 3)).toBeTruthy();
      expect(isEvery(6, 3)).toBeTruthy();
    });
  });
  describe('r/round', () => {
    test('rounds numbers to two decimal places', () => {
      expect(r(3.14159)).toBe(3.14);
      expect(r(2.005)).toBe(2.01);
      expect(r(2)).toBe(2);
      expect(r(-3.14159)).toBe(-3.14);
    });

    test('round is an alias of r', () => {
      expect(round(3.14159)).toBe(r(3.14159));
    });
  });

  describe('range', () => {
    test('generates array of numbers starting from 0', () => {
      expect(range(0)).toEqual([]);
      expect(range(1)).toEqual([0]);
      expect(range(3)).toEqual([0, 1, 2]);
      expect(range(5)).toEqual([0, 1, 2, 3, 4]);
    });
  });

  describe('range1', () => {
    test('generates array of numbers starting from 1', () => {
      expect(range1(0)).toEqual([]);
      expect(range1(1)).toEqual([1]);
      expect(range1(3)).toEqual([1, 2, 3]);
      expect(range1(5)).toEqual([1, 2, 3, 4, 5]);
    });
  });

  describe('sum', () => {
    test('calculates sum of numbers', () => {
      expect(sum()).toBe(0);
      expect(sum(1)).toBe(1);
      expect(sum(1, 2, 3)).toBe(6);
      expect(sum(-1, 1)).toBe(0);
      expect(r(sum(1.1, 2.2))).toBe(3.3);
    });
  });

  describe('isEvery', () => {
    test('returns true every n times', () => {
      expect(isEvery(0, 3)).toBeFalsy();
      expect(isEvery(1, 3)).toBeFalsy();
      expect(isEvery(2, 3)).toBeFalsy();
      expect(isEvery(3, 3)).toBeTruthy();
      expect(isEvery(6, 3)).toBeTruthy();
    });

    test('handles different intervals', () => {
      expect(isEvery(2, 2)).toBeTruthy();
      expect(isEvery(4, 2)).toBeTruthy();
      expect(isEvery(5, 2)).toBeFalsy();
    });
  });

  describe('within', () => {
    test('returns number within range', () => {
      const generator = jest.fn().mockReturnValue(5);
      expect(within(generator, 1, 10)).toBe(5);
      expect(generator).toHaveBeenCalledTimes(1);
    });

    test('keeps trying until number is within range', () => {
      const generator = jest
        .fn()
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(11)
        .mockReturnValue(5);
      
      expect(within(generator, 1, 10)).toBe(5);
      expect(generator).toHaveBeenCalledTimes(3);
    });

    test('throws error if no number found within range after 1000 tries', () => {
      const generator = jest.fn().mockReturnValue(0);
      
      expect(() => within(generator, 1, 10)).toThrow('All generated numbers fell out of range');
      expect(generator).toHaveBeenCalledTimes(1000);
    });
  });
});
