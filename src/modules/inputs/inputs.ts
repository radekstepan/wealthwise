import { INPUTS } from '../../const';
import { inputs, Province } from '../../config';

type InputValue = string | number | Province;

type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends InputValue ? T[P] : DeepReadonly<T[P]>;
};

export type InputNode =
  | [string, INPUTS.NUMBER | INPUTS.BOOLEAN | INPUTS.PERCENT | INPUTS.CURRENCY]
  | [Province, INPUTS.PROVINCE];

type TypedInput<T> = T extends InputValue
  ? T extends Province ? [Province, INPUTS.PROVINCE] : InputNode
  : { [K in keyof T]: TypedInput<T[K]> };

function assignType(val: InputValue): InputNode {
  if (Object.values(Province).includes(val as Province)) {
    return [val as Province, INPUTS.PROVINCE];
  }

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

const isInputValue = (val: any): val is InputValue => {
  if (Object.values(Province).includes(val)) {
    return true;
  }
  if (typeof val !== 'object') {
    return true;
  }
  if (val === null) {
    return true;
  }
  return false;
};

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
