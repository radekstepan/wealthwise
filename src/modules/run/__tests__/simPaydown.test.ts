import { simPaydown } from '../simPaydown';
import Mortgage from '../../mortgage';
import { type Buyer, type Renter } from '../interfaces';

describe('simPaydown', () => {
  let mortgage: ReturnType<typeof Mortgage>;
  let buyer: Buyer;
  let renter: Renter;
  const initialBalance = 100000;
  
  beforeEach(() => {
    mortgage = Mortgage({
      balance: initialBalance,
      periods: 360, // 30 years
      rate: 0.05 // 5% annual rate
    });

    buyer = {
      house: {
        principalPaid: 0,
        costs: 0,
        equity: 0
      }
    } as Buyer;

    renter = {
      portfolio: {
        costs: 0,
        value: 0
      }
    } as Renter;
  });

  test('applies correct paydown when balance and rate are positive', () => {
    const anniversaryPaydownRate = 0.1; // 10%
    const expectedPaydown = 10000; // 10% of 100000

    const initialMortgageBalance = mortgage.balance;

    simPaydown({
      mortgage,
      anniversaryPaydownRate,
      originalBalance: initialBalance,
      buyer,
      renter
    });

    expect(mortgage.balance).toBe(initialMortgageBalance - expectedPaydown);
    expect(buyer.house.principalPaid).toBe(expectedPaydown);
    expect(buyer.house.costs).toBe(expectedPaydown);
    expect(buyer.house.equity).toBe(expectedPaydown);
    expect(renter.portfolio.costs).toBe(expectedPaydown);
    expect(renter.portfolio.value).toBe(expectedPaydown);
  });

  test('does not apply paydown when balance is 0', () => {
    // Pay off the mortgage completely
    mortgage.paydown(initialBalance);
    
    simPaydown({
      mortgage,
      anniversaryPaydownRate: 0.1,
      originalBalance: initialBalance,
      buyer,
      renter
    });

    expect(mortgage.balance).toBe(0);
    expect(buyer.house.principalPaid).toBe(0);
    expect(buyer.house.costs).toBe(0);
    expect(buyer.house.equity).toBe(0);
    expect(renter.portfolio.costs).toBe(0);
    expect(renter.portfolio.value).toBe(0);
  });

  test('does not apply paydown when rate is 0', () => {
    const initialMortgageBalance = mortgage.balance;

    simPaydown({
      mortgage,
      anniversaryPaydownRate: 0,
      originalBalance: initialBalance,
      buyer,
      renter
    });

    expect(mortgage.balance).toBe(initialMortgageBalance);
    expect(buyer.house.principalPaid).toBe(0);
    expect(buyer.house.costs).toBe(0);
    expect(buyer.house.equity).toBe(0);
    expect(renter.portfolio.costs).toBe(0);
    expect(renter.portfolio.value).toBe(0);
  });

  test('limits paydown to remaining balance', () => {
    // Pay off most of the mortgage first
    mortgage.paydown(95000);
    const remainingBalance = mortgage.balance;

    simPaydown({
      mortgage,
      anniversaryPaydownRate: 0.1, // 10% of original balance would be 10000
      originalBalance: initialBalance,
      buyer,
      renter
    });

    expect(mortgage.balance).toBe(0);
    expect(buyer.house.principalPaid).toBe(remainingBalance);
    expect(buyer.house.costs).toBe(remainingBalance);
    expect(buyer.house.equity).toBe(remainingBalance);
    expect(renter.portfolio.costs).toBe(remainingBalance);
    expect(renter.portfolio.value).toBe(remainingBalance);
  });

  test('throws error when calculated paydown is negative', () => {
    expect(() => {
      simPaydown({
        mortgage,
        anniversaryPaydownRate: 0.1,
        originalBalance: -100000,
        buyer,
        renter
      });
    }).toThrow('Paydown is negative?');
  });

  test('throws error when trying to paydown more than balance', () => {
    // First reduce the mortgage balance
    mortgage.paydown(95000);
    const remainingBalance = mortgage.balance;

    // Try to paydown more than remaining balance
    expect(() => {
      mortgage.paydown(remainingBalance + 1);
    }).toThrow('Cannot payoff more than the principal amount');
  });
});
