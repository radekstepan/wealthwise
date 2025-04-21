import typedInputs from './__fixtures__/fixedRateMortgage.inputs';

describe('simulate a fixed rate mortgage', () => {
  let postMessageSpy: jest.SpyInstance;

  beforeEach(() => {
    postMessageSpy = jest.spyOn(self, 'postMessage');
    jest.clearAllMocks();
  });

  afterEach(() => {
    postMessageSpy.mockRestore();
  });


  it('should run the simulation', () => {
    require('../modules/run.ts');

    const messageEvent = new MessageEvent('message', {
      data: { inputs: typedInputs, samples: 1 }
    });

    self.dispatchEvent(messageEvent);

    const messages = postMessageSpy.mock.calls;

    expect(messages).toHaveLength(2);
    expect(messages[0][0]).toEqual({
      action: "meta",
      meta: {
        closingAndTax: 7200,
        cmhc: 0,
        downpayment: 142000,
        expenses: expect.any(Number),
        payment: expect.any(Number),
      }
    });

    expect(messages[0][0].meta.expenses).toBeCloseTo(997, 0);
    expect(messages[0][0].meta.payment).toBeCloseTo(3093, 0);

    expect(messages[1][0]).toEqual({
      action: 'res',
      res: expect.any(Array)
    });

    expect(messages[1][0].res).toHaveLength(1);
    expect(messages[1][0].res[0]).toHaveLength(50);
    expect(messages[1][0].res[0][49]).toEqual({
      year: 49,
      buyer: expect.any(Object),
      renter: expect.any(Object),
    });
    expect(messages[1][0].res[0][49].buyer.$).toBeCloseTo(4411887, 0);
    expect(messages[1][0].res[0][49].buyer.house.$).toBeCloseTo(1842707, 0);
    expect(messages[1][0].res[0][49].buyer.portfolio.$).toBeCloseTo(2569180, 0);
    expect(messages[1][0].res[0][49].renter.$).toBeCloseTo(4073508, 0);
    expect(messages[1][0].res[0][49].renter.house.$).toBe(0);
    expect(messages[1][0].res[0][49].renter.portfolio.$).toBeCloseTo(4073508, 0);

  });

  it('should run the simulation with rental income', () => {
    require('../modules/run.ts');

    const inputsWithIncome = JSON.parse(JSON.stringify(typedInputs)); // Deep clone
    // Need to provide the type tuple for rentalIncome and rentalIncomeIncrease
    inputsWithIncome.rent.rentalIncome = ['$500', inputsWithIncome.rent.rentalIncome[1]]; // Set income to $500/month
    inputsWithIncome.rent.rentalIncomeIncrease = ['3%', inputsWithIncome.rates.rent.rentalIncome[1]];

    const messageEvent = new MessageEvent('message', {
      data: { inputs: inputsWithIncome, samples: 1 } // Use samples: 1 for deterministic test
    });

    self.dispatchEvent(messageEvent);

    const messages = postMessageSpy.mock.calls;

    expect(messages).toHaveLength(2); // Meta + Res
    expect(messages[0][0].action).toBe("meta"); // Meta is unchanged
    expect(messages[1][0].action).toBe("res");

    expect(messages[1][0].res).toHaveLength(1);
    expect(messages[1][0].res[0]).toHaveLength(50); // Simulate years = 50
    const finalYearData = messages[1][0].res[0][49]; // Year 49 (index)

    // --- EXPECTED VALUES WITH RENTAL INCOME ---
    // Buyer net worth increases significantly due to rental income offsetting costs/boosting investment.
    // Renter net worth decreases because the buyer's lower net monthly cost means the renter invests less of the difference over time.

    expect(finalYearData.buyer.$).toBeCloseTo(4762447, 0);
    expect(finalYearData.renter.$).toBeCloseTo(3526357, 0);

    expect(finalYearData.buyer.house.$).toBeCloseTo(1842707, 0); // House value unaffected
    // Updated expected portfolio value based on new total buyer net worth
    expect(finalYearData.buyer.portfolio.$).toBeCloseTo(2919740, 0); // Buyer Portfolio increased significantly (4762447 - 1842707)
    expect(finalYearData.renter.portfolio.$).toBeCloseTo(3526357, 0); // Renter portfolio decreased
  });
});
