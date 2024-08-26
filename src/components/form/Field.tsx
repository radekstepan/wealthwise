import React, {useCallback, useEffect, useRef, useState, type FC} from 'react';
import MaskedInput from 'react-text-mask';
import opa from 'object-path';
import clone from 'clone-deep';
import numbro from 'numbro';
import { useAtom } from 'jotai';
import {currencyMask, percentMask, numberMask} from './masks/number';
import clean from '../../modules/inputs/clean';
import {INPUTS} from '../../const';
import { formAtom } from '../../atoms/formAtom';
import { Province } from '../../config';

interface Props {
  label: string;
  field: string;
  description?: string;
  placeholder?: string;
  focus?: boolean;
  readOnly?: boolean;
}

// The component uses the value in the form state to set its initial
//  value, and it updates the form state when the input value changes.
//  The type of the field is used to determine which mask to apply to
//  the input. The component is connected to a Redux store, so that it
//  can access the form state and dispatch actions to update it.
const Field: FC<Props> = ({
  label,
  description,
  field: key,
  focus=false,
  readOnly=false,
  ...input
}) => {
  const [form, setForm] = useAtom(formAtom);

  const [formValue, type] = opa.get(form, key);
  const [value, setValue] = useState(formValue);

  const ref = useRef(null);
  // Focus on expand (mount).
  useEffect(() => {
    let timeout;
    if (focus && ref.current && ref.current.inputElement) {
      timeout = setTimeout(() => ref.current.inputElement.focus(), 0);
    }
    return () => clearTimeout(timeout);
  }, [focus, ref.current]);

  const onChange = useCallback((e) => {
    const newValue = e.target.value;
    setValue(newValue);
  }, []);

  const onBlur = useCallback(() => {
    const newValue = clean(value);
    setValue(newValue);

    if (formValue === newValue) {
      return;
    }

    const obj = clone(form);
    opa.set(obj, key, [newValue, type]);
    setForm(obj);
  }, [form, formValue, key, setForm, type, value]);

  const onImmediateChange = useCallback((e) => {
    const newValue = clean(e.target.value);
    setValue(newValue);

    if (formValue === newValue) {
      return;
    }

    const obj = clone(form);
    opa.set(obj, key, [newValue, type]);
    setForm(obj);
  }, [form, formValue, key, setForm, type, value]);

  const props = {
    ref,
    value,
    onBlur,
    onChange,
    className: 'input',
    inputMode: 'numeric' as const,
    ...input
  };

  let field;
  if (readOnly) {
    field = <input {...props} disabled />;
  } else if (type === INPUTS.CURRENCY) {
    field = (
      <MaskedInput
        {...props}
        mask={currencyMask}
        defaultValue={numbro.unformat(formValue)}
      />
    );
  } else if (type === INPUTS.PERCENT) {
    field = (
      <MaskedInput
        {...props}
        mask={percentMask}
        inputMode="numeric"
        defaultValue={formValue}
      />
    );
  } else if (type === INPUTS.BOOLEAN) {
    field = (
      <select {...props} value={value ? "Yes" : "No"} onChange={onImmediateChange} onBlur={() => {}}>
        <option key="Yes" value="Yes">Yes</option>
        <option key="No" value="No">No</option>
      </select>
    );
  } else if (type === INPUTS.PROVINCE) {
    field = (
      <select {...props} onChange={onImmediateChange} onBlur={() => {}}>
        {Object.entries(Province).map(([, val]) => (
          <option key={val} value={val}>
            {val}
          </option>
        ))}
      </select>
    );
  } else {
    field = (
      <MaskedInput
        {...props}
        value={value}
        mask={numberMask}
        inputMode="numeric"
        defaultValue={formValue}
      />
    );
  }

  return (
    <div className="field">
      <label className="label">{label}</label>
      {description && <div className="legend">{description}</div>}
      {field}
    </div>
  );
};

export default Field;
