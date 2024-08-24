import React from 'react';
import numbro from 'numbro';
import { useAtomValue } from 'jotai';
import * as xlsx from 'xlsx';
import Value from './Value';
import {sum} from '../../modules/utils';
import { saleFees } from '../../modules/run.helpers';
import { metaAtom } from '../../atoms/metaAtom';
import { dataAtom } from '../../atoms/dataAtom';
import { type ChartDataPoint } from '../chart/Chart';
import './table.less';

const Q2_INDEX = 1;

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
    years = dataState[Q2_INDEX].length;
    median = dataState[Q2_INDEX][years - 1];
  }

  const onDownload = () => {
    const worksheetData = [
      [
        'Year',
        'Net worth',
        'Property value',
        'Sale costs',
        'Property equity',
        'Property ≈ net',
        'Principal paid',
        'Interest paid',
        'Expenses',
        'Transaction costs',
        'Rent paid',
        'Portfolio ≈ net',
        'Portfolio value',
        'Capital gains tax'
      ]
    ];
    
    let year = 1;
    for (const yearData of dataState[Q2_INDEX]) {     
      worksheetData.push([
        // Year.
        year++,
        // Net worth.
        yearData.buyer.$,
        // Property value.
        yearData.buyer.house.value,
        // Sale costs.
        -sum(saleFees(yearData.buyer.province, yearData.buyer.house.value)),
        // Property equity.
        yearData.buyer.house.equity,
        // Property net.
        yearData.buyer.house.$,
        // Principal.
        yearData.buyer.house.principalPaid,
        // Mortgage interest.
        yearData.buyer.house.interestPaid,
        // Monthly expenses.
        yearData.buyer.house.monthlyExpensesPaid,
        // Costs.
        sum(
          yearData.buyer.house.costs,
          -yearData.buyer.house.principalPaid,
          -yearData.buyer.house.interestPaid,
          -yearData.buyer.house.monthlyExpensesPaid,
        ),
        // Rent paid.
        yearData.buyer.house.rentPaid,
        // Portfolio net.
        yearData.buyer.portfolio.$,
        // Portfolio value.
        yearData.buyer.portfolio.value,
        // Capital gains tax.
        -sum(
          yearData.buyer.portfolio.value,
          -yearData.buyer.portfolio.costs,
        ) * yearData.buyer.portfolio.capitalGainsTaxRate
      ].map(d => d.toString()));
    }

    const workbook = xlsx.utils.book_new();
    const worksheet = xlsx.utils.json_to_sheet(worksheetData);
    xlsx.utils.book_append_sheet(workbook, worksheet, "Buyer");
    xlsx.writeFile(workbook, "wealthwise.xlsx");
  };

  return (
    <div className="table">
      <div className="header">
        <h3 className="h3 title">Your results</h3>
        <div><input type="button" value="Download spreadsheet" onClick={onDownload} /></div>
      </div>
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
                <div>{numbro(median.buyer.house.equity).formatCurrency({
                  thousandSeparated: true,
                  mantissa: 0
                })}</div>
              </div>
              <div className="item">
                <div className="label">- Sale costs</div>
                <span className="dot" />
                <div>{numbro(
                  saleFees(median.buyer.province, median.buyer.house.value),
                ).formatCurrency({
                  thousandSeparated: true,
                  mantissa: 0
                })}</div>
              </div>
              <div className="item">
                <div className="label">≈ Net</div>
                <span className="dot" />
                <div>{numbro(median.buyer.house.$).formatCurrency({
                  thousandSeparated: true,
                  mantissa: 0
                })}</div>
              </div>
              <div className="item">
                <div className="label">Principal paid</div>
                <span className="dot" />
                <div>{numbro(
                  median.buyer.house.principalPaid
                ).formatCurrency({
                  thousandSeparated: true,
                  mantissa: 0
                })}</div>
              </div>
              <div className="item">
                <div className="label">Mortgage interest</div>
                <span className="dot" />
                <div>{numbro(
                  median.buyer.house.interestPaid
                ).formatCurrency({
                  thousandSeparated: true,
                  mantissa: 0
                })}</div>
              </div>
              <div className="item">
                <div className="label">Expenses (maintenance, property tax &amp; insurance)</div>
                <span className="dot" />
                <div>{numbro(
                  median.buyer.house.monthlyExpensesPaid
                ).formatCurrency({
                  thousandSeparated: true,
                  mantissa: 0
                })}</div>
              </div>
              <div className="item">
                <div className="label">Transaction costs (closing, realtor etc.)</div>
                <span className="dot" />
                <div>{numbro(sum(
                  median.buyer.house.costs,
                  -median.buyer.house.principalPaid,
                  -median.buyer.house.interestPaid,
                  -median.buyer.house.monthlyExpensesPaid,
                )).formatCurrency({
                  thousandSeparated: true,
                  mantissa: 0
                })}</div>
              </div>
              <div className="item">
                <div className="label">Rent paid (imputed)</div>
                <span className="dot" />
                <div>{numbro(median.buyer.house.rentPaid).formatCurrency({
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
                <div>{numbro(median.buyer.portfolio.$).formatCurrency({
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
                <div>{numbro(median.renter.portfolio.$).formatCurrency({
                  thousandSeparated: true,
                  mantissa: 0
                })}</div>
              </div>
              <div className="item">
                <div className="label">Rent paid</div>
                <span className="dot" />
                <div>{numbro(median.renter.house.rentPaid).formatCurrency({
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
