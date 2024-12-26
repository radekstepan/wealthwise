import { nominal, apyToAprMonthly, pmt } from '../formula';

describe('formula', () => {
  describe('nominal', () => {
    // Basic functionality tests
    test('calculates nominal rate correctly for 10% effective rate with 12 periods', () => {
      expect(nominal(0.10, 12)).toBeCloseTo(0.0957, 4);
    });

    test('calculates nominal rate correctly for 5% effective rate with 4 periods', () => {
      expect(nominal(0.05, 4)).toBeCloseTo(0.0491, 4);
    });

    test('calculates nominal rate correctly for 1% effective rate with 1 period', () => {
      expect(nominal(0.01, 1)).toBeCloseTo(0.01, 5);
    });

    // Edge cases
    test('handles very small effective rates', () => {
      expect(nominal(0.0001, 12)).toBeCloseTo(0.0001, 5);
    });

    test('handles large effective rates', () => {
      expect(nominal(1.5, 12)).toBeCloseTo(0.95218, 5);
    });

    test('handles large number of periods', () => {
      expect(nominal(0.05, 365)).toBeCloseTo(0.04879, 5);
    });

    // Error cases
    test('throws error for negative effective rate', () => {
      expect(() => nominal(-0.1, 12)).toThrow('Effective rate must be greater than 0');
    });

    test('throws error for zero effective rate', () => {
      expect(() => nominal(0, 12)).toThrow('Effective rate must be greater than 0');
    });

    test('throws error for non-integer periods', () => {
      expect(() => nominal(0.1, 12.5)).toThrow('Periods per year must be a positive integer');
    });

    test('throws error for negative periods', () => {
      expect(() => nominal(0.1, -12)).toThrow('Periods per year must be a positive integer');
    });

    test('throws error for zero periods', () => {
      expect(() => nominal(0.1, 0)).toThrow('Periods per year must be a positive integer');
    });

    // Type checking
    test('throws error for non-numeric effective rate', () => {
      expect(() => nominal('0.1' as any, 12)).toThrow('Both arguments must be numbers');
    });

    test('throws error for non-numeric periods', () => {
      expect(() => nominal(0.1, '12' as any)).toThrow('Both arguments must be numbers');
    });

    test('throws error for undefined arguments', () => {
      expect(() => nominal(undefined as any, 12)).toThrow('Both arguments must be numbers');
      expect(() => nominal(0.1, undefined as any)).toThrow('Both arguments must be numbers');
    });

    // Precision tests
    test('maintains precision for small differences', () => {
      const result = nominal(0.12345, 12);
      expect(result).toBeCloseTo(0.11697, 5);
    });
  });

  describe('apyToAprMonthly', () => {
    test('returns 0 when input is 0', () => {
      expect(apyToAprMonthly(0)).toBe(0);
    });
  
    test('returns 0 when input is undefined or null', () => {
      expect(apyToAprMonthly(undefined as any)).toBe(0);
      expect(apyToAprMonthly(null as any)).toBe(0);
    });
  
    test('converts positive APY to monthly APR correctly', () => {
      const result = apyToAprMonthly(0.15); // 15% APY
      expect(result * 100).toBeCloseTo(1.17, 2); // Should be close to 1% monthly
    });
  
    test('converts negative APY to monthly APR correctly', () => {
      const result = apyToAprMonthly(-0.15); // -15% APY
      expect(result * 100).toBeCloseTo(-1.17, 2); // Should be close to -1% monthly
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
});
