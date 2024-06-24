import numbro from 'numbro';
import { point, normal, Sample } from '../samplers';
import { INPUTS } from '../../const';
import { type TypedInputs, type InputNode } from './inputs';

export type ParsedInputs<T> = {
  [K in keyof T]: T[K] extends InputNode ? Sample : ParsedInputs<T[K]>;
};

// Convert an InputNode to a Sample.
const node = (node: InputNode): Sample => {
  const [val, type] = node;

  // Boolean value.
  if (type === INPUTS.BOOLEAN) {
    return val === 'Yes' ? point(1) : point(0);
  }

  // Number.
  if (type === INPUTS.NUMBER) {
    // TODO: handle a range.
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

  // Percent.
  if (type === INPUTS.PERCENT) {
    return point(Number(val.replace('%', '')) / 100);
  }

  // Currency.
  if (type === INPUTS.CURRENCY) {
    return point(numbro.unformat(val));
  }

  // Default case - treat as a number.
  return point(Number(val));
}

const isInputNode = (val: any): val is InputNode => Array.isArray(val) && val.length === 2;

// Parse user input.
const parse = <T extends TypedInputs>(inputs: T): ParsedInputs<T> => {
  const result: any = {};

  for (const [key, value] of Object.entries(inputs)) {
    if (isInputNode(value)) {
      result[key] = node(value);
    } else if (typeof value === 'object' && value !== null) {
      // A nested object.
      result[key] = parse(value as any);
    } else {
      throw new Error(`Unexpected value type at key ${key}`);
    }
  }

  return result as ParsedInputs<T>;
};

export default parse;
