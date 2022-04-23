import currency from 'currency.js';
import {point, normal} from './samplers';
import {Leaf, Inputs} from './inputs';
import {INPUTS} from '../const';

function node(node: Leaf|Inputs) {
  // Traverse.
  if (!Array.isArray(node)) {
    return parse(node);
  }
  const [val, type] = node;

  // Number.
  if (type === INPUTS.NUMBER) {
    // TODO handle a range.
    return point(parseFloat(val));
  }

  // Range.
  if (val.includes(' - ')) {
    let low: number, high: number;
    if (type === INPUTS.PERCENT) {
      [low, high] = val
        .split(' - ')
        .map((d: string) => Number(d.trim().replaceAll('%', '')) / 100);
    } else if (type === INPUTS.CURRENCY) {
      [low, high] = val.split(' - ').map((d: string) => currency(d).value); 
    } else {
      [low, high] = val.split(' - ').map((d: string) => Number(d.trim())); 
    }
    return normal(low, high);
  }

  if (type === INPUTS.PERCENT) {
    return point(Number(val.replace('%', '')) / 100);
  }
  if (type === INPUTS.CURRENCY) {
    return point(currency(val).value);
  }
  return point(Number(val));
}

// Parse user input.
const parse = (opts: Inputs) => Object.entries(opts).reduce((d, [key, val]) => ({
  ...d,
  [key]: node(val)
}), {});

export default parse;
