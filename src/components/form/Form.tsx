import React, {useCallback, useState} from 'react';
import {IoIosArrowDown, IoIosArrowUp} from 'react-icons/io';
import useCollapse from 'react-collapsed';
import opa from 'object-path';
import clone from 'clone-deep';
import {Inputs} from '../../modules/inputs';
import Field from './Field';
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
  const [isExpandEnd, setIsExpandEnd] = useState(false);
  const [showSummary, setShowSummary] = useState(!expanded);
  const onExpandStart = useCallback(() => setShowSummary(false), []);
  const onCollapseEnd = useCallback(() => {
    setShowSummary(true);
    setIsExpandEnd(false);
  }, []);
  const onExpandEnd = useCallback(() => setIsExpandEnd(true), []);

  const {getCollapseProps} = useCollapse({
    isExpanded,
    onExpandStart,
    onExpandEnd,
    onCollapseEnd,
    duration: 50,
    easing: 'ease-in'
  });

  return (
    <div className={`group ${isExpanded ? 'expanded' : ''}`}>
      <Header
        title={title}
        summary={summary}
        isExpanded={isExpanded}
        showSummary={showSummary}
        setExpanded={setExpanded}
      />
      <div className="content" {...getCollapseProps()}>
        {children({isExpandEnd})}
      </div>
    </div>
  );
};

const Header = ({isExpanded, showSummary, setExpanded, title, summary}) => (
  <div className="header">
    <div className="toggle" onClick={() => setExpanded(d => !d)}>
      <div className="nub">
        {!isExpanded && <IoIosArrowDown />}
        {isExpanded && <IoIosArrowUp />}
      </div>
      <div className="title">{title}</div>
      <div className="summary">{showSummary && summary}</div>
    </div>
  </div>
);

interface Props {
  form: Inputs
  setForm: React.Dispatch<React.SetStateAction<Inputs>>
}

const Form: React.FC<Props> = ({form, setForm}) => {
  return (
    <div className="form">
      {/** @ts-ignore */}
      <Group title="Property" summary={form.house.price[0]} expanded>
        {({isExpandEnd}) => (
          <>
            <Field
              autoFocus
              focus={isExpandEnd}
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
              description="yearly"
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
          </>
        )}
      </Group>
      {/** @ts-ignore */}
      <Group title="Mortgage" summary={form.rates.interest.initial[0]}>
        {({isExpandEnd}) => (
          <>
            <Field
              label="Downpayment"
              description="% of the purchase price"
              {...props(form, setForm, 'house.downpayment')}
            />
            <Field
              focus={isExpandEnd}
              label="Current Interest Rate"
              description="% yearly variable mortgage interest rate"
              {...props(form, setForm, 'rates.interest.initial')}
            />
            <Field
              label="Future Interest Rate"
              description="% yearly variable mortgage interest rate"
              {...props(form, setForm, 'rates.interest.future')}
            />
          </>
        )}
      </Group>
      {/** @ts-ignore */}
      <Group title="Rent" summary={form.rent.current[0]}>
        {({isExpandEnd}) => (
          <>
            <Field
              focus={isExpandEnd}
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
          </>
        )}
      </Group>
      {/** @ts-ignore */}
      <Group title="Returns" summary={form.rates.house.appreciation[0]}>
        {({isExpandEnd}) => (
          <>
            <Field
              focus={isExpandEnd}
              label="Property appreciation"
              description="% yearly"
              {...props(form, setForm, 'rates.house.appreciation')}
            />
            <Field
              label="Safe investment return"
              description="% yearly"
              {...props(form, setForm, 'rates.bonds.return')}
            />
          </>
        )}
      </Group>
      {/*
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
      */}
      {/** @ts-ignore */}
      <Group title="Scenarios" summary={form.scenarios.crash.drop[0]}>
        {({isExpandEnd}) => (
          <>
            <Field
              label="Property price drop chance"
              description="% chance over a 25 year period"
              {...props(form, setForm, 'scenarios.crash.chance')}
            />
            <Field
              focus={isExpandEnd}
              label="Property price drop amount"
              description="% amount drop"
              {...props(form, setForm, 'scenarios.crash.drop')}
            />
            <Field
              label="Moving"
              description="move every x years"
              {...props(form, setForm, 'scenarios.move')}
            />
          </>
        )}
      </Group>
    </div>
  );
}

export default Form;
