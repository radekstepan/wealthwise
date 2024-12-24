import { simCrash } from '../simCrash';
import { Random } from 'random-js';

describe('simCrash', () => {
  // Mock Random instance
  let mockRandom: jest.Mocked<Random>;
  
  beforeEach(() => {
    mockRandom = {
      bool: jest.fn(),
    } as unknown as jest.Mocked<Random>;
  });

  it('should return null when random.bool returns false', () => {
    mockRandom.bool.mockReturnValue(false);
    
    const opts = {
      scenarios: {
        crash: {
          chance: () => 0.5,
          drop: () => 0.3
        }
      }
    } as any;

    const result = simCrash({ random: mockRandom, opts });
    expect(result).toBeNull();
    expect(mockRandom.bool).toHaveBeenCalledWith(0.5);
  });

  it('should calculate crash value when random.bool returns true', () => {
    mockRandom.bool.mockReturnValue(true);
    
    const opts = {
      scenarios: {
        crash: {
          chance: () => 0.5,
          drop: () => 0.3
        }
      }
    } as any;

    const result = simCrash({ random: mockRandom, opts });
    expect(result).toBe(0.7); // 1 - 0.3
    expect(mockRandom.bool).toHaveBeenCalledWith(0.5);
  });

  it('should handle chance values greater than 1', () => {
    mockRandom.bool.mockReturnValue(true);
    
    const opts = {
      scenarios: {
        crash: {
          chance: () => 1.5,
          drop: () => 0.3
        }
      }
    } as any;

    const result = simCrash({ random: mockRandom, opts });
    expect(mockRandom.bool).toHaveBeenCalledWith(1); // Should be capped at 1
    expect(result).toBe(0.7);
  });

  it('should handle drop values greater than 1', () => {
    mockRandom.bool.mockReturnValue(true);
    
    const opts = {
      scenarios: {
        crash: {
          chance: () => 0.5,
          drop: () => 1.5
        }
      }
    } as any;

    const result = simCrash({ random: mockRandom, opts });
    expect(result).toBe(0); // 1 - 1 (capped at 1)
    expect(mockRandom.bool).toHaveBeenCalledWith(0.5);
  });

  it('should handle zero chance value', () => {
    mockRandom.bool.mockReturnValue(false);
    
    const opts = {
      scenarios: {
        crash: {
          chance: () => 0,
          drop: () => 0.3
        }
      }
    } as any;

    const result = simCrash({ random: mockRandom, opts });
    expect(result).toBeNull();
    expect(mockRandom.bool).toHaveBeenCalledWith(0);
  });
});
