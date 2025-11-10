import { distAtom, type DistState, type DistData } from '../distAtom';

describe('distAtom', () => {
  it('should initialize with null', () => {
    const initialValue = distAtom.init;
    expect(initialValue).toBeNull();
  });

  it('should match the new DistState type structure', () => {
    const sampleData: DistData = {
      buyer: [1000, 2000, 3000],
      renter: [1500, 2500, 3500],
    };
    
    const state: DistState = sampleData;

    expect(state).not.toBeNull();
    if (state) {
      expect(state).toHaveProperty('buyer');
      expect(state).toHaveProperty('renter');
      expect(Array.isArray(state.buyer)).toBe(true);
      expect(Array.isArray(state.renter)).toBe(true);
      expect(state.buyer.length).toBe(3);
      expect(typeof state.renter[0]).toBe('number');
    }
  });
});
