import { Province } from '../interfaces';
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

  // if (isNewlyBuilt && isLessThanHalfHectare) {
  //   if (houseValue <= 750000) {
  //     return 0; // Full exemption
  //   }
  //   if (houseValue <= 800000) {
  //     // Partial exemption
  //     return tax * (1 - (800000 - houseValue) / 50000);
  //   }
  // }

  // if (isNewlyBuilt) {
  //   if (houseValue <= 1100000) {
  //     return 0; // Full exemption
  //   }
  //   if (houseValue <= 1150000) {
  //     // Partial exemption
  //     return tax * (1 - (1150000 - houseValue) / 50000);
  //   }
  // }

  return tax;
}

const landTransferTaxON = (houseValue: number) => {
  let tax = 0;
  
  // First bracket: 0.5% up to $55,000
  if (houseValue <= 55000) {
    tax = houseValue * 0.005;
  } else {
    tax += 55000 * 0.005;
    
    // Second bracket: 1% from $55,001 to $250,000
    if (houseValue <= 250000) {
      tax += (houseValue - 55000) * 0.01;
    } else {
      tax += (250000 - 55000) * 0.01;
      
      // Third bracket: 1.5% from $250,001 to $400,000
      if (houseValue <= 400000) {
        tax += (houseValue - 250000) * 0.015;
      } else {
        tax += (400000 - 250000) * 0.015;
        
        // Fourth bracket: 2% from $400,001 to $2,000,000
        if (houseValue <= 2000000) {
          tax += (houseValue - 400000) * 0.02;
        } else {
          tax += (2000000 - 400000) * 0.02;
          
          // Fifth bracket: 2.5% over $2,000,000
          tax += (houseValue - 2000000) * 0.025;
        }
      }
    }
  }
  
  return tax;
};

const landTransferTaxToronto = (houseValue: number) => {
  let tax = 0;
  
  // First bracket: 0.5% up to $55,000
  if (houseValue <= 55000) {
    tax = houseValue * 0.005;
  } else {
    tax += 55000 * 0.005;
    
    // Second bracket: 1% from $55,001 to $250,000
    if (houseValue <= 250000) {
      tax += (houseValue - 55000) * 0.01;
    } else {
      tax += (250000 - 55000) * 0.01;
      
      // Third bracket: 1.5% from $250,001 to $400,000
      if (houseValue <= 400000) {
        tax += (houseValue - 250000) * 0.015;
      } else {
        tax += (400000 - 250000) * 0.015;
        
        // Fourth bracket: 2% from $400,001 to $2,000,000
        if (houseValue <= 2000000) {
          tax += (houseValue - 400000) * 0.02;
        } else {
          tax += (2000000 - 400000) * 0.02;
          
          // Fifth bracket: 2.5% from $2M to $3M
          if (houseValue <= 3000000) {
            tax += (houseValue - 2000000) * 0.025;
          } else {
            tax += (3000000 - 2000000) * 0.025;
            
            // Sixth bracket: 3.5% from $3M to $4M
            if (houseValue <= 4000000) {
              tax += (houseValue - 3000000) * 0.035;
            } else {
              tax += (4000000 - 3000000) * 0.035;
              
              // Seventh bracket: 4.5% from $4M to $5M
              if (houseValue <= 5000000) {
                tax += (houseValue - 4000000) * 0.045;
              } else {
                tax += (5000000 - 4000000) * 0.045;
                
                // Eighth bracket: 5.5% from $5M to $10M
                if (houseValue <= 10000000) {
                  tax += (houseValue - 5000000) * 0.055;
                } else {
                  tax += (10000000 - 5000000) * 0.055;
                  
                  // Ninth bracket: 6.5% from $10M to $20M
                  if (houseValue <= 20000000) {
                    tax += (houseValue - 10000000) * 0.065;
                  } else {
                    tax += (20000000 - 10000000) * 0.065;
                    
                    // Final bracket: 7.5% over $20M
                    tax += (houseValue - 20000000) * 0.075;
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  
  return tax;
};

// https://www.truenorthmortgage.ca/tools/land-transfer-tax-calculator
export const landTransferTax = (province: Province, houseValue: number, isFirstTimeBuyer: boolean) => {
  switch (province) {
    case Province.AB:
      return landTransferTaxAB(houseValue);
    case Province.BC:
      return landTransferTaxBC(houseValue, isFirstTimeBuyer);
    case Province.ON:
      return landTransferTaxON(houseValue);
    case Province.Toronto:
      return landTransferTaxON(houseValue) + landTransferTaxToronto(houseValue);
    default:
      return 0;
  }
};

// Calculate the Canada Mortgage and Housing Corporation (CMHC)
//  insurance premium on a home mortgage loan.
// https://wowa.ca/calculators/cmhc-insurance
// NOTE only works on max 25 year mortgages
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
