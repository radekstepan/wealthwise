import { useCallback } from "react";
import { useAtomValue } from "jotai";
import * as xlsx from 'xlsx';
import { dataAtom } from "../atoms/dataAtom";
import { saleFees } from "../modules/run.helpers";
import { sum } from "../modules/utils";

const Q2_INDEX = 1;
const FILE_NAME = "wealthwise.xlsx";
const BUYER_COLUMNS = [
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
const RENTER_COLUMNS = [
  'Year',
  'Rent paid',
  'Portfolio ≈ net',
  'Portfolio value',
  'Capital gains tax'
]

export const useDownloadSheet = () => {
  const dataState = useAtomValue(dataAtom);

  return useCallback(() => {
    const workbook = xlsx.utils.book_new();

    const buyerJson = dataState[Q2_INDEX].reduce((acc, data, year) => {
      acc.push([
        // Year.
        year + 1,
        // Net worth.
        data.buyer.$,
        // Property value.
        data.buyer.house.value,
        // Sale costs.
        -sum(saleFees(data.buyer.province, data.buyer.house.value)),
        // Property equity.
        data.buyer.house.equity,
        // Property net.
        data.buyer.house.$,
        // Principal.
        data.buyer.house.principalPaid,
        // Mortgage interest.
        data.buyer.house.interestPaid,
        // Monthly expenses.
        data.buyer.house.monthlyExpensesPaid,
        // Moving expenses.
        data.buyer.house.movingCostsPaid,
        // Rent paid.
        data.buyer.house.rentPaid,
        // Portfolio net.
        data.buyer.portfolio.$,
        // Portfolio value.
        data.buyer.portfolio.value,
        // Capital gains tax.
        -sum(
          data.buyer.portfolio.value,
          -data.buyer.portfolio.costs,
        ) * data.buyer.portfolio.capitalGainsTaxRate
      ].map(d => d.toFixed(2)))
      return acc;
    }, [BUYER_COLUMNS]);

    const buyerSheet = xlsx.utils.json_to_sheet(buyerJson);
    xlsx.utils.book_append_sheet(workbook, buyerSheet, "Buyer");

    const renterJson = dataState[Q2_INDEX].reduce((acc, data, year) => {
      acc.push([
        // Year.
        year + 1,
        // Rent paid.
        data.renter.house.rentPaid,
        // Portfolio net.
        data.renter.portfolio.$,
        // Portfolio value.
        data.renter.portfolio.value,
        // Capital gains tax.
        -sum(
          data.renter.portfolio.value,
          -data.renter.portfolio.costs,
        ) * data.renter.portfolio.capitalGainsTaxRate
      ].map(d => d.toFixed(2)))
      return acc;
    }, [RENTER_COLUMNS]);

    const renterSheet = xlsx.utils.json_to_sheet(renterJson);
    xlsx.utils.book_append_sheet(workbook, renterSheet, "Renter");

    xlsx.writeFile(workbook, FILE_NAME);
  }, [dataState]);
};
