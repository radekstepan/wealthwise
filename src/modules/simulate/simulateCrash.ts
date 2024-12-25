import {type Random} from 'random-js';
import { type ParsedInputs } from '../inputs/parse';
import { type TypedInputs } from "../inputs/inputs";

export const simulateCrash = ({
  random,
  opts
}: {
  random: Random,
  opts: ParsedInputs<TypedInputs>
}) => {
  // Property crash?
  if (random.bool(Math.min(opts.scenarios.crash.chance(), 1))) {
    return 1 - Math.min(opts.scenarios.crash.drop(), 1);
  }
  return null;
}
