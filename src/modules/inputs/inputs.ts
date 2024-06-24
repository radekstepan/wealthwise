import { INPUTS } from '../../const';
import { inputs } from '../../config';

type InputValue = string | number;

type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends InputValue ? T[P] : DeepReadonly<T[P]>;
};

export type TypedInput<T> = T extends InputValue
  ? [string, INPUTS]
  : { [K in keyof T]: TypedInput<T[K]> };

function assignType(val: InputValue): [string, INPUTS] {
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

function walkAndAssignTypes<T extends object>(obj: DeepReadonly<T>): TypedInput<T> {
  const result: any = {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'object' && value !== null) {
      result[key] = walkAndAssignTypes(value as any);
    } else {
      result[key] = assignType(value as InputValue);
    }
  }

  return result;
}

const typedInputs = walkAndAssignTypes(inputs);

export default typedInputs;
