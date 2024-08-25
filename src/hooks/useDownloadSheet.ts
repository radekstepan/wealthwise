import { useCallback } from "react";
import { useAtomValue } from "jotai";
import * as xlsx from 'xlsx';
import { dataAtom } from "../atoms/dataAtom";
import { saleFees } from "../modules/run.helpers";
import { sum } from "../modules/utils";

const Q2_INDEX = 1;
const FILE_NAME = "wealthwise.xlsx";
const COLUMNS = [
  'Year',
  'Net worth',
  'Property value',
  'Sale costs',
  'Property equity',
  'Property ≈ net',
  'Principal paid',
  'Interest paid',
  'Expenses',
  'Moving costs',
  'Rent paid',
  'Portfolio ≈ net',
  'Portfolio value',
  'Capital gains tax'
];

export const useDownloadSheet = () => {
  const dataState = useAtomValue(dataAtom);

  return useCallback(() => {
    const worksheetData = [
      COLUMNS
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
        // Moving expenses.
        yearData.buyer.house.movingCostsPaid,
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
    xlsx.writeFile(workbook, FILE_NAME);
  }, [dataState]);
};
