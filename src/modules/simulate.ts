import exec from './exec';
import {type ChartData } from '../components/chart/Chart';
import { type MetaState } from '../atoms/metaAtom';
import { type DistState } from '../atoms/distAtom';
import { type TypedInputs } from './inputs/inputs';
import { processSim } from './processSim';

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
  setData: (data: ChartData) => void
) {
  const child = exec(inputs);

  child.on('meta', setMeta);

  child.on('res', processSim(setDist, setData));
}
