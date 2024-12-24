import { Random } from "random-js";
import { simYear } from "../simYear";
import { Province } from "../../../config";
import Mortgage from "../../mortgage";

describe('simYear', () => {
  let mockRandom;
  let mockInit;
  let mockOpts;

  beforeEach(() => {
    // Create mock Random instance
    mockRandom = new Random();

    // Setup mock initial values
    mockInit = {
      currentHousePrice: 500000,
      newHousePrice: 600000,
      currentInterestRate: 0.05,
      monthlyExpenses: 2000,
      rent: 2500,
      marketRent: 2600,
      originalBalance: 400000,
      province: Province.BC,
      mortgage: Mortgage({
        balance: 400000,
        rate: 0.05,
        periods: 25,
      }),
      buyer: {
        house: { costs: 1000 },
        portfolio: { costs: 2000 }
      },
      renter: {
        portfolio: { costs: 1500 },
        house: {
          rentPaid: 0,
        }
      },
      isFixedRate: true,
      term: 5,
      simulateYears: 25
    };

    // Setup mock options with jest.fn() for all function properties
    mockOpts = {
      rates: {
        house: {
          appreciation: jest.fn().mockReturnValue(0.03),
          expenses: jest.fn().mockReturnValue(0.02)
        },
        bonds: {
          return: jest.fn().mockReturnValue(0.04)
        },
        interest: {
          future: jest.fn().mockReturnValue(0.06)
        },
        rent: {
          controlled: jest.fn().mockReturnValue(0.015),
          market: jest.fn().mockReturnValue(0.02)
        }
      },
      scenarios: {
        move: {
          tenureYears: jest.fn().mockReturnValue(7),
          annualMoveUpCost: jest.fn().mockReturnValue(0.1)
        },
        mortgage: {
          anniversaryPaydown: jest.fn().mockReturnValue(0.1)
        },
        crash: {
          chance: jest.fn().mockReturnValue(0.05),
          drop: jest.fn().mockReturnValue(0.9)
        }
      },
      house: {
        closingCosts: 5000
      }
    };
  });

  test('should simulate a year and call all rate functions', () => {
    const result = simYear(1, mockInit, mockOpts, mockRandom);

    // Verify all rate functions were called
    expect(mockOpts.rates.house.appreciation).toHaveBeenCalled();
    expect(mockOpts.rates.house.expenses).toHaveBeenCalled();
    expect(mockOpts.rates.bonds.return).toHaveBeenCalled();
    expect(mockOpts.rates.rent.controlled).toHaveBeenCalled();
    expect(mockOpts.rates.rent.market).toHaveBeenCalled();
    expect(mockOpts.scenarios.move.tenureYears).toHaveBeenCalled();
    expect(mockOpts.scenarios.move.annualMoveUpCost).toHaveBeenCalled();
    expect(mockOpts.scenarios.mortgage.anniversaryPaydown).toHaveBeenCalled();

    // Verify result structure
    expect(result).toHaveProperty('yearData');
    expect(result).toHaveProperty('updatedValues');
  });

  test('should update house prices based on appreciation rate', () => {
    mockOpts.rates.house.appreciation.mockReturnValue(0.10); // 10% appreciation

    const result = simYear(1, mockInit, mockOpts, mockRandom);

    expect(result.updatedValues.currentHousePrice).toBeGreaterThan(mockInit.currentHousePrice);
    expect(result.updatedValues.newHousePrice).toBeGreaterThan(mockInit.newHousePrice);
  });

  test('should update monthly expenses and rent based on rates', () => {
    const expenseRate = 0.05;
    const controlledRentRate = 0.03;
    const marketRentRate = 0.04;

    mockOpts.rates.house.expenses.mockReturnValue(expenseRate);
    mockOpts.rates.rent.controlled.mockReturnValue(controlledRentRate);
    mockOpts.rates.rent.market.mockReturnValue(marketRentRate);

    const result = simYear(1, mockInit, mockOpts, mockRandom);

    const expectedMonthlyExpenses = mockInit.monthlyExpenses * (1 + expenseRate);
    const expectedRent = mockInit.rent * (1 + controlledRentRate);
    const expectedMarketRent = mockInit.marketRent * (1 + marketRentRate);

    expect(result.updatedValues.monthlyExpenses).toBeCloseTo(expectedMonthlyExpenses);
    expect(result.updatedValues.rent).toBeCloseTo(expectedRent);
    expect(result.updatedValues.marketRent).toBeCloseTo(expectedMarketRent);
  });

  test('should apply move-up cost to new house price', () => {
    const moveUpCost = 0.15;
    mockOpts.scenarios.move.annualMoveUpCost.mockReturnValue(moveUpCost);

    const result = simYear(1, mockInit, mockOpts, mockRandom);

    // The new house price should be increased by the move-up cost percentage
    expect(result.updatedValues.newHousePrice)
      .toBeGreaterThan(mockInit.newHousePrice);
  });
});
