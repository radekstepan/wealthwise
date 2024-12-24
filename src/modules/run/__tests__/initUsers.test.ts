import { initUsers } from '../initUsers';
import { Province } from '../../../config';

describe('initUsers', () => {
  it('correctly initializes buyer and renter with given parameters', () => {
    const params = {
      downpaymentAmount: 100000,
      closingAndTax: 15000,
      cmhc: 5000,
      province: Province.BC,
      capitalGainsTaxRate: 0.25,
      currentHousePrice: 500000,
      mortgageBalance: 400000
    };

    const { buyer, renter } = initUsers(params);

    // Initial costs should be sum of downpayment, closing costs, and CMHC
    const expectedInitialCosts = 120000; // 100000 + 15000 + 5000

    expect(buyer).toEqual({
      $: 0,
      roi: 0,
      province: Province.BC,
      portfolio: {
        $: 0,
        costs: 0,
        value: 0,
        capitalGainsTaxRate: 0.25
      },
      house: {
        $: 0,
        costs: expectedInitialCosts,
        value: 500000,
        equity: 100000,
        capitalGainsTaxRate: 0,
        rentPaid: 0,
        interestPaid: 0,
        principalPaid: 100000,
        principalRemaining: 400000,
        monthlyExpensesPaid: 0,
        movingCostsPaid: 20000, // 15000 + 5000
      }
    });

    expect(renter).toEqual({
      $: 0,
      roi: 0,
      province: Province.BC,
      portfolio: {
        $: 0,
        costs: expectedInitialCosts,
        value: expectedInitialCosts,
        capitalGainsTaxRate: 0.25
      },
      house: {
        $: 0,
        rentPaid: 0,
      }
    });
  });
});
