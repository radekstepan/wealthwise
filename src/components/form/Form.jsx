import React from 'react';
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

const Group = ({title, children}) => (
  <div className="group">
    <Title>{title}</Title>
    {children}
  </div>
);

const Title = ({children}) => <div className="title">{children}</div>;

const TextInputField = ({label, description, ...input}) => (
  <div className="field">
    <label className="label">{label}</label>
    <div className="legend">{description}</div>
    <input type="text" className="input" {...input} />
  </div>
);

export default function Form({form, setForm}) {
  return (
    <div className="form">
      <Group title="Property">
        <TextInputField
          label="Price"
          placeholder="Property price"
          {...props(form, setForm, 'house.price')}
        />
        <TextInputField
          label="Maintenance"
          description="monthly maintenance/strata fees"
          {...props(form, setForm, 'house.maintenance')}
        />
        <TextInputField
          label="Property Taxes"
          description="monthly"
          {...props(form, setForm, 'house.propertyTax')}
        />
        <TextInputField
          label="Homeowner's Insurance"
          description="monthly"
          {...props(form, setForm, 'house.insurance')}
        />
        <TextInputField
          label="Expenses increases"
          description="% yearly maintenance, taxes and insurance"
          {...props(form, setForm, 'rates.house.expenses')}
        />
      </Group>

      <Group title="Mortgage">
        <TextInputField
          label="Downpayment"
          description="% of the purchase price"
          {...props(form, setForm, 'house.downpayment')}
        />
        <TextInputField
          label="Current Interest Rate"
          description="% yearly mortgage interest rate"
          {...props(form, setForm, 'rates.interest.initial')}
        />
        <TextInputField
          label="Future Interest Rate"
          description="% yearly mortgage interest rate"
          {...props(form, setForm, 'rates.interest.future')}
        />
      </Group>

      <Group title="Rent">
        <TextInputField
          label="Rent"
          description="monthly"
          {...props(form, setForm, 'rent.current')}
        />
        <TextInputField
          label="Market rent"
          description="monthly"
          {...props(form, setForm, 'rent.market')}
        />
        <TextInputField
          label="Rent increases"
          description="% yearly"
          {...props(form, setForm, 'rates.rent.controlled')}
        />
        <TextInputField
          label="Market rent increases"
          description="% yearly"
          {...props(form, setForm, 'rates.rent.market')}
        />
      </Group>

      <Group title="Returns">
        <TextInputField
          label="Investment return"
          description="% yearly"
          {...props(form, setForm, 'rates.stocks.return')}
        />
        <TextInputField
          label="Property appreciation"
          description="% yearly"
          {...props(form, setForm, 'rates.house.appreciation')}
        />
      </Group>

      <Group title="Income">
        <TextInputField
          label="Current income"
          description="yearly after tax"
          {...props(form, setForm, 'income.current')}
        />
        <TextInputField
          label="Income raises"
          description="% yearly"
          {...props(form, setForm, 'income.raises')}
        />
      </Group>

      <Group title="Scenarios">
        <TextInputField
          label="Property price drop chance"
          description="% chance over a 25 year period"
          {...props(form, setForm, 'scenarios.crash.chance')}
        />
        <TextInputField
          label="Property price drop amount"
          description="% amount drop"
          {...props(form, setForm, 'scenarios.crash.drop')}
        />
        <TextInputField
          label="Moving"
          description="move every x years"
          {...props(form, setForm, 'scenarios.move')}
        />
      </Group>
    </div>
  );
}