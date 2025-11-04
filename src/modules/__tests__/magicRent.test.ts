import { computeMedianDiff, formatCurrency, searchRentBreakEven, type SearchProgress } from '../magicRentSearch';
import { type Samples } from '../processSim';

const makeSample = (buyer: number, renter: number) => ([{
  year: 0,
  buyer: { $: buyer } as any,
  renter: { $: renter } as any,
}] as any);

describe('magicRent helpers', () => {
  test('computeMedianDiff returns median buyer and renter balances', () => {
    const samples: Samples = [
      makeSample(100_000, 102_000),
      makeSample(110_000, 111_000),
      makeSample(120_000, 119_000),
    ];

    const { diff, buyerMedian, renterMedian } = computeMedianDiff(samples);

    expect(buyerMedian).toBe(110_000);
    expect(renterMedian).toBe(111_000);
    expect(diff).toBe(1_000);
  });

  test('formatCurrency renders positive and negative values', () => {
    expect(formatCurrency(0)).toBe('$0');
    expect(formatCurrency(1_234)).toBe('$1,234');
    expect(formatCurrency(-9_876)).toBe('-$9,876');
  });

  test('searchRentBreakEven converges near the target rent', async () => {
    const targetRent = 2_200;
    const scale = 100;
    const evaluate = async (rent: number) => {
      const diff = (targetRent - rent) * scale;
      return {
        rent,
        diff,
        formattedRent: `$${rent}`,
        buyerMedian: 500_000,
        renterMedian: 500_000 + diff,
      };
    };

    const progressUpdates: SearchProgress[] = [];

    const result = await searchRentBreakEven(
      2_000,
      evaluate,
      (update) => progressUpdates.push(update),
      {
        tolerance: 5_000,
        maxIterations: 10,
        maxExpansionSteps: 5,
        minRent: 500,
        maxRent: 5_000,
      }
    );

  expect(Math.abs(result.rent - targetRent)).toBeLessThanOrEqual(50);
  expect(Math.abs(result.medianDiff)).toBeLessThanOrEqual(5_000);
    expect(progressUpdates.length).toBeGreaterThan(0);
  });

  test('searchRentBreakEven returns best guess when bracket is not found', async () => {
    const evaluate = async (rent: number) => ({
      rent,
      diff: 10_000,
      formattedRent: `$${rent}`,
      buyerMedian: 400_000,
      renterMedian: 410_000,
    });

    const result = await searchRentBreakEven(1_500, evaluate, undefined, {
      tolerance: 5_000,
      maxIterations: 5,
      maxExpansionSteps: 3,
      minRent: 500,
      maxRent: 3_000,
    });

    expect(result.rent).toBeGreaterThan(0);
    expect(result.medianDiff).toBe(10_000);
  });
});
