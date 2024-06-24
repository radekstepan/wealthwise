import { INPUTS } from '../../const';
import { inputs } from '../../config';

type InputValue = string | number;

type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends InputValue ? T[P] : DeepReadonly<T[P]>;
};

export type InputNode = [string, INPUTS];

type TypedInput<T> = T extends InputValue
  ? InputNode
  : { [K in keyof T]: TypedInput<T[K]> };

function assignType(val: InputValue): InputNode {
  if (typeof val === 'number') {
    return [val.toString(), INPUTS.NUMBER];
  }
  if (typeof val === 'string') {
    if (val === 'Yes' || val === 'No') {
      return [val, INPUTS.BOOLEAN];
    }
    if (val.includes('%')) {
      return [val, INPUTS.PERCENT];
    }
    if (val.includes('$')) {
      return [val, INPUTS.CURRENCY];
    }
  }
  return [String(val), INPUTS.NUMBER];
}

const isInputValue = (val: any): val is InputValue => typeof val !== 'object' || val === null;

function walkAndAssignTypes<T extends object>(obj: DeepReadonly<T>): TypedInput<T> {
  const result: any = {};

  for (const [key, value] of Object.entries(obj)) {
    if (!isInputValue(value)) {
      result[key] = walkAndAssignTypes(value as object);
    } else {
      result[key] = assignType(value);
    }
  }

  return result;
}

const typedInputs = walkAndAssignTypes(inputs);

export type TypedInputs = typeof typedInputs;

export default typedInputs;
