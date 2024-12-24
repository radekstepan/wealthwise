import { dataAtom } from '../dataAtom';

describe('dataAtom', () => {
  it('should initialize with three empty arrays', () => {
    const initialValue = dataAtom.init;
    
    expect(Array.isArray(initialValue)).toBe(true);
    expect(initialValue).toHaveLength(3);
    expect(initialValue[0]).toEqual([]);
    expect(initialValue[1]).toEqual([]);
    expect(initialValue[2]).toEqual([]);
  });
});
