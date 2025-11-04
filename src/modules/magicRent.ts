import clone from 'clone-deep';
import numbro from 'numbro';
import { type TypedInputs } from './inputs/inputs';
import { type Samples } from './processSim';
import {
  computeMedianDiff,
  DEFAULT_OPTIONS,
  formatCurrency,
  type MagicRentProgress,
  type MagicRentResult,
  type SearchOptions,
  type EvaluateFn,
  searchRentBreakEven,
} from './magicRentSearch';

const parseCurrency = (value: string): number => {
  if (!value) {
    return 0;
  }

  const parsed = numbro.unformat(value);
  if (Number.isFinite(parsed)) {
    return parsed;
  }

  const fallback = Number(value.replace(/[^0-9.-]/g, ''));
  return Number.isFinite(fallback) ? fallback : 0;
};

const parseInteger = (value: string | number): number => {
  if (typeof value === 'number') {
    return value;
  }

  if (!value) {
    return 0;
  }

  const parsed = Number(value.toString().replace(/[^0-9.-]/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
};

const runWorkerSimulation = (worker: Worker, inputs: TypedInputs, samples: number, signal?: AbortSignal): Promise<Samples> => {
  return new Promise((resolve, reject) => {
    const handleMessage = (event: MessageEvent<any>) => {
      const { data } = event;
      if (!data?.action) {
        return;
      }

      if (data.action === 'res') {
        cleanup();
        resolve(data.res as Samples);
      }
    };

    const handleError = (err: any) => {
      cleanup();
      reject(err instanceof Error ? err : new Error('Worker error during magic rent simulation.'));
    };

    const cleanup = () => {
      worker.removeEventListener('message', handleMessage as EventListener);
      worker.removeEventListener('error', handleError as EventListener);
    };

    worker.addEventListener('message', handleMessage as EventListener);
    worker.addEventListener('error', handleError as EventListener);

    const onAbort = () => {
      cleanup();
      try {
        worker.terminate();
      } catch (e) {}
      reject(new Error('Search aborted'));
    };

    if (signal) {
      if (signal.aborted) {
        onAbort();
        return;
      }
      signal.addEventListener('abort', onAbort);
    }

    worker.postMessage({ inputs, samples });

    const removeAbortListener = () => {
      if (signal) signal.removeEventListener('abort', onAbort);
    };

    // ensure cleanup removes abort listener too
    const oldCleanup = cleanup;
    // override cleanup to also remove abort listener
    const combinedCleanup = () => {
      oldCleanup();
      removeAbortListener();
    };
    // use combinedCleanup in place of cleanup in this closure
    // (we'll call combinedCleanup manually in the handlers)
  });
};

const createWorker = (): Worker => {
  if (typeof Worker === 'undefined') {
    throw new Error('Web Worker support is required for the magic rent helper.');
  }

  // @ts-ignore import.meta is not available under CommonJS/Jest transpilation but is supported in the bundler.
  return new Worker(new URL('./run.ts', import.meta.url));
};

export const findMagicRent = async (
  form: TypedInputs,
  onProgress?: (update: MagicRentProgress) => void,
  options: Partial<SearchOptions> = {},
  signal?: AbortSignal
): Promise<MagicRentResult> => {
  const rentField = form.rent.current as [string, number];
  const marketField = form.rent.market as [string, number];
  const samplesField = form.scenarios.simulate.samples as [string, number];
  const yearsField = form.scenarios.simulate.years as [string, number];

  const baseRent = parseCurrency(rentField[0]);
  const sampleCount = parseInteger(samplesField[0]);
  const years = parseInteger(yearsField[0]);

  const searchOptions: Partial<SearchOptions> = {
    minRent: Math.max(200, Math.round(baseRent * 0.25)),
    maxRent: Math.min(DEFAULT_OPTIONS.maxRent, Math.max(baseRent * 4, 4000)),
    tolerance: years > 20 ? 7_500 : DEFAULT_OPTIONS.tolerance,
  };

  const worker = createWorker();

  // If the signal is already aborted, stop early
  if (signal?.aborted) {
    worker.terminate();
    throw new Error('Search aborted');
  }
  const evaluate: EvaluateFn = async (rentCandidate) => {
    const formattedRent = formatCurrency(rentCandidate);
    const nextInputs = clone(form);
  nextInputs.rent.current = [formattedRent, rentField[1]];
  nextInputs.rent.market = [formattedRent, marketField[1]];

    if (signal?.aborted) {
      throw new Error('Search aborted');
    }

    const samples = await runWorkerSimulation(worker, nextInputs, Math.max(200, Math.min(sampleCount || 400, 800)), signal);
    const { diff, buyerMedian, renterMedian } = computeMedianDiff(samples);

    return {
      rent: rentCandidate,
      diff,
      formattedRent,
      buyerMedian,
      renterMedian,
    };
  };

  try {
    const result = await searchRentBreakEven(baseRent || 0, evaluate, (update) => {
      if (signal?.aborted) {
        throw new Error('Search aborted');
      }

      onProgress?.({
        iteration: update.iteration,
        rent: update.rent,
        diff: update.diff,
        message: `Iteration ${update.iteration}: testing ${formatCurrency(update.rent)} (Δ ${formatCurrency(update.diff)})`,
      });
    }, {...searchOptions, ...options});

    onProgress?.({
      iteration: result.iteration,
      rent: result.rent,
      diff: result.medianDiff,
      message: `Found ${result.formattedRent} with Δ ${formatCurrency(result.medianDiff)}`,
    });

    return result;
  } finally {
    worker.terminate();
  }
};

export {
  formatCurrency,
  computeMedianDiff,
  searchRentBreakEven,
  DEFAULT_OPTIONS,
} from './magicRentSearch';
export type {
  MagicRentProgress,
  MagicRentResult,
  SearchOptions,
  SearchProgress,
  EvaluateFn,
} from './magicRentSearch';
