import React from 'react';
import {renderHook, WrapperComponent} from '@testing-library/react-hooks';
import {createStore, Provider} from 'jotai';
import * as xlsx from 'xlsx';
import {useDownloadSheet} from '../useDownloadSheet';
import {dataAtom} from '../../atoms/dataAtom';
import {type ChartData} from '../../components/chart/Chart';
import {Province} from '../../interfaces';

jest.mock('xlsx', () => ({
  utils: {
    book_new: jest.fn(() => ({})),
    json_to_sheet: jest.fn(),
    book_append_sheet: jest.fn(),
  },
  writeFile: jest.fn(),
}));

describe('useDownloadSheet', () => {
  const mockChartData: ChartData = [
    [{ // Q1 - 5th
      buyer: {
        $: 100000,
        roi: 0.05,
        province: Province.BC,
        house: {
          $: 80000,
          costs: 7000,
          value: 500000,
          capitalGainsTaxRate: 0,
          rentPaid: 0,
          rentalIncomeReceived: 1200,
          equity: 100000,
          interestPaid: 15000,
          principalPaid: 20000,
          principalRemaining: 380000,
          monthlyExpensesPaid: 1000,
          movingCostsPaid: 5000,
        },
        portfolio: {
          $: 20000,
          costs: 2000,
          value: 25000,
          capitalGainsTaxRate: 0.15,
        },
      },
      renter: {
        $: 150000,
        roi: 0.06,
        province: Province.BC,
        house: {
          $: 0,
          rentPaid: 24000,
        },
        portfolio: {
          $: 150000,
          costs: 5000,
          value: 160000,
          capitalGainsTaxRate: 0.15,
        },
      }
    }],
    [{ // Q2 - median
      buyer: {
        $: 100000,
        roi: 0.05,
        province: Province.BC,
        house: {
          $: 80000,
          costs: 7000,
          value: 500000,
          capitalGainsTaxRate: 0,
          rentPaid: 0,
          rentalIncomeReceived: 1200,
          equity: 100000,
          interestPaid: 15000,
          principalPaid: 20000,
          principalRemaining: 380000,
          monthlyExpensesPaid: 1000,
          movingCostsPaid: 5000,
        },
        portfolio: {
          $: 20000,
          costs: 2000,
          value: 25000,
          capitalGainsTaxRate: 0.15,
        },
      },
      renter: {
        $: 150000,
        roi: 0.06,
        province: Province.BC,
        house: {
          $: 0,
          rentPaid: 24000,
        },
        portfolio: {
          $: 150000,
          costs: 5000,
          value: 160000,
          capitalGainsTaxRate: 0.15,
        },
      }
    }],
    [{ // Q3 - 95th
      buyer: {
        $: 100000,
        roi: 0.05,
        province: Province.BC,
        house: {
          $: 80000,
          costs: 7000,
          value: 500000,
          capitalGainsTaxRate: 0,
          rentPaid: 0,
          rentalIncomeReceived: 1200,
          equity: 100000,
          interestPaid: 15000,
          principalPaid: 20000,
          principalRemaining: 380000,
          monthlyExpensesPaid: 1000,
          movingCostsPaid: 5000,
        },
        portfolio: {
          $: 20000,
          costs: 2000,
          value: 25000,
          capitalGainsTaxRate: 0.15,
        },
      },
      renter: {
        $: 150000,
        roi: 0.06,
        province: Province.BC,
        house: {
          $: 0,
          rentPaid: 24000,
        },
        portfolio: {
          $: 150000,
          costs: 5000,
          value: 160000,
          capitalGainsTaxRate: 0.15,
        },
      }
    }]
  ];

  let store: ReturnType < typeof createStore > ;

  beforeEach(() => {
    jest.clearAllMocks();
    store = createStore();
    store.set(dataAtom, mockChartData);
  });

  const Wrapper: WrapperComponent<any> = ({children}) => (
    <Provider store={store}>{children}</Provider>
  );

  const renderHookWithStore = () =>
    renderHook(() => useDownloadSheet(), {
      wrapper: Wrapper
    });

  it('should pass correct data to xlsx utils', () => {
    const {
      result
    } = renderHookWithStore();
    result.current();

    const jsonToSheetCalls = (xlsx.utils.json_to_sheet as jest.Mock).mock.calls;
    const buyerData = jsonToSheetCalls[0][0]; // Buyer data is the first sheet

    // Check header row
    expect(buyerData[0]).toEqual([
      'Year',
      'Net worth',
      'ROI',
      'Property value',
      'Sale costs',
      'Property equity',
      'Property ≈ net',
      'Principal paid',
      'Interest paid',
      'Expenses',
      'Moving costs',
      'Rent paid (imputed)',
      'Rental income received',
      'Portfolio ≈ net',
      'Portfolio value',
      'Capital gains tax'
    ]);

    // Check data row
    const dataRow = buyerData[1]; // First data row (Year 1)
    expect(dataRow).toEqual([
      '1',          // Year
      '100000.00',  // Net worth
      '5.00%',      // ROI
      '500000.00',  // Property value
      '-20910.00',  // Sale costs
      '100000.00',  // Property equity
      '80000.00',   // Property ≈ net
      '20000.00',   // Principal paid
      '15000.00',   // Interest paid
      '1000.00',    // Expenses
      '5000.00',    // Moving costs
      '0.00',       // Rent paid (imputed)
      '1200.00',    // Rental income received
      '20000.00',   // Portfolio ≈ net
      '25000.00',   // Portfolio value
      '-3450.00'    // Capital gains tax
    ]);
  });

  it('should pass correct renter data to xlsx utils', () => {
    const {
      result
    } = renderHookWithStore();
    result.current();

    const jsonToSheetCalls = (xlsx.utils.json_to_sheet as jest.Mock).mock.calls;
    const renterData = jsonToSheetCalls[1][0]; // Renter data is the second sheet

    // Check header row
    expect(renterData[0]).toEqual([
      'Year',
      'Net worth',
      'ROI',
      'Rent paid',
      'Portfolio value',
      'Capital gains tax'
    ]);

    // Check data row
    const dataRow = renterData[1];
    expect(dataRow).toEqual([
      '1',          // Year
      '150000.00',  // Net worth
      '6.00%',      // ROI
      '24000.00',   // Rent paid
      '160000.00',  // Portfolio value
      '-23250.00'   // Capital gains tax
    ]);
  });

  it('should write file with correct name', () => {
    const {
      result
    } = renderHookWithStore();
    result.current();

    expect(xlsx.writeFile).toHaveBeenCalledWith(
      expect.anything(),
      'wealthwise.xlsx'
    );
  });
});
