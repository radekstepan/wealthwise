#!/usr/bin/env node
import { run, bench, group } from 'mitata';
import typedInputs from '../src/__tests__/__fixtures__/fixedRateMortgage.inputs';
import { run as runSimulation } from '../src/modules/run';
import parse from '../src/modules/inputs/parse';

const length = parseInt(typedInputs.scenarios.simulate.years[0].toString(), 10);
const opts = parse(typedInputs);

bench('fixed rate mortgage', () => {
  const res = runSimulation(opts, false);
  if (!Array.isArray(res) || res.length !== length) {
    throw new Error('Simulation failed to produce the correct results');
  }
});

run({
  throw: true,
  format: 'markdown',
});
