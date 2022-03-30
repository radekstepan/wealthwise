import currency from 'currency.js';
import {point, normal} from './samplers';

function node(val) {
  // Traverse.
  if (typeof val === 'object') {
    return parse(val);
  }
  // Number.
  if (typeof val === 'number') {
    return point(val);
  }

  // Range.
  if (val.includes(' - ')) {
    let low: number, high: number;
    if (val.includes('%')) {
      [low, high] = val
        .split(' - ')
        .map((d: string) => Number(d.trim().replaceAll('%', '')) / 100);
    } else if (val.includes('$')) {
      [low, high] = val.split(' - ').map((d: string) => currency(d).value); 
    } else {
      [low, high] = val.split(' - ').map((d: string) => Number(d.trim())); 
    }
    return normal(low, high);
  }

  // String.
  if (val.includes('%')) {
    return point(Number(val.replace('%', '')) / 100);
  }
  if (val.includes('$')) {
    return point(currency(val).value);
  }
  return point(Number(val));
}

// Parse user input.
const parse = (opts) => Object.entries(opts).reduce((d, [key, val]) => ({
  ...d,
  [key]: node(val)
}), {});

export default parse;
