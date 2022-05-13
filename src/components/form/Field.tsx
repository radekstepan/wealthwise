import React from 'react';
import MaskedInput from 'react-text-mask';
import currency from 'currency.js';
import {currencyMask, percentMask, numberMask} from './masks/number';

const Field = ({label, description, ...input}) => {

  let field;
  if (input.defaultValue.includes('$')) {
    field = (
      <MaskedInput
        {...input}
        mask={currencyMask}
        inputMode="numeric"
        defaultValue={currency(input.defaultValue).value}
        className="input"
      />
    );
  } else if (input.defaultValue.includes('%')) {
    field = (
      <MaskedInput
        {...input}
        mask={percentMask}
        inputMode="numeric"
        defaultValue={input.defaultValue}
        className="input"
      />
    );
  } else {
    field = (
      <MaskedInput
        {...input}
        mask={numberMask}
        inputMode="numeric"
        defaultValue={input.defaultValue}
        className="input"
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

export default Field;
