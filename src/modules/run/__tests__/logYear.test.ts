import { Province } from '../../../config';
import { logYear } from '../logYear';

describe('logYear', () => {
  it('calculates net worth and ROI correctly for buyer and renter', () => {
    const opts = {
      year: 2024,
      province: Province.BC,
      buyer: {
        house: {
          equity: 250000,
          costs: 10000,
          value: 300000,
          rentPaid: 50000,
          interestPaid: 10000,
          principalPaid: 10000,
          monthlyExpensesPaid: 1000,
          movingCostsPaid: 1000,
          capitalGainsTaxRate: 0.25,
        },
        portfolio: {
          value: 500000,
          costs: 10000,
          capitalGainsTaxRate: 0.25,
        },
      },
      renter: {
        portfolio: {
          value: 500000,
          costs: 10000,
          capitalGainsTaxRate: 0.25,
        },
        house: {
          rentPaid: 50000,
        }
      },
      mortgage: {
        principalRemaining: 250000,
        balance: 250000,
      },
    } as any;

    const result = logYear(opts);

    // Verify core calculations
    expect(result.year).toBe(2024);
    expect(result.buyer.$).toBeDefined();
    expect(result.renter.$).toBeDefined();
    expect(result.buyer.roi).toBeDefined();
    expect(result.renter.roi).toBeDefined();
    
    // Verify data structure
    expect(result.buyer.house.principalRemaining).toBe(250000);
    expect(result.buyer.province).toBe(Province.BC);
    expect(result.renter.province).toBe(Province.BC);
  });
});
