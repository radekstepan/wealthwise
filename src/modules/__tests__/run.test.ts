import { Province } from "../../config";
import { walkAndAssignTypes } from "../../modules/inputs/inputs";

export const inputs = {
  province: Province.BC,
  mortgage: {
    amortization: 25,
    term: 5,
    isFixedRate: true
  },
  house: {
    price: "$710,000",
    downpayment: "20%",
    maintenance: "$586",
    propertyTax: "$3,733",
    insurance: "$100",
    closingCosts: "$3,000"
  },
  rent: {
    current: "$2,050",
    market: "$2,500"
  },
  rates: {
    interest: {
      initial: "4.3%",
      future: "4%"
    },
    rent: {
      controlled: "2.5%",
      market: "3.5%"
    },
    house: {
      expenses: "3.25%",
      appreciation: "2%"
    },
    bonds: {
      return: "4.5%",
      capitalGainsTax: "25%"
    }
  },
  scenarios: {
    simulate: {
      years: 50
    },
    crash: {
      chance: "0%",
      drop: "0%"
    },
    move: {
      tenureYears: 5,
      annualMoveUpCost: "1%",
    },
    mortgage: {
      anniversaryPaydown: "0%"
    }
  }
};

const typedInputs = walkAndAssignTypes(inputs);

describe('run', () => {
  let postMessageSpy: jest.SpyInstance;

  beforeEach(() => {
    postMessageSpy = jest.spyOn(self, 'postMessage');
    jest.clearAllMocks();
  });

  afterEach(() => {
    postMessageSpy.mockRestore();
  });


  it('should run the simulation', () => {
    require('../run.ts');

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
    expect(messages[1][0].res[0][49].buyer.$).toBeCloseTo(5454663, 0);
    expect(messages[1][0].res[0][49].buyer.house.$).toBeCloseTo(2914708, 0);
    expect(messages[1][0].res[0][49].buyer.portfolio.$).toBeCloseTo(2539955, 0);
    expect(messages[1][0].res[0][49].renter.$).toBeCloseTo(6043905, 0);
    expect(messages[1][0].res[0][49].renter.house.$).toBe(0);
    expect(messages[1][0].res[0][49].renter.portfolio.$).toBeCloseTo(6043905, 0);
  });
});
