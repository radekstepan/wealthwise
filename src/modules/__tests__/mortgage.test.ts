import mortgage from '../mortgage';
import {range} from '../utils';

describe('mortgage', () => {
  let defaultMortgage: ReturnType<typeof mortgage>;

  beforeEach(() => {
    defaultMortgage = mortgage({
      balance: 100000,
      rate: 0.05,
      periods: 12
    });
  });

  describe('initialization', () => {
    test('correctly initializes mortgage with given parameters', () => {
      expect(defaultMortgage.balance).toBe(100000);
      expect(defaultMortgage.payment).toBeCloseTo(8560.75, 2);
      expect(defaultMortgage.equity).toBe(0);
      expect(defaultMortgage.remainingAmortization).toBe(1);
    });
  });

  describe('payment calculations', () => {
    test('mortgage schedule', () => {
      const mgage = mortgage({
        balance: 100000,
        rate: 0.05,
        periods: 12
      });
  
      expect(mgage.payment).toBeCloseTo(8560.75);
  
      const schedule = [
        [8144.08, 416.67],
        [8178.02, 382.73],
        [8212.09, 348.66],
        [8246.31, 314.44],
        [8280.67, 280.08],
        [8315.17, 245.58],
        [8349.82, 210.93],
        [8384.61, 176.14],
        [8419.54, 141.21],
        [8454.62, 106.12],
        [8489.85,  70.90],
        [8525.23,  35.52]
      ];
  
      range(12).map(month => {
        const [principal, interest] = mgage.pay();
        expect(principal).toBeCloseTo(schedule[month][0]);
        expect(interest).toBeCloseTo(schedule[month][1]);
      });
  
      expect(mgage.balance).toBe(0);
    });

    test('calculates correct payment schedule', () => {
      const [principal, interest] = defaultMortgage.pay();
      expect(principal).toBeCloseTo(8144.08, 2);
      expect(interest).toBeCloseTo(416.67, 2);
    });

    test('handles final payment correctly', () => {
      // Make 11 payments
      for (let i = 0; i < 11; i++) {
        defaultMortgage.pay();
      }
      
      // Check final payment
      const [principal, interest] = defaultMortgage.pay();
      expect(defaultMortgage.balance).toBe(0);
      expect(defaultMortgage.payment).toBe(0);
    });

    test('returns [0, 0] when balance is already 0', () => {
      // Pay off the mortgage
      while (defaultMortgage.balance > 0) {
        defaultMortgage.pay();
      }
      
      const [principal, interest] = defaultMortgage.pay();
      expect(principal).toBe(0);
      expect(interest).toBe(0);
    });
  });

  describe('paydown functionality', () => {
    test('correctly reduces balance with paydown', () => {
      defaultMortgage.paydown(10000);
      expect(defaultMortgage.balance).toBe(90000);
    });

    test('throws error when paying down more than balance', () => {
      expect(() => {
        defaultMortgage.paydown(200000);
      }).toThrow("Cannot payoff more than the principal amount");
    });

    test('sets payment to 0 when fully paid down', () => {
      defaultMortgage.paydown(100000);
      expect(defaultMortgage.balance).toBe(0);
      expect(defaultMortgage.payment).toBe(0);
    });
  });

  describe('mortgage renewal', () => {
    test('correctly renews mortgage with new rate', () => {
      // Make some payments
      for (let i = 0; i < 6; i++) {
        defaultMortgage.pay();
      }
      
      const balanceBeforeRenewal = defaultMortgage.balance;
      defaultMortgage.renew(0.06);

      expect(defaultMortgage.balance).toBe(balanceBeforeRenewal);
      expect(defaultMortgage.remainingAmortization).toBeCloseTo(0.5, 2); // 6 months remaining
    });

    test('handles additional amount during renewal', () => {
      const balanceBeforeRenewal = defaultMortgage.balance;
      const additionalAmount = 10000;
      
      defaultMortgage.renew(0.06, additionalAmount);
      
      expect(defaultMortgage.balance).toBe(balanceBeforeRenewal + additionalAmount);
    });
  });

  describe('edge cases', () => {
    test('normalizes very small balances to zero', () => {
      const smallMortgage = mortgage({
        balance: 0.001,
        rate: 0.05,
        periods: 12
      });
      
      expect(smallMortgage.balance).toBe(0);
    });

    test('throws error for negative balance', () => {
      const badMortgage = mortgage({
        balance: -100000,
        rate: 0.05,
        periods: 12
      });

      expect(() => {
        badMortgage.balance;
      }).toThrow(/Negative mortgage balance/);
    });
  });
});
