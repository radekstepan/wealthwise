export const range = (n: number) => Array(n).fill(1).map((_, i) => i);
export const range1 = (n: number) => Array(n).fill(1).map((_, i) => i + 1);
export const sum = (...args: number[]) => args.reduce((t, d) => t + d, 0);

// Get a number within an acceptable min/max range.
export const within = (get: () => number, min: number, max: number) => {
  let tries = 1000; // overflow check

  while (tries) {
    tries -= 1;
    const n = get();
    if (n >= min && n <= max) {
      return n;
    }
  }

  throw new Error('All generated numbers fell out of range');
};


export const closingAndTax = (price: number) => sum(
  // closing costs https://www.ratehub.ca/mortgage-payment-calculator
  2450,
  // land transfer tax
  Math.min(price, 200000) * 0.01,
  Math.min(Math.max(price - 200000, 0), 2000000) * 0.02,
  Math.max(price - 2000000, 0) * 0.03
);

// https://wowa.ca/calculators/cmhc-insurance
// TODO only works on max 25 year mortgages
export const cmhc = (downpayment: number, price: number) => {
  if (downpayment >= 0.2) {
    return 0;
  }
  if (price > 1000000) {
    throw new Error('CMHC insurance not applicable');
  }
  if (downpayment < 0.05) {
    throw new Error('CMHC insurance not applicable');
  }
  if (downpayment < 0.1) {
    return ((1 - downpayment) * price) * 0.04;
  }
  if (downpayment < 0.15) {
    return ((1 - downpayment) * price) * 0.031;
  }
  return ((1 - downpayment) * price) * 0.028;
};

// https://wowa.ca/calculators/cost-selling-house
export const saleFees = (price: number) => sum(
  750, // legal fees
  sum(
    Math.min(price, 100000) * 0.03, // 3% on the first $100k
    Math.max(price - 100000, 0) * 0.015 // 1.5% on the rest
  ) * 2 * 1.05 // 2 agents + sales tax
);
