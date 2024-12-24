import { Random } from "random-js";
import { range } from "./utils";
import parse, { type ParsedInputs } from './inputs/parse';
import { type TypedInputs } from "./inputs/inputs";
import { type Data } from "./run/interfaces";
import { initSim } from "./run/initSim";
import { emitMeta } from "./run/emitMeta";
import { simYear } from "./run/simYear";

const SAMPLES = 1000; // number of samples

// A single random simulation run.
function run(opts: ParsedInputs<TypedInputs>, emitMetaState: boolean): Data {
  const rnd = new Random();

  let init = initSim(opts);

  if (emitMetaState) {
    emitMeta.call(self, init);
  }

  // Data for each year.
  const data: Data = [];

  for (const year of range(init.simulateYears)) {
    const {yearData, updatedValues} = simYear(year, init, opts, rnd);
    data.push(yearData);
    // Update init with the new values for the next iteration.
    init = {...init, ...updatedValues};
  }

  if (init.mortgage.balance && init.simulateYears >= init.amortization) {
    throw new Error("Mortgage has not been paid off");
  }

  return data;
}

self.onmessage = ({data: {inputs, samples}}: {
  data: {inputs: TypedInputs, samples: number}
}) => {
  const opts = parse(inputs);
  const res = range(samples || SAMPLES).map((i) => run(opts, !i));

  self.postMessage({action: 'res', res}, '*');
};
