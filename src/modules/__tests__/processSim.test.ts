import { processSim, type Samples } from '../processSim';
import { type ChartData } from '../../components/chart/Chart';
import { type DistState } from '../../atoms/distAtom';
import { Province, type MonthlyCarryingCost } from '../../interfaces';

const makeMonthlyCost = (absoluteMonth: number, gross: number): MonthlyCarryingCost => {
  const equityDelta = gross * 0.4;
  return {
    absoluteMonth,
    year: Math.floor(absoluteMonth / 12),
    month: absoluteMonth % 12,
    gross,
    net: gross - equityDelta,
    rent: 1200,
    rentalIncome: 0,
    principal: equityDelta * 0.6,
    appreciation: equityDelta * 0.4,
    equityDelta,
    opportunityCost: gross * 0.05,
    components: [
      { category: 'interest', amount: gross * 0.5 },
      { category: 'property_tax', amount: gross * 0.2 },
      { category: 'insurance', amount: gross * 0.1 },
      { category: 'maintenance', amount: gross * 0.2 },
    ]
  };
};

describe('processSim', () => {
  let setDist: jest.Mock<(next: DistState) => void>;
  let setData: jest.Mock<(data: ChartData) => void>;
  let setCarryingCosts: jest.Mock;
  
  const getSamples = (n: number) => Array(n).fill(0).map<any>((_, i) => [
    {
      buyer: {
        $: 150000 + (i * 1000),
        roi: 0,
        province: Province.BC,
        portfolio: { $: 0, costs: 0, value: 0, capitalGainsTaxRate: 0 },
        house: {
          $: 0,
          costs: 0,
          value: 0,
          equity: 0,
          rentPaid: 0,
          rentalIncomeReceived: 0,
          interestPaid: 0,
          principalPaid: 0,
          principalRemaining: 0,
          monthlyExpensesPaid: 0,
          movingCostsPaid: 0,
          capitalGainsTaxRate: 0,
          carryingCosts: [makeMonthlyCost(0, 900 + i * 10)]
        }
      },
      renter: {
        $: 75000 + (i * 500),
        roi: 0,
        province: Province.BC,
        portfolio: { $: 0, costs: 0, value: 0, capitalGainsTaxRate: 0 },
        house: { $: 0, rentPaid: 0 }
      }
    },
    {
      buyer: {
        $: 200000 + (i * 1000),
        roi: 0,
        province: Province.BC,
        portfolio: { $: 0, costs: 0, value: 0, capitalGainsTaxRate: 0 },
        house: {
          $: 0,
          costs: 0,
          value: 0,
          equity: 0,
          rentPaid: 0,
          rentalIncomeReceived: 0,
          interestPaid: 0,
          principalPaid: 0,
          principalRemaining: 0,
          monthlyExpensesPaid: 0,
          movingCostsPaid: 0,
          capitalGainsTaxRate: 0,
          carryingCosts: [makeMonthlyCost(12, 1000 + i * 10)]
        }
      },
      renter: {
        $: 100000 + (i * 500),
        roi: 0,
        province: Province.BC,
        portfolio: { $: 0, costs: 0, value: 0, capitalGainsTaxRate: 0 },
        house: { $: 0, rentPaid: 0 }
      }
    }
  ]);

  beforeEach(() => {
    setDist = jest.fn();
    setData = jest.fn();
    setCarryingCosts = jest.fn();
  });

  test('skips carrying cost aggregation when setter is omitted', () => {
    const handler = processSim(setDist, setData);
    expect(() => handler(getSamples(10) as Samples)).not.toThrow();

    expect(setData).toHaveBeenCalled();
  });

  test('should calculate distribution bands using actual quantiles', () => {
    const handler = processSim(setDist, setData, setCarryingCosts);
    handler(getSamples(100));

    expect(setDist).toHaveBeenCalled();
    const distCall = setDist.mock.calls[0][0];
    
    // Verify bands structure
    expect(Array.isArray(distCall)).toBeTruthy();

    // Verify first band starts at min
    expect(distCall[0][0][0]).toBe(204950);
    
    // Verify last band ends at max
    const lastBand = distCall[distCall.length - 1];
    expect(lastBand[0][1]).toBeCloseTo(294050, 0);
  });

  test('should calculate chart data with accurate quantiles', () => {
    const handler = processSim(setDist, setData, setCarryingCosts);
    handler(getSamples(100));

    expect(setData).toHaveBeenCalled();
    const dataCall = setData.mock.calls[0][0];

    // Test structure
    expect(dataCall.length).toBe(3); // 3 quantiles (5%, 50%, 95%)
    expect(dataCall[0].length).toBe(2); // 2 years

    expect(dataCall[1][0].buyer.$).toBe(200000);
    expect(dataCall[1][0].renter.$).toBe(100000);
  });

  test('should handle a small dataset correctly', () => {
    const handler = processSim(setDist, setData, setCarryingCosts);
    handler(getSamples(2));

    expect(setDist).toHaveBeenCalled();
    const distCall = setDist.mock.calls[0][0];

    expect(distCall).toBeNull();

    expect(setData).toHaveBeenCalled();
    const dataCall = setData.mock.calls[0][0];

    // Test structure
    expect(dataCall.length).toBe(3); // 3 quantiles (5%, 50%, 95%)
    expect(dataCall[0].length).toBe(2); // 2 years

    expect(dataCall[1][0].buyer.$).toBe(151000);
    expect(dataCall[1][0].renter.$).toBe(75500);
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

  const handler = processSim(setDist, setData, setCarryingCosts);
    handler(largeSamples);

    const dataCall = setData.mock.calls[0][0];
    expect(dataCall[0].length).toBe(2); // Still 2 years
    expect(dataCall.length).toBe(3); // Still 3 quantiles
  });

  test('should maintain consistent band sizes', () => {
    const handler = processSim(setDist, setData, setCarryingCosts);
    handler(getSamples(100));

    const distCall = setDist.mock.calls[0][0];
    
    // Check that all bands have the same size
  const bandSizes = (distCall as any[]).map((band: any) => band[0][1] - band[0][0]);
  const firstBandSize = bandSizes[0];
    
  bandSizes.forEach((size: number) => {
      expect(Math.abs(size - firstBandSize)).toBeLessThan(0.0001); // Account for floating point
    });
  });

  test('should handle outlier values correctly', () => {
    const samplesWithOutliers = [
      ...getSamples(98),
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

  const handler = processSim(setDist, setData, setCarryingCosts);
    handler(samplesWithOutliers);

    const distCall = setDist.mock.calls[0][0];
    
    // Verify outliers don't break the distribution
    expect((distCall as any[]).every((band: any) => 
      Number.isFinite(band[0][0]) && 
      Number.isFinite(band[0][1]) &&
      Number.isFinite(band[1])
    )).toBe(true);
  });
  test('should aggregate carrying cost series', () => {
    const handler = processSim(setDist, setData, setCarryingCosts);
    handler(getSamples(10));

    expect(setCarryingCosts).toHaveBeenCalled();
    const series = setCarryingCosts.mock.calls[0][0];

    expect(Array.isArray(series)).toBe(true);
    expect(series.length).toBeGreaterThan(0);
    expect(series[0].components.interest).toBeGreaterThan(0);
  });

  test('uses pre-aggregated carrying costs when provided', () => {
    const handler = processSim(setDist, setData, setCarryingCosts);
    const samples = getSamples(5) as Samples;
    const preAggregated = [{
      absoluteMonth: 0,
      year: 0,
      month: 0,
      gross: 1000,
      net: 800,
      rent: 1200,
      rentalIncome: 0,
      opportunityCost: 50,
      equityDelta: 200,
      principal: 120,
      appreciation: 80,
      components: {
        interest: 400,
        property_tax: 200,
        insurance: 100,
        maintenance: 150,
        hoa: 100,
        other: 50
      }
    }];

    handler({ samples, carryingCosts: preAggregated });

    expect(setCarryingCosts).toHaveBeenCalledWith(preAggregated);
  });
});
