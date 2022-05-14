import React, {useEffect, useRef} from 'react';
import MaskedInput from 'react-text-mask';
import currency from 'currency.js';
import {currencyMask, percentMask, numberMask} from './masks/number';

const Field = ({label, description, focus=false, ...input}) => {
  const ref = useRef(null);
  // Focus on expand (mount).
  useEffect(() => {
    let timeout;
    if (focus && ref.current && ref.current.inputElement) {
      timeout = setTimeout(() => ref.current.inputElement.focus(), 0);
    }
    return () => clearTimeout(timeout);
  }, [focus, ref.current]);

  const props = {
    ref,
    className: 'input',
    ...input
  };

  let field;
  if (input.defaultValue.includes('$')) {
    field = (
      <MaskedInput
        {...props}
        mask={currencyMask}
        inputMode="numeric"
        defaultValue={currency(input.defaultValue).value}
      />
    );
  } else if (input.defaultValue.includes('%')) {
    field = (
      <MaskedInput
        {...props}
        mask={percentMask}
        inputMode="numeric"
        defaultValue={input.defaultValue}
      />
    );
  } else {
    field = (
      <MaskedInput
        {...props}
        mask={numberMask}
        inputMode="numeric"
        defaultValue={input.defaultValue}
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
