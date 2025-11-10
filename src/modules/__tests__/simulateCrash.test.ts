import { simulateCrash } from '../simulate/simulateCrash';
import { Random } from 'random-js';
import parse, { type ParsedInputs } from '../inputs/parse';
import { type TypedInputs } from '../inputs/inputs';

jest.mock('random-js');
jest.mock('../inputs/parse');

const mockedParse = parse as jest.MockedFunction<typeof parse>;

const createMockRandom = (boolValues: boolean[]) => {
  let index = 0;
  return {
    bool: jest.fn(() => boolValues[index++] ?? boolValues[boolValues.length - 1]),
  } as unknown as Random;
};

describe('simulateCrash', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns null when crash does not trigger', () => {
    const random = createMockRandom([false]);

    const opts = {
      scenarios: {
        crash: {
          chance: () => 0,
          drop: () => 0.5,
        },
      },
    } as unknown as ParsedInputs<TypedInputs>;

    const result = simulateCrash({ random, opts });
    expect(result).toBeNull();
  });

  it('returns correct drop factor when crash triggers', () => {
    const random = createMockRandom([true]);

    const opts = {
      scenarios: {
        crash: {
          chance: () => 1,
          drop: () => 0.3,
        },
      },
    } as unknown as ParsedInputs<TypedInputs>;

    const result = simulateCrash({ random, opts });
    expect(result).toBeCloseTo(0.7);
  });

  it('caps chance and drop at 1', () => {
    const random = createMockRandom([true]);

    const opts = {
      scenarios: {
        crash: {
          chance: () => 2, // should be capped to 1
          drop: () => 2,   // should be capped to 1
        },
      },
    } as unknown as ParsedInputs<TypedInputs>;

    const result = simulateCrash({ random, opts });
    // chance() > 1 still allows triggering when bool(true) is returned
    // drop() > 1 becomes 1, so (1 - 1) = 0
    expect(result).toBe(0);
  });
});
