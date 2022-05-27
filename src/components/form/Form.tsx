import React, {useCallback, useState} from 'react';
import {IoIosArrowDown, IoIosArrowUp} from 'react-icons/io';
import useCollapse from 'react-collapsed';
import {connect} from 'react-redux'
import Field from './Field';
import './form.less';

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

function Form({form, setForm}) {
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
              field="house.price"
            />
            <Field
              label="Maintenance"
              description="monthly maintenance/strata fees"
              field="house.maintenance"
            />
            <Field
              label="Property Taxes"
              description="yearly"
              field="house.propertyTax"
            />
            <Field
              label="Homeowner's Insurance"
              description="monthly"
              field="house.insurance"
            />
            <Field
              label="Expenses increases"
              description="% yearly maintenance, taxes and insurance"
              field="rates.house.expenses"
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
              field="house.downpayment"
            />
            <Field
              focus={isExpandEnd}
              label="Current Interest Rate"
              description="% yearly variable mortgage interest rate"
              field="rates.interest.initial"
            />
            <Field
              label="Future Interest Rate"
              description="% yearly variable mortgage interest rate"
              field="rates.interest.future"
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
              field="rent.current"
            />
            <Field
              label="Market rent"
              description="monthly"
              field="rent.market"
            />
            <Field
              label="Rent increases"
              description="% yearly"
              field="rates.rent.controlled"
            />
            <Field
              label="Market rent increases"
              description="% yearly"
              field="rates.rent.market"
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
              field="rates.house.appreciation"
            />
            <Field
              label="Safe investment return"
              description="% yearly"
              field="rates.bonds.return"
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
              field="scenarios.crash.chance"
            />
            <Field
              focus={isExpandEnd}
              label="Property price drop amount"
              description="% amount drop"
              field="scenarios.crash.drop"
            />
            <Field
              label="Moving"
              description="move every x years"
              field="scenarios.move"
            />
          </>
        )}
      </Group>
    </div>
  );
}

const mapState = (state) => ({
	form: state.form
})

const mapDispatch = (dispatch) => ({
	setForm: dispatch.form.setForm
})

export default connect(mapState, mapDispatch)(Form);

