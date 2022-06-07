import React from 'react';
import {connect} from 'react-redux'
import numbro from 'numbro';
import Value from './Value';
import {sum} from '../../modules/utils';
import {saleFees} from '../../modules/run.helpers';
import './table.less';

const CAPITAL_GAINS_TAX = 0.5;
const YEARS = 25;

function Table({current, data}) {
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
        {data && (
          <>
            <div className="group">
              <div className="item bold">
                <div className="label">Property <em>value in {YEARS} years</em></div>
                <span className="dot" />
                <div>{numbro(data.buy + data.buyCosts).formatCurrency({
                  thousandSeparated: true,
                  mantissa: 0
                })}</div>
              </div>
              <div className="item">
                <div className="label">- Costs</div>
                <span className="dot" />
                <div>{numbro(data.buyCosts + data.buyRent).formatCurrency({
                  thousandSeparated: true,
                  mantissa: 0
                })}</div>
              </div>
              <div className="item">
                <div className="label">+ Rent paid <em>imputed</em></div>
                <span className="dot" />
                <div>{numbro(data.buyRent).formatCurrency({
                  thousandSeparated: true,
                  mantissa: 0
                })}</div>
              </div>
              <div className="item">
                <div className="label">- Sale costs</div>
                <span className="dot" />
                <div>{numbro(saleFees(data.buy)).formatCurrency({
                  thousandSeparated: true,
                  mantissa: 0
                })}</div>
              </div>
              <div className="item">
                <div className="label">≈ Net</div>
                <span className="dot" />
                <div>{numbro(data.buy - saleFees(data.buy)).formatCurrency({
                  thousandSeparated: true,
                  mantissa: 0
                })}</div>
              </div>
            </div>
            <div className="group">
              <div className="item bold">
                <div className="label">Portfolio <em>value in {YEARS} years</em></div>
                <span className="dot" />
                <div>{numbro(data.rent + data.rentCosts).formatCurrency({
                  thousandSeparated: true,
                  mantissa: 0
                })}</div>
              </div>
              <div className="item">
                <div className="label">- Invested</div>
                <span className="dot" />
                <div>{numbro(data.rentCosts).formatCurrency({
                  thousandSeparated: true,
                  mantissa: 0
                })}</div>
              </div>
              <div className="item">
                <div className="label">- Capital gains tax <em>of {(CAPITAL_GAINS_TAX * 100).toFixed(0)}%</em></div>
                <span className="dot" />
                <div>{numbro(data.rent * CAPITAL_GAINS_TAX * 0.5).formatCurrency({
                  thousandSeparated: true,
                  mantissa: 0
                })}</div>
              </div>
              <div className="item">
                <div className="label">≈ Net</div>
                <span className="dot" />
                <div>{numbro(data.rent * 0.75).formatCurrency({
                  thousandSeparated: true,
                  mantissa: 0
                })}</div>
              </div>
              <div className="item">
                <div className="label">Rent paid</div>
                <span className="dot" />
                <div>{numbro(data.rentRent).formatCurrency({
                  thousandSeparated: true,
                  mantissa: 0
                })}</div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const mapState = (state) => ({
  data: state.data ? state.data[1][state.data[1].length - 1] : null,
  current: state.meta.current,
	previous: state.meta.previous
});

export default connect(mapState)(Table);
