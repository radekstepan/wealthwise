// @ts-ignore
import * as formula from '@formulajs/formulajs';
import { apyToAprMonthly, pmt } from '../formula';

jest.mock('@formulajs/formulajs', () => ({
  NOMINAL: jest.fn()
}));

describe('apyToAprMonthly', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('returns 0 when input is 0', () => {
    expect(apyToAprMonthly(0)).toBe(0);
  });

  test('returns 0 when input is undefined or null', () => {
    expect(apyToAprMonthly(undefined as any)).toBe(0);
    expect(apyToAprMonthly(null as any)).toBe(0);
  });

  test('converts positive APY to monthly APR correctly', () => {
    // Mock NOMINAL to return a known value
    (formula.NOMINAL as jest.Mock).mockReturnValue(0.12); // 12% annual
    const result = apyToAprMonthly(0.15); // 15% APY
    expect(result).toBeCloseTo(0.01, 4); // Should be close to 1% monthly
    expect(formula.NOMINAL).toHaveBeenCalledWith(0.15, 12);
  });

  test('converts negative APY to monthly APR correctly', () => {
    (formula.NOMINAL as jest.Mock).mockReturnValue(0.12); // 12% annual
    const result = apyToAprMonthly(-0.15); // -15% APY
    expect(result).toBeCloseTo(-0.01, 4); // Should be close to -1% monthly
    expect(formula.NOMINAL).toHaveBeenCalledWith(0.15, 12);
  });
});

describe('pmt', () => {
  test('calculates monthly payment correctly for positive values', () => {
    // Test case: $1000 loan at 12% annual rate (1% monthly) for 12 months
    const monthlyRate = 0.01;
    const numberOfPayments = 12;
    const presentValue = 1000;
    
    const result = pmt(monthlyRate, numberOfPayments, presentValue);
    // Expected monthly payment should be around $88.85
    expect(result).toBeCloseTo(-88.85, 2);
  });

  test('handles zero interest rate', () => {
    const monthlyRate = 0;
    const numberOfPayments = 12;
    const presentValue = 1000;
    
    const result = pmt(monthlyRate, numberOfPayments, presentValue);
    // With 0% interest, payment should be principal divided by number of payments
    expect(result).toBeCloseTo(-1000 / 12, 2);
  });

  test('handles large number of payments', () => {
    // Test case: 30-year mortgage
    const monthlyRate = 0.005; // 0.5% monthly (6% annual)
    const numberOfPayments = 360; // 30 years * 12 months
    const presentValue = 200000;
    
    const result = pmt(monthlyRate, numberOfPayments, presentValue);
    // Expected monthly payment should be around $1199.10
    expect(result).toBeCloseTo(-1199.10, 2);
  });

  test('handles negative present value', () => {
    const monthlyRate = 0.01;
    const numberOfPayments = 12;
    const presentValue = -1000;
    
    const result = pmt(monthlyRate, numberOfPayments, presentValue);
    expect(result).toBeCloseTo(88.85, 2);
  });
});
