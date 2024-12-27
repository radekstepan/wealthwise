#!/usr/bin/env node
import { run, bench } from 'mitata';
import typedInputs from '../src/__tests__/__fixtures__/fixedRateMortgage.inputs';
import { run as runSimulation } from '../src/modules/run';
import parse from '../src/modules/inputs/parse';
import {processSim} from '../src/modules/processSim';
import { range } from '../src/modules/utils';
import { type Data } from '../src/interfaces';

const noop = () => {};

const length = parseInt(typedInputs.scenarios.simulate.years[0].toString(), 10);
const opts = parse(typedInputs);

bench('fixed rate mortgage simulation', () => {
  const res = runSimulation(opts, false);
  if (!Array.isArray(res) || res.length !== length) {
    throw new Error('Simulation failed to produce the correct results');
  }
});

bench('process simulation results', function* () {
  yield {
    [0]() {
      return range(1000).map(() => runSimulation(opts, false));
    },

    bench(samples: Array<Data>) {
      processSim(noop, noop)(samples);
    },
  };
});

run({
  throw: true,
  format: 'markdown',
});
