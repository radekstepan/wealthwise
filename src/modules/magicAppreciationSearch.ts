import numbro from 'numbro';
import { type Samples } from './processSim';

type EvaluateResult = {
  rate: number;
  diff: number; // Renter Net Worth - Buyer Net Worth
  formattedRate: string;
  buyerMedian: number;
  renterMedian: number;
};

export interface MagicAppreciationProgress {
  iteration: number;
  rate: number;
  diff: number;
  message: string;
}

export interface MagicAppreciationResult {
  rate: number;
  formattedRate: string;
  medianDiff: number;
  buyerMedian: number;
  renterMedian: number;
  iteration: number;
}

export interface SearchOptions {
  tolerance: number;
  maxIterations: number;
  maxExpansionSteps: number;
  minRate: number;
  maxRate: number;
}

export const DEFAULT_OPTIONS: SearchOptions = {
  tolerance: 5_000,
  maxIterations: 12,
  maxExpansionSteps: 6,
  minRate: -0.15,
  maxRate: 0.25,
};

export const formatPercent = (value: number): string => {
  if (!Number.isFinite(value)) {
    return '0.00%';
  }
  return numbro(value).format({ output: 'percent', mantissa: 2 });
};

export const formatCurrency = (value: number): string => {
  if (!Number.isFinite(value)) {
    return '$0';
  }
  const sign = value < 0 ? '-' : '';
  const body = numbro(Math.abs(value)).formatCurrency({ mantissa: 0, thousandSeparated: true });
  return `${sign}${body}`;
};

const median = (values: number[]): number => {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
};

export const computeMedianDiff = (samples: Samples): {
  diff: number;
  buyerMedian: number;
  renterMedian: number;
} => {
  if (!samples?.length) {
    return { diff: 0, buyerMedian: 0, renterMedian: 0 };
  }

  const buyerTotals = samples.map((s) => s[s.length - 1]?.buyer.$ || 0);
  const renterTotals = samples.map((s) => s[s.length - 1]?.renter.$ || 0);
  const buyerMedian = median(buyerTotals);
  const renterMedian = median(renterTotals);

  return {
    diff: renterMedian - buyerMedian,
    buyerMedian,
    renterMedian,
  };
};

export interface SearchProgress {
  iteration: number;
  rate: number;
  diff: number;
}

export type EvaluateFn = (rate: number) => Promise<EvaluateResult>;

export const searchAppreciationBreakEven = async (
  initialRate: number,
  evaluate: EvaluateFn,
  progress?: (update: SearchProgress) => void,
  options: Partial<SearchOptions> = {}
): Promise<MagicAppreciationResult> => {
  const cfg: SearchOptions = { ...DEFAULT_OPTIONS, ...options };
  const tried = new Set<number>();
  let evaluations = 0;
  let best: EvaluateResult | null = null;

  const evaluateCandidate = async (candidate: number): Promise<EvaluateResult | null> => {
    const bounded = Math.min(cfg.maxRate, Math.max(cfg.minRate, candidate));
    const rounded = Math.round(bounded * 10000) / 10000; // Round to 4 decimal places
    if (tried.has(rounded)) return null;
    tried.add(rounded);
    evaluations += 1;

    const result = await evaluate(rounded);
    if (!best || Math.abs(result.diff) < Math.abs(best.diff)) best = result;
    progress?.({ iteration: evaluations, rate: result.rate, diff: result.diff });
    return result;
  };

  const first = await evaluateCandidate(initialRate);
  if (!first) throw new Error('Failed to evaluate initial appreciation rate.');
  if (Math.abs(first.diff) <= cfg.tolerance) return { ...first, medianDiff: first.diff, iteration: evaluations };

  let positive: EvaluateResult | null = first.diff >= 0 ? first : null;
  let negative: EvaluateResult | null = first.diff <= 0 ? first : null;

  const grow = async (start: EvaluateResult, step: number, direction: 'up' | 'down') => {
    let current = start;
    for (let i = 0; i < cfg.maxExpansionSteps; i++) {
      const nextRate = current.rate + (direction === 'up' ? step : -step);
      const evaluated = await evaluateCandidate(nextRate);
      if (!evaluated) break;
      current = evaluated;
      if (current.diff >= 0) positive = current;
      if (current.diff <= 0) negative = current;
      if (positive && negative) break;
    }
  };

  if (first.diff > 0) await grow(first, 0.02, 'down');
  else await grow(first, 0.02, 'up');

  if (!positive || !negative) {
    if (first.diff > 0) await grow(first, 0.02, 'up');
    else await grow(first, 0.02, 'down');
  }

  if (!positive || !negative) {
    if (!best) throw new Error('Unable to determine appreciation rate bracket.');
    return { ...best, medianDiff: best.diff, iteration: evaluations };
  }

  for (let i = 0; i < cfg.maxIterations; i++) {
    const midRate = (positive.rate + negative.rate) / 2;
    if (midRate === positive.rate || midRate === negative.rate) break;

    const evaluated = await evaluateCandidate(midRate);
    if (!evaluated) break;
    if (Math.abs(evaluated.diff) <= cfg.tolerance) return { ...evaluated, medianDiff: evaluated.diff, iteration: evaluations };

    if (evaluated.diff > 0) positive = evaluated;
    else negative = evaluated;
  }

  if (!best) throw new Error('Unable to converge on break-even rate.');
  return { ...best, medianDiff: best.diff, iteration: evaluations };
};
