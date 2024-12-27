import { processSim } from '../processSim';
import { type ChartData } from '../../components/chart/Chart';
import { type DistState } from '../../atoms/distAtom';

describe('processSim', () => {
  let setDist: jest.Mock<(next: DistState) => void>;
  let setData: jest.Mock<(data: ChartData) => void>;
  let mockSamples: any;

  beforeEach(() => {
    setDist = jest.fn();
    setData = jest.fn();
    
    mockSamples = [
      [
        {
          buyer: { $: 100000 },
          renter: { $: 50000 }
        },
        {
          buyer: { $: 150000 },
          renter: { $: 75000 }
        }
      ],
      [
        {
          buyer: { $: 120000 },
          renter: { $: 60000 }
        },
        {
          buyer: { $: 180000 },
          renter: { $: 90000 }
        }
      ],
      [
        {
          buyer: { $: 130000 },
          renter: { $: 65000 }
        },
        {
          buyer: { $: 160000 },
          renter: { $: 80000 }
        }
      ]
    ];
  });

  test('should calculate distribution bands using actual quantiles', () => {
    const handler = processSim(setDist, setData);
    handler(mockSamples);

    expect(setDist).toHaveBeenCalled();
    const distCall = setDist.mock.calls[0][0];
    
    // Verify bands structure
    expect(Array.isArray(distCall)).toBeTruthy();

    // Verify first band starts at min
    expect(distCall[0][0][0]).toBe(151000);
    
    // Verify last band ends at max
    const lastBand = distCall[distCall.length - 1];
    expect(lastBand[0][1]).toBeCloseTo(158714, 0);
  });

  test('should calculate chart data with accurate quantiles', () => {
    const handler = processSim(setDist, setData);
    handler(mockSamples);

    expect(setData).toHaveBeenCalled();
    const dataCall = setData.mock.calls[0][0];

    // Test structure
    expect(dataCall.length).toBe(3); // 3 quantiles (5%, 50%, 95%)
    expect(dataCall[0].length).toBe(2); // 2 years

    expect(dataCall[1][0].buyer.$).toBe(120000);
    expect(dataCall[1][0].renter.$).toBe(60000);
  });

  test('should handle larger datasets correctly', () => {
    // Generate larger dataset
    const largeSamples = Array.from({ length: 100 }, (_, i) => [
      {
        buyer: { $: 100000 + (i * 1000) },
        renter: { $: 50000 + (i * 500) }
      },
      {
        buyer: { $: 150000 + (i * 1000) },
        renter: { $: 75000 + (i * 500) }
      }
    ]) as any;

    const handler = processSim(setDist, setData);
    handler(largeSamples);

    const dataCall = setData.mock.calls[0][0];
    expect(dataCall[0].length).toBe(2); // Still 2 years
    expect(dataCall.length).toBe(3); // Still 3 quantiles
  });

  test('should maintain consistent band sizes', () => {
    const handler = processSim(setDist, setData);
    handler(mockSamples);

    const distCall = setDist.mock.calls[0][0];
    
    // Check that all bands have the same size
    const bandSizes = distCall.map(band => band[0][1] - band[0][0]);
    const firstBandSize = bandSizes[0];
    
    bandSizes.forEach(size => {
      expect(Math.abs(size - firstBandSize)).toBeLessThan(0.0001); // Account for floating point
    });
  });

  test('should handle outlier values correctly', () => {
    const samplesWithOutliers = [
      ...mockSamples,
      [
        {
          buyer: { $: 50000 }, // Low outlier
          renter: { $: 25000 }
        },
        {
          buyer: { $: 55000 },
          renter: { $: 27500 }
        }
      ],
      [
        {
          buyer: { $: 500000 }, // High outlier
          renter: { $: 250000 }
        },
        {
          buyer: { $: 550000 },
          renter: { $: 275000 }
        }
      ]
    ];

    const handler = processSim(setDist, setData);
    handler(samplesWithOutliers);

    const distCall = setDist.mock.calls[0][0];
    
    // Verify outliers don't break the distribution
    expect(distCall.every(band => 
      Number.isFinite(band[0][0]) && 
      Number.isFinite(band[0][1]) &&
      Number.isFinite(band[1])
    )).toBe(true);
  });
});
