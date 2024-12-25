import typedInputs from './__fixtures__/propertyCrash.inputs';

jest.mock('random-js', () => {
  const { Random, MersenneTwister19937 } = jest.requireActual('random-js');
  const mt = MersenneTwister19937.seed(12345);
  const seededRandom = new Random(mt);
  return {
    Random: jest.fn(() => seededRandom),
    MersenneTwister19937: jest.fn()
  };
});

describe('simulate a property crash', () => {
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
    expect(messages[1][0].res[0][49].buyer.$).toBeCloseTo(3911399, 0);
    expect(messages[1][0].res[0][49].buyer.house.$).toBeCloseTo(1342220, 0);
    expect(messages[1][0].res[0][49].buyer.portfolio.$).toBeCloseTo(2569180, 0);
    expect(messages[1][0].res[0][49].renter.$).toBeCloseTo(3992608, 0);
    expect(messages[1][0].res[0][49].renter.house.$).toBe(0);
    expect(messages[1][0].res[0][49].renter.portfolio.$).toBeCloseTo(3992608, 0);
  });
});
