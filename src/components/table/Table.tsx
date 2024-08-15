import React from 'react';
import numbro from 'numbro';
import { useAtomValue } from 'jotai';
import Value from './Value';
import {sum} from '../../modules/utils';
import { saleFees } from '../../modules/run.helpers';
import { metaAtom } from '../../atoms/metaAtom';
import { dataAtom } from '../../atoms/dataAtom';
import { type ChartDataPoint } from '../chart/Chart';
import { Province } from '../../config';
import './table.less';

// The component renders a table with several groups of items, each
//  containing a label and a value. The value for each item is
//  calculated using a Value component, which receives a function that
//  specifies how the value should be calculated.
function Table() {
  const metaState = useAtomValue(metaAtom);
  const dataState = useAtomValue(dataAtom);

  // Check that the meta atom is initialized.
  if (metaState.downpayment === null) {
    return null;
  }

  let median: ChartDataPoint|null = null;
  let years: number|null = null;
  if (dataState.length) {
    years = dataState[1].length;
    median = dataState[1][years - 1];
  }

  return (
    <div className="table">
      <h3 className="h3 title">Your results</h3>
      <div className="list">
        <div className="group">
          <div className="item bold">
            <div className="label">Initial costs</div>
            <span className="dot" />
            <Value d={sum(
              metaState.downpayment,
              metaState.closingAndTax,
              metaState.cmhc
            )} />
          </div>
          <div className="item">
            <div className="label">Downpayment</div>
            <span className="dot" />
            <Value d={metaState.downpayment} />
          </div>
          <div className="item">
            <div className="label">Closing costs</div>
            <span className="dot" />
            <Value d={metaState.closingAndTax} />
          </div>
          {metaState.cmhc ? <div className="item">
            <div className="label">CMHC insurance</div>
            <span className="dot" />
            <Value d={metaState.cmhc} />
          </div> : null}
        </div>
        <div className="group">
          <div className="item bold">
            <div className="label">Monthly expenses</div>
            <span className="dot" />
            <Value d={sum(
              metaState.payment,
              metaState.expenses
            )} />
          </div>
          <div className="item">
            <div className="label">Mortgage payment</div>
            <span className="dot" />
            <Value d={metaState.payment} />
          </div>
          <div className="item">
            <div className="label">Maintenance, property tax &amp; insurance</div>
            <span className="dot" />
            <Value d={metaState.expenses} />
          </div>
        </div>
        {median && (
          <>
            <div className="group">
              <div className="item bold">
                <div className="label">Property <em>value in {years} years</em></div>
                <span className="dot" />
                <div>{numbro(median.buyer.house.value).formatCurrency({
                  thousandSeparated: true,
                  mantissa: 0
                })}</div>
              </div>
              <div className="item">
                <div className="label">- Costs</div>
                <span className="dot" />
                <div>{numbro(sum(
                  median.buyer.house.costs,
                  median.buyer.rentPaid
                )).formatCurrency({
                  thousandSeparated: true,
                  mantissa: 0
                })}</div>
              </div>
              <div className="item">
                <div className="label">+ Rent paid <em>imputed</em></div>
                <span className="dot" />
                <div>{numbro(median.buyer.rentPaid).formatCurrency({
                  thousandSeparated: true,
                  mantissa: 0
                })}</div>
              </div>
              <div className="item">
                <div className="label">- Sale costs</div>
                <span className="dot" />
                <div>{numbro(
                  // TODO hardcoded province
                  saleFees(Province.Alberta, median.buyer.house.value),
                ).formatCurrency({
                  thousandSeparated: true,
                  mantissa: 0
                })}</div>
              </div>
              <div className="item">
                <div className="label">≈ Net</div>
                <span className="dot" />
                <div>{numbro(sum(
                  median.buyer.house.value,
                  -median.buyer.house.costs,
                  // TODO hardcoded province
                  -saleFees(Province.Alberta, median.buyer.house.value)
                )).formatCurrency({
                  thousandSeparated: true,
                  mantissa: 0
                })}</div>
              </div>
            </div>
            <div className="group">
              <div className="item bold">
                <div className="label">Buyer portfolio <em>value in {years} years</em></div>
                <span className="dot" />
                <div>{numbro(median.buyer.portfolio.value).formatCurrency({
                  thousandSeparated: true,
                  mantissa: 0
                })}</div>
              </div>
              <div className="item">
                <div className="label">- Invested</div>
                <span className="dot" />
                <div>{numbro(median.buyer.portfolio.costs).formatCurrency({
                  thousandSeparated: true,
                  mantissa: 0
                })}</div>
              </div>
              <div className="item">
                <div className="label">- Capital gains tax <em>of {(median.buyer.portfolio.capitalGainsTaxRate * 100).toFixed(0)}%</em></div>
                <span className="dot" />
                <div>{numbro(sum(
                  median.buyer.portfolio.value,
                  -median.buyer.portfolio.costs,
                ) * median.buyer.portfolio.capitalGainsTaxRate).formatCurrency({
                  thousandSeparated: true,
                  mantissa: 0
                })}</div>
              </div>
              <div className="item">
                <div className="label">≈ Net</div>
                <span className="dot" />
                <div>{numbro(sum(
                  median.buyer.portfolio.value,
                  -median.buyer.portfolio.costs,
                  -sum(
                    median.buyer.portfolio.value,
                    -median.buyer.portfolio.costs,
                  ) * median.buyer.portfolio.capitalGainsTaxRate
                )).formatCurrency({
                  thousandSeparated: true,
                  mantissa: 0
                })}</div>
              </div>
            </div>
            <div className="group">
              <div className="item bold">
                <div className="label">Renter portfolio <em>value in {years} years</em></div>
                <span className="dot" />
                <div>{numbro(median.renter.portfolio.value).formatCurrency({
                  thousandSeparated: true,
                  mantissa: 0
                })}</div>
              </div>
              <div className="item">
                <div className="label">- Invested</div>
                <span className="dot" />
                <div>{numbro(median.renter.portfolio.costs).formatCurrency({
                  thousandSeparated: true,
                  mantissa: 0
                })}</div>
              </div>
              <div className="item">
                <div className="label">- Capital gains tax <em>of {(median.renter.portfolio.capitalGainsTaxRate * 100).toFixed(0)}%</em></div>
                <span className="dot" />
                <div>{numbro(sum(
                  median.renter.portfolio.value,
                  -median.renter.portfolio.costs,
                ) * median.renter.portfolio.capitalGainsTaxRate).formatCurrency({
                  thousandSeparated: true,
                  mantissa: 0
                })}</div>
              </div>
              <div className="item">
                <div className="label">≈ Net</div>
                <span className="dot" />
                <div>{numbro(sum(
                  median.renter.portfolio.value,
                  -median.renter.portfolio.costs,
                  -sum(
                    median.renter.portfolio.value,
                    -median.renter.portfolio.costs,
                  ) * median.renter.portfolio.capitalGainsTaxRate
                )).formatCurrency({
                  thousandSeparated: true,
                  mantissa: 0
                })}</div>
              </div>
              <div className="item">
                <div className="label">Rent paid</div>
                <span className="dot" />
                <div>{numbro(median.renter.rentPaid).formatCurrency({
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

export default Table;
