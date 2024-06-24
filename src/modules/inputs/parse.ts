import numbro from 'numbro';
import {point, normal} from '../samplers';
import {INPUTS} from '../../const';

// TODO type
function node(node) {
  // Traverse.
  if (!Array.isArray(node)) {
    return parse(node);
  }
  const [val, type] = node;

  // A boolean value.
  if (type === INPUTS.BOOLEAN) {
    return val === 'Yes' ? point(1) : point(0);
  }

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
      [low, high] = val.split(' - ').map((d: string) => numbro.unformat(d)); 
    } else {
      [low, high] = val.split(' - ').map((d: string) => Number(d.trim())); 
    }
    return normal(low, high);
  }

  if (type === INPUTS.PERCENT) {
    return point(Number(val.replace('%', '')) / 100);
  }
  if (type === INPUTS.CURRENCY) {
    return point(numbro.unformat(val));
  }
  return point(Number(val));
}

// Parse user input.
const parse = (opts) => Object.entries(opts).reduce((d, [key, val]) => ({
  ...d,
  [key]: node(val)
}), {});

export default parse;
