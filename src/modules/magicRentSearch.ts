import numbro from 'numbro';
import { type Samples } from './processSim';
import { type Data } from '../interfaces';

type EvaluateResult = {
  rent: number;
  diff: number;
  formattedRent: string;
  buyerMedian: number;
  renterMedian: number;
};

export interface MagicRentProgress {
  iteration: number;
  rent: number;
  diff: number;
  message: string;
}

export interface MagicRentResult {
  rent: number;
  formattedRent: string;
  medianDiff: number;
  buyerMedian: number;
  renterMedian: number;
  iteration: number;
}

export interface SearchOptions {
  tolerance: number;
  maxIterations: number;
  maxExpansionSteps: number;
  minRent: number;
  maxRent: number;
}

export const DEFAULT_OPTIONS: SearchOptions = {
  tolerance: 5_000,
  maxIterations: 12,
  maxExpansionSteps: 6,
  minRent: 300,
  maxRent: 25_000,
};

const formatConfig = {
  mantissa: 0,
  thousandSeparated: true,
  spaceSeparated: false,
};

export const formatCurrency = (value: number): string => {
  if (!Number.isFinite(value)) {
    return '$0';
  }

  const sign = value < 0 ? '-' : '';
  const abs = Math.abs(value);
  const body = numbro(abs).formatCurrency(formatConfig);

  return sign ? `${sign}${body}` : body;
};

const median = (values: number[]): number => {
  if (!values.length) {
    return 0;
  }

  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }

  return sorted[mid];
};

export const computeMedianDiff = (samples: Samples): {
  diff: number;
  buyerMedian: number;
  renterMedian: number;
} => {
  if (!samples?.length) {
    return { diff: 0, buyerMedian: 0, renterMedian: 0 };
  }

  const buyerTotals: number[] = [];
  const renterTotals: number[] = [];

  for (const sample of samples) {
    const terminal: Data[number] | undefined = sample[sample.length - 1];
    if (!terminal) {
      continue;
    }
    buyerTotals.push(terminal.buyer.$);
    renterTotals.push(terminal.renter.$);
  }

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
  rent: number;
  diff: number;
}

export type EvaluateFn = (rent: number) => Promise<EvaluateResult>;

export const searchRentBreakEven = async (
  initialRent: number,
  evaluate: EvaluateFn,
  progress?: (update: SearchProgress) => void,
  options: Partial<SearchOptions> = {}
): Promise<MagicRentResult> => {
  const cfg: SearchOptions = {
    ...DEFAULT_OPTIONS,
    ...options,
  };

  const tried = new Set<number>();
  let evaluations = 0;
  let best: EvaluateResult | null = null;

  const evaluateCandidate = async (candidate: number): Promise<EvaluateResult | null> => {
    const bounded = Math.min(cfg.maxRent, Math.max(cfg.minRent, Math.round(candidate)));
    if (tried.has(bounded)) {
      return null;
    }

    tried.add(bounded);
    evaluations += 1;

    const result = await evaluate(bounded);

    if (!best || Math.abs(result.diff) < Math.abs(best.diff)) {
      best = result;
    }

    progress?.({
      iteration: evaluations,
      rent: result.rent,
      diff: result.diff,
    });

    return result;
  };

  const first = await evaluateCandidate(initialRent);
  if (!first) {
    throw new Error('Failed to evaluate initial rent candidate.');
  }

  if (Math.abs(first.diff) <= cfg.tolerance) {
    return {
      rent: first.rent,
      formattedRent: first.formattedRent,
      medianDiff: first.diff,
      buyerMedian: first.buyerMedian,
      renterMedian: first.renterMedian,
      iteration: evaluations,
    };
  }

  let positive: EvaluateResult | null = first.diff >= 0 ? first : null;
  let negative: EvaluateResult | null = first.diff <= 0 ? first : null;

  const grow = async (start: EvaluateResult, factor: number, direction: 'up' | 'down'): Promise<void> => {
    let current = start;
    for (let step = 0; step < cfg.maxExpansionSteps; step++) {
      let nextRent = direction === 'up'
        ? current.rent * factor
        : current.rent / factor;

      if (direction === 'up') {
        nextRent = Math.max(current.rent + 25, nextRent);
      } else {
        nextRent = Math.min(current.rent - 25, nextRent);
      }

      const evaluated = await evaluateCandidate(nextRent);
      if (!evaluated) {
        break;
      }

      current = evaluated;

      if (Math.abs(current.diff) <= cfg.tolerance) {
        return;
      }

      if (current.diff >= 0 && (!positive || current.rent !== positive.rent)) {
        positive = current;
      }
      if (current.diff <= 0 && (!negative || current.rent !== negative.rent)) {
        negative = current;
      }

      const hasBracket = Boolean(positive && negative && positive.diff >= 0 && negative.diff <= 0);
      if (hasBracket) {
        break;
      }
    }
  };

  if (first.diff > 0) {
    positive = first;
    await grow(first, 1.35, 'up');
  } else {
    negative = first;
    await grow(first, 1.35, 'down');
  }

  if (!positive || !negative) {
    if (!best) {
      throw new Error('Unable to determine rent bracket.');
    }
    return {
      rent: best.rent,
      formattedRent: best.formattedRent,
      medianDiff: best.diff,
      buyerMedian: best.buyerMedian,
      renterMedian: best.renterMedian,
      iteration: evaluations,
    };
  }

  let iterations = 0;
  while (iterations < cfg.maxIterations) {
    iterations += 1;
    const candidateRent = Math.round((positive.rent + negative.rent) / 2);

    if (candidateRent === positive.rent || candidateRent === negative.rent) {
      break;
    }

    const evaluated = await evaluateCandidate(candidateRent);
    if (!evaluated) {
      break;
    }

    if (Math.abs(evaluated.diff) <= cfg.tolerance) {
      return {
        rent: evaluated.rent,
        formattedRent: evaluated.formattedRent,
        medianDiff: evaluated.diff,
        buyerMedian: evaluated.buyerMedian,
        renterMedian: evaluated.renterMedian,
        iteration: evaluations,
      };
    }

    if (evaluated.diff > 0) {
      positive = evaluated;
    } else {
      negative = evaluated;
    }
  }

  if (!best) {
    throw new Error('Unable to converge on break-even rent.');
  }

  return {
    rent: best.rent,
    formattedRent: best.formattedRent,
    medianDiff: best.diff,
    buyerMedian: best.buyerMedian,
    renterMedian: best.renterMedian,
    iteration: evaluations,
  };
};
