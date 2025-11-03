import {
  calculateCarryingCostMetrics,
  formatMonthLabel,
  formatMonthLabelDetailed,
  median,
  smoothCarryingCostSeries,
  trailingAverage
} from '../carryingCostHelpers';
import { type CarryingCostSeriesPoint } from '../../interfaces';

const defaultComponents = {
  interest: 500,
  property_tax: 200,
  insurance: 100,
  maintenance: 80,
  hoa: 50,
  other: 10
} as const;

const createPoint = (overrides: Partial<CarryingCostSeriesPoint> = {}): CarryingCostSeriesPoint => {
  const base: CarryingCostSeriesPoint = {
    absoluteMonth: 0,
    year: 0,
    month: 0,
    gross: 0,
    net: 0,
    rent: 0,
    rentalIncome: 0,
    opportunityCost: 0,
    equityDelta: 0,
    principal: 0,
    appreciation: 0,
    components: { ...defaultComponents }
  };

  Object.assign(base, overrides);
  base.components = { ...defaultComponents, ...(overrides.components ?? {}) };

  return base;
};

describe('smoothCarryingCostSeries', () => {
  it('returns the original reference when smoothing is a no-op', () => {
    const series = [createPoint({ absoluteMonth: 0, gross: 1200 })];
    expect(smoothCarryingCostSeries(series, 0)).toBe(series);
    expect(smoothCarryingCostSeries(series, 1)).toBe(series);
  });

  it('applies a trailing average across values and components', () => {
    const series = [
      createPoint({
        absoluteMonth: 0,
        gross: 1000,
        net: 700,
        rent: 1200,
        rentalIncome: 100,
        opportunityCost: 60,
        equityDelta: 300,
        principal: 200,
        appreciation: 100,
        components: {
          interest: 500,
          property_tax: 200,
          insurance: 100,
          maintenance: 80,
          hoa: 50,
          other: 10
        }
      }),
      createPoint({
        absoluteMonth: 1,
        gross: 1100,
        net: 750,
        rent: 1210,
        rentalIncome: 90,
        opportunityCost: 70,
        equityDelta: 320,
        principal: 210,
        appreciation: 110,
        components: {
          interest: 520,
          property_tax: 220,
          insurance: 105,
          maintenance: 90,
          hoa: 55,
          other: 12
        }
      }),
      createPoint({
        absoluteMonth: 2,
        gross: 1300,
        net: 900,
        rent: 1220,
        rentalIncome: 80,
        opportunityCost: 90,
        equityDelta: 350,
        principal: 230,
        appreciation: 120,
        components: {
          interest: 540,
          property_tax: 240,
          insurance: 110,
          maintenance: 100,
          hoa: 60,
          other: 14
        }
      })
    ];

    const smoothed = smoothCarryingCostSeries(series, 2);

    expect(smoothed).toHaveLength(3);
    expect(smoothed[0].gross).toBeCloseTo(1000);
    expect(smoothed[1].gross).toBeCloseTo((1000 + 1100) / 2);
    expect(smoothed[1].net).toBeCloseTo((700 + 750) / 2);
    expect(smoothed[1].components.interest).toBeCloseTo((500 + 520) / 2);
    expect(smoothed[2].gross).toBeCloseTo((1100 + 1300) / 2);
    expect(smoothed[2].components.property_tax).toBeCloseTo((220 + 240) / 2);

    // Ensure the source series was not mutated.
    expect(series[1].gross).toBe(1100);
    expect(series[1].components.interest).toBe(520);
  });
});

describe('calculateCarryingCostMetrics', () => {
  it('returns null metrics when the series is empty', () => {
    expect(calculateCarryingCostMetrics([])).toEqual({
      peakGross: null,
      breakeven: null,
      averageGross: null
    });
  });

  it('identifies peak gross, breakeven, and average gross correctly', () => {
    const series = [
      createPoint({ absoluteMonth: 0, gross: 1000, net: 1050, rent: 1000 }),
      createPoint({ absoluteMonth: 1, gross: 2000, net: 1800, rent: 1200 }),
      createPoint({ absoluteMonth: 2, gross: 1800, net: 900, rent: 950 }),
      createPoint({ absoluteMonth: 3, gross: 1700, net: 1400, rent: 1600 })
    ];

    const metrics = calculateCarryingCostMetrics(series);

    expect(metrics.peakGross).toEqual({ value: 2000, month: 1 });
    expect(metrics.breakeven).toEqual({ value: 900, month: 2 });
    expect(metrics.averageGross).toEqual({ value: 1625, months: 4 });
  });

  it('respects the requested averaging horizon', () => {
    const series = [
      createPoint({ absoluteMonth: 0, gross: 1000, net: 950, rent: 1200 }),
      createPoint({ absoluteMonth: 1, gross: 2000, net: 1800, rent: 1500 }),
      createPoint({ absoluteMonth: 2, gross: 1800, net: 1500, rent: 1400 })
    ];

    const metrics = calculateCarryingCostMetrics(series, 2);

    expect(metrics.averageGross).toEqual({ value: 1500, months: 2 });
  });

  it('treats opportunity cost as part of the breakeven comparison', () => {
    const series = [
      createPoint({ absoluteMonth: 0, gross: 1500, net: 900, rent: 1000, opportunityCost: 200 }),
      createPoint({ absoluteMonth: 1, gross: 1400, net: 800, rent: 1000, opportunityCost: 100 })
    ];

    const metrics = calculateCarryingCostMetrics(series);

    expect(metrics.breakeven).toEqual({ value: 900, month: 1 });
  });
});

describe('trailingAverage', () => {
  it('averages the last N values and handles windows larger than the series', () => {
    expect(trailingAverage([1, 3, 5, 7], 2)).toBeCloseTo((5 + 7) / 2);
    expect(trailingAverage([1, 3, 5, 7], 10)).toBeCloseTo((1 + 3 + 5 + 7) / 4);
    expect(trailingAverage([], 3)).toBe(0);
  });
});

describe('median', () => {
  it('returns the median for odd and even-sized collections', () => {
    expect(median([5, 1, 9])).toBe(5);
    expect(median([5, 1, 9, 7])).toBe(6);
    expect(median([])).toBe(0);
  });
});

describe('formatMonthLabel', () => {
  it('formats condensed month labels', () => {
    expect(formatMonthLabel(0)).toBe('Now');
    expect(formatMonthLabel(5)).toBe('6m');
    expect(formatMonthLabel(11)).toBe('1y');
    expect(formatMonthLabel(14)).toBe('1y 3m');
  });
});

describe('formatMonthLabelDetailed', () => {
  it('formats detailed month labels', () => {
    expect(formatMonthLabelDetailed(0)).toBe('Now');
    expect(formatMonthLabelDetailed(5)).toBe('6 months');
    expect(formatMonthLabelDetailed(11)).toBe('1 year');
    expect(formatMonthLabelDetailed(14)).toBe('1 year · 3 months');
  });
});
