import * as d3 from 'd3';
import { type Data, type CarryingCostSeries, type MonthlyCarryingCost } from '../interfaces';
import { CARRYING_COST_CATEGORIES } from './carryingCostConfig';

const median = (values: number[]): number => {
  if (!values.length) {
    return 0;
  }

  const sorted = values.slice().sort(d3.ascending);
  const val = d3.quantile(sorted, 0.5);
  return typeof val === 'number' && Number.isFinite(val) ? val : 0;
};

export const collectCarryingCostSeries = (samples: Array<Data>): CarryingCostSeries => {
  const monthBuckets = new Map<number, Array<MonthlyCarryingCost>>();

  for (const sample of samples) {
    for (const yearEntry of sample) {
      const monthly = yearEntry?.buyer?.house?.carryingCosts;
      if (!Array.isArray(monthly)) {
        continue;
      }

      for (const entry of monthly) {
        if (!entry || typeof entry.absoluteMonth !== 'number') {
          continue;
        }

        if (!monthBuckets.has(entry.absoluteMonth)) {
          monthBuckets.set(entry.absoluteMonth, []);
        }

        monthBuckets.get(entry.absoluteMonth)!.push(entry);
      }
    }
  }

  const sortedMonths = Array.from(monthBuckets.keys()).sort((a, b) => a - b);
  const series: CarryingCostSeries = [];

  for (const monthIndex of sortedMonths) {
    const entries = monthBuckets.get(monthIndex);
    if (!entries || !entries.length) {
      continue;
    }

    const baseline = entries[0];
    const components = {
      interest: 0,
      property_tax: 0,
      insurance: 0,
      maintenance: 0,
      hoa: 0,
      other: 0
    } as Record<typeof CARRYING_COST_CATEGORIES[number], number>;

    for (const category of CARRYING_COST_CATEGORIES) {
      const values = entries.map(entry => {
        const component = entry.components.find(item => item.category === category);
        return component ? component.amount : 0;
      });
      components[category] = median(values);
    }

    series.push({
      absoluteMonth: monthIndex,
      year: baseline.year,
      month: baseline.month,
      gross: median(entries.map(entry => entry.gross)),
      net: median(entries.map(entry => entry.net)),
      rent: median(entries.map(entry => entry.rent)),
      rentalIncome: median(entries.map(entry => entry.rentalIncome)),
      opportunityCost: median(entries.map(entry => entry.opportunityCost)),
      equityDelta: median(entries.map(entry => entry.equityDelta)),
      principal: median(entries.map(entry => entry.principal)),
      appreciation: median(entries.map(entry => entry.appreciation)),
      components
    });
  }

  return series;
};
