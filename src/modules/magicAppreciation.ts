import clone from 'clone-deep';
import numbro from 'numbro';
import { INPUTS } from '../const';
import { type TypedInputs } from './inputs/inputs';
import { type Samples } from './processSim';
import {
  computeMedianDiff,
  formatPercent,
  formatCurrency,
  searchAppreciationBreakEven,
  type MagicAppreciationProgress,
  type MagicAppreciationResult,
  type SearchOptions,
  type EvaluateFn,
} from './magicAppreciationSearch';

// --- Helper Functions ---

const parsePercent = (value: string): number => {
  if (!value) return 0;
  if (value.includes(' - ')) {
    const parts = value.split(' - ').map((p) => (numbro.unformat(p.replace('%', '')) || 0) / 100);
    return (parts[0] + parts[1]) / 2;
  }
  const parsed = numbro.unformat(value.replace('%', ''));
  return (Number.isFinite(parsed) ? parsed! : 0) / 100;
};

const parseInteger = (value: string | number): number => {
  const parsed = Number(String(value).replace(/[^0-9.-]/g, ''));
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
      reject(err instanceof Error ? err : new Error('Worker error during magic find simulation.'));
    };

    const onAbort = () => {
      cleanup();
      try {
        worker.terminate();
      } catch (e) {}
      reject(new Error('Search aborted'));
    };

    const cleanup = () => {
      worker.removeEventListener('message', handleMessage as EventListener);
      worker.removeEventListener('error', handleError as EventListener);
      if (signal) signal.removeEventListener('abort', onAbort);
    };

    worker.addEventListener('message', handleMessage as EventListener);
    worker.addEventListener('error', handleError as EventListener);

    if (signal) {
      if (signal.aborted) {
        onAbort();
        return;
      }
      signal.addEventListener('abort', onAbort);
    }

    worker.postMessage({ inputs, samples });
  });
};

const createWorker = (): Worker => {
  // @ts-ignore import.meta is not available under CommonJS/Jest transpilation but is supported in the bundler.
  return new Worker(new URL('./run.ts', import.meta.url));
};

// --- Main Exported Function ---

export const findMagicAppreciation = async (
  form: TypedInputs,
  onProgress?: (update: MagicAppreciationProgress) => void,
  options: Partial<SearchOptions> = {},
  signal?: AbortSignal
): Promise<MagicAppreciationResult> => {
  const appreciationField = form.rates.house.appreciation as [string, INPUTS.PERCENT];
  const samplesField = form.scenarios.simulate.samples as [string, INPUTS.NUMBER];

  const baseRate = parsePercent(appreciationField[0]);
  const sampleCount = parseInteger(samplesField[0]);

  const worker = createWorker();
  if (signal?.aborted) {
    worker.terminate();
    throw new Error('Search aborted');
  }

  const evaluate: EvaluateFn = async (rateCandidate) => {
    const formattedRate = formatPercent(rateCandidate);
    const nextInputs = clone(form);
    nextInputs.rates.house.appreciation = [formattedRate, appreciationField[1]];

    if (signal?.aborted) throw new Error('Search aborted');

    const samples = await runWorkerSimulation(worker, nextInputs, Math.max(200, Math.min(sampleCount || 400, 800)), signal);
    const { diff, buyerMedian, renterMedian } = computeMedianDiff(samples);

    return { rate: rateCandidate, diff, formattedRate, buyerMedian, renterMedian };
  };

  try {
    const result = await searchAppreciationBreakEven(
      baseRate,
      evaluate,
      (update) => {
        if (signal?.aborted) {
          throw new Error('Search aborted');
        }

        onProgress?.({
          iteration: update.iteration,
          rate: update.rate,
          diff: update.diff,
          message: `Testing ${formatPercent(update.rate)} (Δ ${formatCurrency(update.diff)})`,
        });
      },
      options
    );

    onProgress?.({
      iteration: result.iteration,
      rate: result.rate,
      diff: result.medianDiff,
      message: `Found ${result.formattedRate} with Δ ${formatCurrency(result.medianDiff)}`,
    });

    return result;
  } finally {
    worker.terminate();
  }
};
