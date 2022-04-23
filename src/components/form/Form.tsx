import React, {useState} from 'react';
import {IoIosArrowDown, IoIosArrowUp} from 'react-icons/io';
import CurrencyInput from 'react-currency-input-field';
import currency from 'currency.js';
import opa from 'object-path';
import clone from 'clone-deep';
import {Inputs} from '../../modules/inputs';
import './form.less';

const props = (form, setForm, key) => {
  const [value, type] = opa.get(form, key);

  return {
    defaultValue: value,
    onBlur: e => setForm(d => {
      // Do not run if value has not changed.
      let newValue = e.target.value;

      if (value === newValue) {
        return d;
      }
  
      const obj = clone(d);
      opa.set(obj, key, [newValue, type]);
      return obj;
    })
  };
};

const Group = ({expanded=false, title, summary, children}) => {
  const [isExpanded, setExpanded] = useState(!!expanded);
  return (
    <div className={`group ${isExpanded ? 'expanded' : ''}`}>
      <Header
        title={title}
        summary={summary}
        isExpanded={isExpanded}
        setExpanded={setExpanded}
      />
      <div className="content" onClick={evt => evt.stopPropagation()}>
        {isExpanded && children}
      </div>
    </div>
  );
};

const Header = ({isExpanded, setExpanded, title, summary}) => (
  <div className="header">
    <div className="toggle" onClick={() => setExpanded(!isExpanded)}>
      <div className="nub">
        {!isExpanded && <IoIosArrowDown />}
        {isExpanded && <IoIosArrowUp />}
      </div>
      <div className="title">{title}</div>
      <div className="summary">{!isExpanded && summary}</div>
    </div>
  </div>
);

const Field = ({label, description, ...input}) => {
  const isCurrency = input.defaultValue.includes('$');
  return (
    <div className="field">
      <label className="label">{label}</label>
      <div className="legend">{description}</div>
      {isCurrency ? (
        <CurrencyInput
          {...input}
          defaultValue={currency(input.defaultValue).value}
          allowNegativeValue={false}
          prefix="$"
          className="input"
        />
      ) : <input type="text" className="input" {...input} />}
    </div>
  );
};

interface Props {
  form: Inputs
  setForm: React.Dispatch<React.SetStateAction<Inputs>>
}

const Form: React.FC<Props> = ({form, setForm}) => {
  return (
    <div className="form">
      {/** @ts-ignore */}
      <Group title="Property" summary={form.house.price[0]} expanded>
        <Field
          label="Price"
          placeholder="Property price"
          description="purchase price"
          {...props(form, setForm, 'house.price')}
        />
        <Field
          label="Maintenance"
          description="monthly maintenance/strata fees"
          {...props(form, setForm, 'house.maintenance')}
        />
        <Field
          label="Property Taxes"
          description="monthly"
          {...props(form, setForm, 'house.propertyTax')}
        />
        <Field
          label="Homeowner's Insurance"
          description="monthly"
          {...props(form, setForm, 'house.insurance')}
        />
        <Field
          label="Expenses increases"
          description="% yearly maintenance, taxes and insurance"
          {...props(form, setForm, 'rates.house.expenses')}
        />
      </Group>
      {/** @ts-ignore */}
      <Group title="Mortgage" summary={form.rates.interest.initial[0]}>
        <Field
          label="Downpayment"
          description="% of the purchase price"
          {...props(form, setForm, 'house.downpayment')}
        />
        <Field
          label="Current Interest Rate"
          description="% yearly mortgage interest rate"
          {...props(form, setForm, 'rates.interest.initial')}
        />
        <Field
          label="Future Interest Rate"
          description="% yearly mortgage interest rate"
          {...props(form, setForm, 'rates.interest.future')}
        />
      </Group>
      {/** @ts-ignore */}
      <Group title="Rent" summary={form.rent.current[0]}>
        <Field
          label="Rent"
          description="monthly"
          {...props(form, setForm, 'rent.current')}
        />
        <Field
          label="Market rent"
          description="monthly"
          {...props(form, setForm, 'rent.market')}
        />
        <Field
          label="Rent increases"
          description="% yearly"
          {...props(form, setForm, 'rates.rent.controlled')}
        />
        <Field
          label="Market rent increases"
          description="% yearly"
          {...props(form, setForm, 'rates.rent.market')}
        />
      </Group>
      {/** @ts-ignore */}
      <Group title="Returns" summary={form.rates.house.appreciation[0]}>
        <Field
          label="Investment return"
          description="% yearly"
          {...props(form, setForm, 'rates.stocks.return')}
        />
        <Field
          label="Property appreciation"
          description="% yearly"
          {...props(form, setForm, 'rates.house.appreciation')}
        />
      </Group>
      {/** @ts-ignore */}
      <Group title="Income" summary={form.income.current[0]}>
        <Field
          label="Current income"
          description="yearly after tax"
          {...props(form, setForm, 'income.current')}
        />
        <Field
          label="Income raises"
          description="% yearly"
          {...props(form, setForm, 'income.raises')}
        />
      </Group>
      {/** @ts-ignore */}
      <Group title="Scenarios" summary={form.scenarios.crash.drop[0]}>
        <Field
          label="Property price drop chance"
          description="% chance over a 25 year period"
          {...props(form, setForm, 'scenarios.crash.chance')}
        />
        <Field
          label="Property price drop amount"
          description="% amount drop"
          {...props(form, setForm, 'scenarios.crash.drop')}
        />
        <Field
          label="Moving"
          description="move every x years"
          {...props(form, setForm, 'scenarios.move')}
        />
      </Group>
    </div>
  );
}

export default Form;
