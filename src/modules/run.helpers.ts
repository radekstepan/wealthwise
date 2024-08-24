import { Province } from '../config';
import {sum} from './utils';

const landTransferTaxAB = (houseValue: number) => Math.ceil(houseValue / 5000) * 5;

const landTransferTaxBC = (houseValue: number, isFirstTimeBuyer=true, isNewlyBuilt=false, isLessThanHalfHectare=true) => {
  // Base tax rates
  const rate1 = 0.01; // 1% on the first $200,000
  const rate2 = 0.02; // 2% on $200,000 to $2,000,000
  const rate3 = 0.03; // 3% on the portion greater than $2,000,000
  const rate4 = 0.05; // Additional 2% (5% total) on the portion greater than $3,000,000

  let tax = 0;

  // Calculate base tax
  if (houseValue <= 200000) {
    tax = houseValue * rate1;
  } else if (houseValue <= 2000000) {
    tax = 200000 * rate1 + (houseValue - 200000) * rate2;
  } else if (houseValue <= 3000000) {
    tax = 200000 * rate1 + 1800000 * rate2 + (houseValue - 2000000) * rate3;
  } else {
    tax = 200000 * rate1 + 1800000 * rate2 + 1000000 * rate3 + (houseValue - 3000000) * rate4;
  }

  // Apply exemptions
  if (isFirstTimeBuyer) {
    if (houseValue <= 500000) {
      return 0; // Full exemption
    }
    if (houseValue < 525000) {
      // Partial exemption
      const exemption = 8000 * (525000 - houseValue) / 25000;
      return Math.max(0, tax - exemption);
    }
    if (houseValue <= 835000) {
      return Math.max(0, tax - 8000); // $8,000 exemption
    }
    if (houseValue < 860000) {
      // Partial exemption
      const exemption = 8000 * (860000 - houseValue) / 25000;
      return Math.max(0, tax - exemption);
    }
  }

  if (isNewlyBuilt && isLessThanHalfHectare) {
    if (houseValue <= 750000) {
      return 0; // Full exemption
    }
    if (houseValue <= 800000) {
      // Partial exemption
      return tax * (1 - (800000 - houseValue) / 50000);
    }
  }

  if (isNewlyBuilt) {
    if (houseValue <= 1100000) {
      return 0; // Full exemption
    }
    if (houseValue <= 1150000) {
      // Partial exemption
      return tax * (1 - (1150000 - houseValue) / 50000);
    }
  }

  return tax;
}

// https://www.truenorthmortgage.ca/tools/land-transfer-tax-calculator
export const landTransferTax = (province: Province, houseValue: number, isFirstTimeBuyer: boolean) => {
  switch (province) {
    case Province.AB:
      return landTransferTaxAB(houseValue);
    case Province.BC:
      return landTransferTaxBC(houseValue, isFirstTimeBuyer);
    default:
      return 0;
  }
};

// Calculate the Canada Mortgage and Housing Corporation (CMHC)
//  insurance premium on a home mortgage loan.
// https://wowa.ca/calculators/cmhc-insurance
// TODO only works on max 25 year mortgages
export const cmhc = (downpayment: number, price: number) => {
  if (downpayment >= 0.2) {
    return 0;
  }
  if (price > 1000000) {
    return 0; // not applicable
  }
  if (downpayment < 0.05) {
    return 0; // not applicable
  }
  if (downpayment < 0.1) {
    return ((1 - downpayment) * price) * 0.04;
  }
  if (downpayment < 0.15) {
    return ((1 - downpayment) * price) * 0.031;
  }
  return ((1 - downpayment) * price) * 0.028;
};

// This function calculates the cost of selling a house. The function
//  takes a single argument, price, which is the sale price of the house.
//  The function first adds $750 to the total cost for legal fees, then
//  calculates the cost of the real estate agents' commissions. The
//  commission is 3% on the first $100,000 of the sale price, and 1.5% on
//  any amount above $100,000. The commission is then multiplied by two
//  to account for two agents, and increased by 5% to account for sales tax.
// https://www.truenorthmortgage.ca/tools/land-transfer-tax-calculator
export const saleFees = (province: Province, houseValue: number) => {
  let salesTax = 1;
  if (province === Province.AB) {
    salesTax = 1.05;
  } else if (province === Province.BC) {
    salesTax = 1.12;
  }

  return sum(
    750, // legal fees
    sum(
      Math.min(houseValue, 100000) * 0.03, // 3% on the first $100k
      Math.max(houseValue - 100000, 0) * 0.015 // 1.5% on the rest
    ) * 2 * salesTax // 2 agents + sales tax
  );
};
