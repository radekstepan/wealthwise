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
          {...props(form, setForm, 'price')}
        />
      </Pane>
      <Pane>
        <TextInputField
          label="Downpayment"
          description="% of the purchase price"
          {...props(form, setForm, 'downpayment')}
        />
      </Pane>
      <Pane>
        <TextInputField
          label="Current Interest Rate"
          description="% yearly mortgage interest rate"
          {...props(form, setForm, 'rates.initialInterest')}
        />
      </Pane>
      <Pane>
        <TextInputField
          label="Future Interest Rate"
          description="% yearly mortgage interest rate"
          {...props(form, setForm, 'rates.futureInterest')}
        />
      </Pane>
      <Pane>
        <TextInputField
          label="Maintenance"
          description="monthly maintenance/strata fees"
          {...props(form, setForm, 'maintenance')}
        />
      </Pane>
      <Pane>
        <TextInputField
          label="Property Taxes"
          description="monthly"
          {...props(form, setForm, 'propertyTax')}
        />
      </Pane>
      <Pane>
        <TextInputField
          label="Homeowner's Insurance"
          description="monthly"
          {...props(form, setForm, 'insurance')}
        />
      </Pane>
      <Pane>
        <TextInputField
          label="Expenses increases"
          description="% yearly maintenance, taxes and insurance"
          {...props(form, setForm, 'rates.expenses')}
        />
      </Pane>
      <Pane>
        <TextInputField
          label="Rent"
          description="monthly"
          {...props(form, setForm, 'rent')}
        />
      </Pane>
      <Pane>
        <TextInputField
          label="Market rent"
          description="monthly"
          {...props(form, setForm, 'marketRent')}
        />
      </Pane>
      <Pane>
        <TextInputField
          label="Rent increases"
          description="% yearly"
          {...props(form, setForm, 'rates.rent')}
        />
      </Pane>
      <Pane>
        <TextInputField
          label="Market rent increases"
          description="% yearly"
          {...props(form, setForm, 'rates.marketRent')}
        />
      </Pane>
      <Pane>
        <TextInputField
          label="Investment return"
          description="% yearly"
          {...props(form, setForm, 'rates.stocks')}
        />
      </Pane>
      <Pane className="field">
        <TextInputField
          label="Property appreciation"
          description="% yearly"
          {...props(form, setForm, 'rates.appreciation')}
        />
      </Pane>
    </>
  );
}