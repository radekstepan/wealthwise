import { simMove } from '../simMove';
import Mortgage from '../../mortgage';
import { Province } from '../../../config';

describe('simMove', () => {
  let defaultParams: Parameters<typeof simMove>[0];
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup default test parameters
    defaultParams = {
      moveEvery: 5,
      renew: false,
      year: 1,
      simulateYears: 10,
      mortgage: Mortgage({
        balance: 400000,
        periods: 300,
        rate: 0.05
      }),
      newHousePrice: 600000,
      currentHousePrice: 500000,
      province: Province.BC,
      buyer: {
        house: { costs: 0, movingCostsPaid: 0 }
      } as any,
      renter: {
        portfolio: { costs: 0, value: 0 }
      } as any,
      rent: 2000,
      marketRent: 2500,
      closingCosts: () => 5000
    };
  });

  test('should not trigger move when not on move year', () => {
    const result = simMove({
      ...defaultParams,
      year: 2
    });

    expect(result).toEqual({
      additionalBalance: 0,
      nextRenew: false,
      nextRent: 2000,
      nextCurrentHousePrice: 500000
    });
  });

  test('should trigger move on correct year', () => {
    const result = simMove({
      ...defaultParams,
      year: 5
    });

    expect(result).toEqual({
      additionalBalance: 100000, // newHousePrice - currentHousePrice
      nextRenew: true,
      nextRent: 2500,
      nextCurrentHousePrice: 600000
    });
  });

  test('should not trigger move in final year', () => {
    const result = simMove({
      ...defaultParams,
      year: 10,
      simulateYears: 10
    });

    expect(result).toEqual({
      additionalBalance: 0,
      nextRenew: false,
      nextRent: 2000,
      nextCurrentHousePrice: 500000
    });
  });

  test('should calculate moving costs correctly', () => {
    simMove({
      ...defaultParams,
      year: 5
    });

    expect(defaultParams.buyer.house.costs).toBe(33910); // saleFees + closingCosts + landTransferTax
    expect(defaultParams.buyer.house.movingCostsPaid).toBe(33910);
    expect(defaultParams.renter.portfolio.costs).toBe(33910);
    expect(defaultParams.renter.portfolio.value).toBe(33910);
  });
});
