import numbro from 'numbro';
import { normal, invariant, type Sample } from '../samplers';
import { INPUTS } from '../../const';
import { type TypedInputs, type InputNode } from './inputs';
import { Province } from '../../interfaces';

export type ParsedInputs<T> = {
  [K in keyof T]: T[K] extends InputNode ? 
    T[K][1] extends INPUTS.PROVINCE ? Sample<Province> : // explicitly call out Province enum
    Sample : 
    ParsedInputs<T[K]>;
};

// Convert an InputNode to a Sample.
const node = (node: InputNode) => {
  const [val, type] = node;

  // Boolean value.
  if (typeof val === 'boolean') {
    return invariant(val);
  }

  // Number.
  if (type === INPUTS.NUMBER) {
    // TODO: handle a range.
    try {
      // Strip all non-digits
      const digitsOnly = val.replace(/\D/g, '');
      // Parse as integer (base 10)
      const parsedInt = parseInt(digitsOnly, 10);
      // Return invariant, defaulting to 0 if parsing failed (e.g., empty string after stripping)
      return invariant<number>(isNaN(parsedInt) ? 0 : parsedInt);
    } catch (e) {
      console.warn(`Failed to parse INPUTS.NUMBER string: '${val}', defaulting to 0.`, e);
      return invariant<number>(0);
    }
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
    return invariant(Number(val.replace('%', '')) / 100);
  }

  // Currency.
  if (type === INPUTS.CURRENCY) {
    return invariant(numbro.unformat(val));
  }

  // Province enum.
  if (type === INPUTS.PROVINCE) {
    return invariant(val);
  }

  // Default case - treat as a number.
  return invariant(Number(val));
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
