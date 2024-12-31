import { distAtom, type DistState } from '../distAtom';

describe('distAtom', () => {
  it('should initialize', () => {
    const initialValue = distAtom.init;
    expect(initialValue).toBeNull();
  });

  it('should match the DistState type structure', () => {
    const sampleData: DistState = [
      [[0, 10], 5],
      [[11, 20], 3],
      [[21, 30], 7]
    ];
    
    const atomValue: DistState = sampleData;
    expect(Array.isArray(atomValue)).toBe(true);
    
    atomValue.forEach(band => {
      const [range, count] = band;
      expect(Array.isArray(range)).toBe(true);
      expect(range).toHaveLength(2);
      expect(typeof range[0]).toBe('number');
      expect(typeof range[1]).toBe('number');
      expect(typeof count).toBe('number');
    });
  });
});
