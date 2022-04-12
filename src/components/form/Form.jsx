import React from 'react';
import {
  Pane,
  TextInputField,
} from 'evergreen-ui';
import opa from 'object-path';
import clone from 'clone-deep';
import './form.less';

const props = (form, setForm, key) => {
  const value = opa.get(form, key);

  return {
    defaultValue: value,
    onBlur: e => setForm(d => {
      // Do not run if value has not changed.
      const newValue = e.target.value;
      if (value === newValue) {
        return d;
      }
  
      const obj = clone(d);
      opa.set(obj, key, newValue);
      return obj;
    })
  };
};

export default function Form({form, setForm}) {
  return (
    <>
      <Pane className="field">
        <TextInputField
          label="Price"
          placeholder="Property price"
          {...props(form, setForm, 'house.price')}
        />
      </Pane>
      <Pane>
        <TextInputField
          label="Downpayment"
          description="% of the purchase price"
          {...props(form, setForm, 'house.downpayment')}
        />
      </Pane>
      <Pane>
        <TextInputField
          label="Current Interest Rate"
          description="% yearly mortgage interest rate"
          {...props(form, setForm, 'rates.interest.initial')}
        />
      </Pane>
      <Pane>
        <TextInputField
          label="Future Interest Rate"
          description="% yearly mortgage interest rate"
          {...props(form, setForm, 'rates.interest.future')}
        />
      </Pane>
      <Pane>
        <TextInputField
          label="Maintenance"
          description="monthly maintenance/strata fees"
          {...props(form, setForm, 'house.maintenance')}
        />
      </Pane>
      <Pane>
        <TextInputField
          label="Property Taxes"
          description="monthly"
          {...props(form, setForm, 'house.propertyTax')}
        />
      </Pane>
      <Pane>
        <TextInputField
          label="Homeowner's Insurance"
          description="monthly"
          {...props(form, setForm, 'house.insurance')}
        />
      </Pane>
      <Pane>
        <TextInputField
          label="Expenses increases"
          description="% yearly maintenance, taxes and insurance"
          {...props(form, setForm, 'rates.house.expenses')}
        />
      </Pane>
      <Pane>
        <TextInputField
          label="Rent"
          description="monthly"
          {...props(form, setForm, 'rent.current')}
        />
      </Pane>
      <Pane>
        <TextInputField
          label="Market rent"
          description="monthly"
          {...props(form, setForm, 'rent.market')}
        />
      </Pane>
      <Pane>
        <TextInputField
          label="Rent increases"
          description="% yearly"
          {...props(form, setForm, 'rates.rent.controlled')}
        />
      </Pane>
      <Pane>
        <TextInputField
          label="Market rent increases"
          description="% yearly"
          {...props(form, setForm, 'rates.rent.market')}
        />
      </Pane>
      <Pane>
        <TextInputField
          label="Investment return"
          description="% yearly"
          {...props(form, setForm, 'rates.stocks.return')}
        />
      </Pane>
      <Pane className="field">
        <TextInputField
          label="Property appreciation"
          description="% yearly"
          {...props(form, setForm, 'rates.house.appreciation')}
        />
      </Pane>
      <Pane>
        <TextInputField
          label="Current income"
          description="yearly after tax"
          {...props(form, setForm, 'income.current')}
        />
      </Pane>
      <Pane>
        <TextInputField
          label="Income raises"
          description="% yearly"
          {...props(form, setForm, 'income.raises')}
        />
      </Pane>
    </>
  );
}