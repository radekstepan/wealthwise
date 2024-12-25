import { useCallback } from "react";
import { useAtomValue } from "jotai";
import * as xlsx from 'xlsx';
import { dataAtom } from "../atoms/dataAtom";
import { saleFees } from "../modules/fees";
import { sum } from "../modules/utils";

const Q2_INDEX = 1;
const FILE_NAME = "wealthwise.xlsx";
const BUYER_COLUMNS = [
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
  'Rent paid',
  'Portfolio ≈ net',
  'Portfolio value',
  'Capital gains tax'
];
const RENTER_COLUMNS = [
  'Year',
  'Net worth',
  'ROI',
  'Rent paid',
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
        `${year + 1}`,
        // Net worth.
        data.buyer.$.toFixed(2),
        // ROI.
        `${(data.buyer.roi * 100).toFixed(2)}%`,
        // Property value.
        data.buyer.house.value.toFixed(2),
        // Sale costs.
        (-sum(saleFees(data.buyer.province, data.buyer.house.value))).toFixed(2),
        // Property equity.
        data.buyer.house.equity.toFixed(2),
        // Property net.
        data.buyer.house.$.toFixed(2),
        // Principal.
        data.buyer.house.principalPaid.toFixed(2),
        // Mortgage interest.
        data.buyer.house.interestPaid.toFixed(2),
        // Monthly expenses.
        data.buyer.house.monthlyExpensesPaid.toFixed(2),
        // Moving expenses.
        data.buyer.house.movingCostsPaid.toFixed(2),
        // Rent paid.
        data.buyer.house.rentPaid.toFixed(2),
        // Portfolio net.
        data.buyer.portfolio.$.toFixed(2),
        // Portfolio value.
        data.buyer.portfolio.value.toFixed(2),
        // Capital gains tax.
        (-sum(
          data.buyer.portfolio.value,
          -data.buyer.portfolio.costs,
        ) * data.buyer.portfolio.capitalGainsTaxRate).toFixed(2),
      ])
      return acc;
    }, [BUYER_COLUMNS]);

    const buyerSheet = xlsx.utils.json_to_sheet(buyerJson);
    xlsx.utils.book_append_sheet(workbook, buyerSheet, "Buyer");

    const renterJson = dataState[Q2_INDEX].reduce((acc, data, year) => {
      acc.push([
        // Year.
        `${year + 1}`,
        // Portfolio net.
        data.renter.portfolio.$.toFixed(2),
        // ROI.
        `${(data.renter.roi * 100).toFixed(2)}%`,
        // Rent paid.
        data.renter.house.rentPaid.toFixed(2),
        // Portfolio value.
        data.renter.portfolio.value.toFixed(2),
        // Capital gains tax.
        (-sum(
          data.renter.portfolio.value,
          -data.renter.portfolio.costs,
        ) * data.renter.portfolio.capitalGainsTaxRate).toFixed(2)
      ])
      return acc;
    }, [RENTER_COLUMNS]);

    const renterSheet = xlsx.utils.json_to_sheet(renterJson);
    xlsx.utils.book_append_sheet(workbook, renterSheet, "Renter");

    xlsx.writeFile(workbook, FILE_NAME);
  }, [dataState]);
};
