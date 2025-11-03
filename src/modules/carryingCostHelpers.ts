import * as d3 from 'd3';
import {
  type CarryingCostSeries,
  type CarryingCostSeriesPoint
} from '../interfaces';
import { CARRYING_COST_CATEGORIES } from './carryingCostConfig';

export const formatMonthLabel = (absoluteMonth: number): string => {
  if (absoluteMonth <= 0) {
    return 'Now';
  }

  const totalMonths = absoluteMonth + 1;
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;

  if (years === 0) {
    return `${months}m`;
  }

  if (months === 0) {
    return `${years}y`;
  }

  return `${years}y ${months}m`;
};

export const formatMonthLabelDetailed = (absoluteMonth: number): string => {
  if (absoluteMonth <= 0) {
    return 'Now';
  }

  const totalMonths = absoluteMonth + 1;
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;

  const parts: Array<string> = [];

  if (years > 0) {
    parts.push(`${years} ${years === 1 ? 'year' : 'years'}`);
  }

  if (months > 0) {
    parts.push(`${months} ${months === 1 ? 'month' : 'months'}`);
  }

  return parts.join(' · ');
};

export const smoothCarryingCostSeries = (
  series: CarryingCostSeries,
  windowSize: number
): CarryingCostSeries => {
  if (windowSize <= 1 || series.length <= 1) {
    return series;
  }

  return series.map((point, index) => {
    const start = Math.max(0, index - windowSize + 1);
    const window = series.slice(start, index + 1);
    const divisor = window.length || 1;

    const averagedComponents = {} as CarryingCostSeriesPoint['components'];
    for (const category of CARRYING_COST_CATEGORIES) {
      averagedComponents[category] = window.reduce((acc, item) => acc + item.components[category], 0) / divisor;
    }

    return {
      ...point,
      gross: window.reduce((acc, item) => acc + item.gross, 0) / divisor,
      net: window.reduce((acc, item) => acc + item.net, 0) / divisor,
      rent: window.reduce((acc, item) => acc + item.rent, 0) / divisor,
      rentalIncome: window.reduce((acc, item) => acc + item.rentalIncome, 0) / divisor,
      opportunityCost: window.reduce((acc, item) => acc + item.opportunityCost, 0) / divisor,
      equityDelta: window.reduce((acc, item) => acc + item.equityDelta, 0) / divisor,
      principal: window.reduce((acc, item) => acc + item.principal, 0) / divisor,
      appreciation: window.reduce((acc, item) => acc + item.appreciation, 0) / divisor,
      components: averagedComponents
    };
  });
};

export interface CarryingCostMetrics {
  peakGross: { value: number; month: number } | null;
  breakeven: { value: number; month: number } | null;
  averageGross: { value: number; months: number } | null;
}

export const calculateCarryingCostMetrics = (
  series: CarryingCostSeries,
  horizonMonths = 60
): CarryingCostMetrics => {
  if (!series.length) {
    return {
      peakGross: null,
      breakeven: null,
      averageGross: null
    };
  }

  const peakGrossEntry = series.reduce((prev, curr) => (curr.gross > prev.gross ? curr : prev));
  const breakevenEntry = series.find(point => (point.net + point.opportunityCost) <= point.rent) || null;
  const horizon = Math.min(series.length, horizonMonths);
  const averageGross = horizon > 0
    ? series.slice(0, horizon).reduce((acc, item) => acc + item.gross, 0) / horizon
    : 0;

  return {
    peakGross: peakGrossEntry ? { value: peakGrossEntry.gross, month: peakGrossEntry.absoluteMonth } : null,
  breakeven: breakevenEntry ? { value: breakevenEntry.net + breakevenEntry.opportunityCost, month: breakevenEntry.absoluteMonth } : null,
    averageGross: horizon > 0 ? { value: averageGross, months: horizon } : null
  };
};

export const trailingAverage = (
  series: Array<number>,
  windowSize: number
): number => {
  if (!series.length) {
    return 0;
  }
  const window = series.slice(-windowSize);
  if (!window.length) {
    return 0;
  }
  const divisor = window.length;
  return window.reduce((acc, value) => acc + value, 0) / divisor;
};

export const median = (values: number[]): number => {
  if (!values.length) {
    return 0;
  }
  const sorted = values.slice().sort(d3.ascending);
  const val = d3.quantile(sorted, 0.5);
  return typeof val === 'number' && Number.isFinite(val) ? val : 0;
};
