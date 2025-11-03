import exec from './exec';
import {type ChartData } from '../components/chart/Chart';
import { type MetaState } from '../atoms/metaAtom';
import { type DistState } from '../atoms/distAtom';
import { type TypedInputs } from './inputs/inputs';
import { type CarryingCostSeries } from '../interfaces';
import { processSim, type SimulationResultsPayload, type Samples } from './processSim';

interface SimulateOptions {
  samples?: number;
  includeCarryingCosts?: boolean;
  setCarryingCostsLoading?: (value: boolean) => void;
  onRunStart?: (runId: number) => void;
  onRunComplete?: (runId: number) => void;
  setSimulationLoading?: (value: boolean) => void;
}

let nextRunId = 0;

// Multiple runs/samples.
// Simulating multiple scenarios for comparing buying vs. renting a property.
//  It takes inputs and runs them a child process, which returns results
//  that are used to calculate distribution bands and quantiles for the buy
//  and rent scenarios. The bands and quantiles are then used to set the dist
//  and data variables, which are used for visualization.
export default function simulate(
  inputs: TypedInputs,
  setMeta: (next: MetaState) => void,
  setDist: (next: DistState) => void,
  setData: (data: ChartData) => void,
  setCarryingCosts: (data: CarryingCostSeries) => void,
  options: SimulateOptions = {}
) {
  const {
    samples,
    includeCarryingCosts = true,
    setCarryingCostsLoading,
    onRunStart,
    onRunComplete,
    setSimulationLoading
  } = options;

  const runId = ++nextRunId;
  const child = exec(inputs, samples, runId);

  onRunStart?.(runId);
  setSimulationLoading?.(true);

  if (includeCarryingCosts) {
    setCarryingCostsLoading?.(true);
  } else {
    setCarryingCosts([]);
    setCarryingCostsLoading?.(false);
  }

  child.on('meta', setMeta);

  const handleResult = processSim(
    setDist,
    setData,
    includeCarryingCosts ? setCarryingCosts : undefined
  );

  type WorkerResultEvent = {
    samples: Samples;
    carryingCosts?: CarryingCostSeries;
    runId: number;
  };

  child.on('res', ({ samples: resultSamples, carryingCosts, runId: resultRunId }: WorkerResultEvent) => {
    if (resultRunId !== runId) {
      return;
    }

    const payload: SimulationResultsPayload = carryingCosts
      ? { samples: resultSamples, carryingCosts }
      : resultSamples;

    handleResult(payload);

    if (includeCarryingCosts && setCarryingCostsLoading) {
      setCarryingCostsLoading(false);
    }

    setSimulationLoading?.(false);
    onRunComplete?.(resultRunId);
  });
}
