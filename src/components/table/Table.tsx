import React from 'react';
import {connect} from 'react-redux'
import Value from './Value';
import {sum} from '../../modules/utils';
import './table.less';

function Table({current}) {
  if (!current) {
    return null;
  }

  return (
    <div className="table">
      <h3 className="h3 title">Your results</h3>
      <div className="list">
        <div className="group">
          <div className="item bold">
            <div className="label">Initial costs</div>
            <span className="dot" />
            <Value>{d => sum(
              d.downpayment,
              d.closingAndTax,
              d.cmhc
            )}</Value>
          </div>
          <div className="item">
            <div className="label">Downpayment</div>
            <span className="dot" />
            <Value>{d => d.downpayment}</Value>
          </div>
          <div className="item">
            <div className="label">Land transfer tax &amp; closing costs</div>
            <span className="dot" />
            <Value>{d => d.closingAndTax}</Value>
          </div>
          {current.cmhc ? <div className="item">
            <div className="label">CMHC insurance</div>
            <span className="dot" />
            <Value>{d => d.cmhc}</Value>
          </div> : null}
        </div>
        <div className="group">
          <div className="item bold">
            <div className="label">Monthly expenses</div>
            <span className="dot" />
            <Value>{d => sum(
              d.payment,
              d.expenses
            )}</Value>
          </div>
          <div className="item">
            <div className="label">Mortgage payment</div>
            <span className="dot" />
            <Value>{d => d.payment}</Value>
          </div>
          <div className="item">
            <div className="label">Maintenance, property tax &amp; insurance</div>
            <span className="dot" />
            <Value>{d => d.expenses}</Value>
          </div>
        </div>
      </div>
    </div>
  );
}

const mapState = (state) => ({
  current: state.meta.current,
	previous: state.meta.previous,
});

export default connect(mapState)(Table);
