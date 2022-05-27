import {INPUTS} from '../../const';
// @ts-ignore
import inputs from './inputs.yaml';

export type Leaf = [string, INPUTS];
export type Inputs = {[key: string]: Leaf|Inputs};

function node(val: any): Leaf|Inputs {
  // Traverse.
  if (typeof val === 'object') {
    return parse(val);
  }

  if (typeof val === 'number') {
    return [val.toString(), INPUTS.NUMBER];
  }
  if (val.includes('%')) {
    return [val, INPUTS.PERCENT];
  }
  if (val.includes('$')) {
    return [val, INPUTS.CURRENCY];
  }
  return [val, INPUTS.NUMBER];
}

const parse = (obj) => Object.entries(obj).reduce((d, [key, val]) => ({
  ...d,
  [key]: node(val)
}), {} as Inputs);

export default parse(inputs);
