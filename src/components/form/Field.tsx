import React, {useEffect, useRef, useState} from 'react';
import MaskedInput from 'react-text-mask';
import {connect} from 'react-redux'
import opa from 'object-path';
import clone from 'clone-deep';
import currency from 'currency.js';
import {currencyMask, percentMask, numberMask} from './masks/number';
import clean from '../../modules/inputs/clean';
import {INPUTS} from '../../const';

const Field = ({
  label,
  description,
  focus=false,
  form,
  setForm,
  field: key,
  ...input
}) => {
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

  const onChange = e => {
    const newValue = e.target.value;
    setValue(newValue);
  };

  const onBlur = () => {
    const newValue = clean(value);

    setValue(newValue);

    if (formValue === newValue) {
      return;
    }

    // TODO make more performant.
    setForm(d => {
      const obj = clone(d);
      opa.set(obj, key, [newValue, type]);
      return obj;
    });
  };

  const props = {
    ref,
    value,
    onBlur,
    onChange,
    className: 'input',
    ...input
  };

  let field;
  if (type === INPUTS.CURRENCY) {
    field = (
      <MaskedInput
        {...props}
        mask={currencyMask}
        inputMode="numeric"
        defaultValue={currency(formValue).value}
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
  } else {
    field = (
      <MaskedInput
        {...props}
        mask={numberMask}
        inputMode="numeric"
        defaultValue={formValue}
      />
    );
  }

  return (
    <div className="field">
      <label className="label">{label}</label>
      <div className="legend">{description}</div>
      {field}
    </div>
  );
};

const mapState = (state) => ({
	form: state.form
})

const mapDispatch = (dispatch) => ({
	setForm: dispatch.form.setForm
})

export default connect(mapState, mapDispatch)(Field);
