import React, {useCallback, useState} from 'react';
import {IoIosArrowDown, IoIosArrowUp} from 'react-icons/io';
import useCollapse from 'react-collapsed';
import { useAtomValue } from 'jotai';
import Field from './Field';
import { formAtom } from '../../atoms/formAtom';
import './form.less';

// Group uses the useCollapse hook to animate the expansion and collapse
//  of the group. It passes a callback to its children that allows the
//  children to know when the expansion animation has ended. This is used
//  to focus on the first field in the group when it expands.
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

// The Header component is used to render the group's title and summary,
//  and to provide a toggle to expand and collapse the group.
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

export default function Form() {
  const form = useAtomValue(formAtom);

  return (
    <div className="form">
      <Group title="Property" summary={form.house.price[0]} expanded>
        {({isExpandEnd}) => (
          <>
            <Field
              focus={isExpandEnd}
              label="Price"
              placeholder="Property price"
              field="house.price"
            />
            <Field
              label="Maintenance"
              description="monthly maintenance/strata fees"
              field="house.maintenance"
            />
            <Field
              label="Property taxes"
              description="yearly"
              field="house.propertyTax"
            />
            <Field
              label="Homeowner's insurance"
              description="monthly"
              field="house.insurance"
            />
            <Field
              label="Expenses increases"
              description="% yearly maintenance, taxes and insurance"
              field="rates.house.expenses"
            />
            <Field
              label="Province"
              field="province"
            />
          </>
        )}
      </Group>
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
              label="Current interest rate"
              description="% yearly mortgage interest rate"
              field="rates.interest.initial"
            />
            <Field
              label="Future interest rate"
              description="% yearly mortgage interest rate"
              field="rates.interest.future"
            />
            <Field
              label="Amortization"
              description="years"
              field="mortgage.amortization"
              readOnly
            />
            <Field
              label="Term"
              description="years"
              field="mortgage.term"
              readOnly
            />
            <Field
              label="Fixed rate"
              description="is this a fixed rate mortgage"
              field="mortgage.isFixedRate"
            />
          </>
        )}
      </Group>
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
            <Field
              label="Capital gains tax"
              description="% rate applied to stock returns"
              field="rates.bonds.capitalGainsTax"
            />
          </>
        )}
      </Group>
      <Group title="Scenarios" summary={`Move every ${form.scenarios.move.tenureYears[0]} year${form.scenarios.move.tenureYears[0] === '1' ? '' : 's'}`}>
        {({isExpandEnd}) => (
          <>
            <Field
              label="Simulation"
              description="simulate x years"
              field="scenarios.simulate.years"
            />
            <Field
              label="Number of Samples"
              description="Simulations to run (higher = smoother, slower)"
              field="scenarios.simulate.samples"
            />
            <Field
              label="Property price drop chance"
              description="% chance over the amortization period"
              field="scenarios.crash.chance"
            />
            <Field
              focus={isExpandEnd}
              label="Property price drop amount"
              description="% amount drop"
              field="scenarios.crash.drop"
            />
            <Field
              label="Years before moving"
              description="move every x years"
              field="scenarios.move.tenureYears"
            />
            <Field
              label="New home premium"
              description="yearly new home price premium"
              field="scenarios.move.annualMoveUpCost"
            />
            <Field
              label="Principal prepayment"
              description="% of the original principal each year"
              field="scenarios.mortgage.anniversaryPaydown"
            />
          </>
        )}
      </Group>
    </div>
  );
}
