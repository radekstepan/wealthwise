import React from 'react';
import MaskedInput from 'react-text-mask';
import currency from 'currency.js';
import {currencyMask} from './masks/number';

const Field = ({label, description, ...input}) => {
  const isCurrency = input.defaultValue.includes('$');
  return (
    <div className="field">
      <label className="label">{label}</label>
      <div className="legend">{description}</div>
      {isCurrency ? (
        <MaskedInput
          {...input}
          mask={currencyMask}
          inputMode="numeric"
          defaultValue={currency(input.defaultValue).value}
          className="input"
        />
      ) : <input type="text" className="input" {...input} />}
    </div>
  );
};

export default Field;
