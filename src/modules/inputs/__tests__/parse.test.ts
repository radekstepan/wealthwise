import parse, {type ParsedInputs} from '../parse';
import {INPUTS} from '../../../const';
import {Province} from '../../../interfaces';
import {type TypedInputs} from '../inputs';
import { type Sample } from '../../samplers';

const mockInputs: TypedInputs = {
  province: [Province.BC, INPUTS.PROVINCE],
  mortgage: {
    amortization: ["25", INPUTS.NUMBER],
    term: ["5", INPUTS.NUMBER],
    isFixedRate: [true, INPUTS.BOOLEAN]
  },
  house: {
    price: ["$710,000", INPUTS.CURRENCY],
    downpayment: ["20%", INPUTS.PERCENT],
    maintenance: ["$586", INPUTS.CURRENCY],
    propertyTax: ["$3,733", INPUTS.CURRENCY],
    insurance: ["$100", INPUTS.CURRENCY],
    closingCosts: ["$3,000", INPUTS.CURRENCY]
  },
  rent: {
    current: ["$2,050", INPUTS.CURRENCY],
    market: ["$2,500", INPUTS.CURRENCY]
  },
  rates: {
    interest: {
      initial: ["4.3%", INPUTS.PERCENT],
      future: ["3% - 5%", INPUTS.PERCENT]
    },
    rent: {
      controlled: ["1% - 4%", INPUTS.PERCENT],
      market: ["2% - 5%", INPUTS.PERCENT]
    },
    house: {
      expenses: ["2% - 4.5%", INPUTS.PERCENT],
      appreciation: ["1% - 3%", INPUTS.PERCENT]
    },
    bonds: {
      return: ["3% - 6%", INPUTS.PERCENT],
      capitalGainsTax: ["25%", INPUTS.PERCENT]
    }
  },
  scenarios: {
    simulate: {
      years: ["50", INPUTS.NUMBER],
      samples: ["1,000", INPUTS.NUMBER]
    },
    crash: {
      chance: ["0%", INPUTS.PERCENT],
      drop: ["0%", INPUTS.PERCENT]
    },
    move: {
      tenureYears: ["5", INPUTS.NUMBER],
      annualMoveUpCost: ["1%", INPUTS.PERCENT]
    },
    mortgage: {
      anniversaryPaydown: ["0%", INPUTS.NUMBER],
    }
  }
};

describe('modules/inputs/parse', () => {
  let parsedOutput: ParsedInputs < typeof mockInputs > ;

  beforeAll(() => {
    parsedOutput = parse(mockInputs);
  });

  // Helper to check if a value is a sampler function returning the expected type
  const isSampler = < T > (sampler: any, expectedType: 'number' | 'boolean' | 'string'): sampler is Sample < T > => {
    if (typeof sampler !== 'function') return false;
    const value = sampler();
    if (expectedType === 'string') { // For enums like Province
      return typeof value === 'string';
    }
    return typeof value === expectedType;
  }

  it('should parse province correctly', () => {
    const sampler = parsedOutput.province;
    expect(isSampler < Province > (sampler, 'string')).toBe(true);
    expect(sampler()).toBe(Province.BC);
  });

  describe('mortgage', () => {
    it('should parse amortization', () => {
      const sampler = parsedOutput.mortgage.amortization;
      expect(isSampler < number > (sampler, 'number')).toBe(true);
      expect(sampler()).toBe(25);
    });
    it('should parse term', () => {
      const sampler = parsedOutput.mortgage.term;
      expect(isSampler < number > (sampler, 'number')).toBe(true);
      expect(sampler()).toBe(5);
    });
    it('should parse isFixedRate', () => {
      const sampler = parsedOutput.mortgage.isFixedRate;
      expect(isSampler < boolean > (sampler, 'boolean')).toBe(true);
      expect(sampler()).toBe(true);
    });
  });

  describe('house', () => {
    it('should parse price', () => {
      const sampler = parsedOutput.house.price;
      expect(isSampler < number > (sampler, 'number')).toBe(true);
      expect(sampler()).toBe(710000);
    });
    it('should parse downpayment', () => {
      const sampler = parsedOutput.house.downpayment;
      expect(isSampler < number > (sampler, 'number')).toBe(true);
      expect(sampler()).toBeCloseTo(0.20);
    });
    it('should parse maintenance', () => {
      const sampler = parsedOutput.house.maintenance;
      expect(isSampler < number > (sampler, 'number')).toBe(true);
      expect(sampler()).toBe(586);
    });
    it('should parse propertyTax', () => {
      const sampler = parsedOutput.house.propertyTax;
      expect(isSampler < number > (sampler, 'number')).toBe(true);
      expect(sampler()).toBe(3733);
    });
    it('should parse insurance', () => {
      const sampler = parsedOutput.house.insurance;
      expect(isSampler < number > (sampler, 'number')).toBe(true);
      expect(sampler()).toBe(100);
    });
    it('should parse closingCosts', () => {
      const sampler = parsedOutput.house.closingCosts;
      expect(isSampler < number > (sampler, 'number')).toBe(true);
      expect(sampler()).toBe(3000);
    });
  });

  describe('rent', () => {
    it('should parse current rent', () => {
      const sampler = parsedOutput.rent.current;
      expect(isSampler < number > (sampler, 'number')).toBe(true);
      expect(sampler()).toBe(2050);
    });
    it('should parse market rent', () => {
      const sampler = parsedOutput.rent.market;
      expect(isSampler < number > (sampler, 'number')).toBe(true);
      expect(sampler()).toBe(2500);
    });
  });

  describe('rates', () => {
    describe('interest', () => {
      it('should parse initial', () => {
        const sampler = parsedOutput.rates.interest.initial;
        expect(isSampler < number > (sampler, 'number')).toBe(true);
        expect(sampler()).toBeCloseTo(0.043);
      });
      it('should parse future range', () => {
        const sampler = parsedOutput.rates.interest.future;
        expect(isSampler < number > (sampler, 'number')).toBe(true);
        expect(typeof sampler()).toBe('number'); // Check return type
      });
    });
    describe('rent', () => {
      it('should parse controlled range', () => {
        const sampler = parsedOutput.rates.rent.controlled;
        expect(isSampler < number > (sampler, 'number')).toBe(true);
        expect(typeof sampler()).toBe('number');
      });
      it('should parse market range', () => {
        const sampler = parsedOutput.rates.rent.market;
        expect(isSampler < number > (sampler, 'number')).toBe(true);
        expect(typeof sampler()).toBe('number');
      });
    });
    describe('house', () => {
      it('should parse expenses range', () => {
        const sampler = parsedOutput.rates.house.expenses;
        expect(isSampler < number > (sampler, 'number')).toBe(true);
        expect(typeof sampler()).toBe('number');
      });
      it('should parse appreciation range', () => {
        const sampler = parsedOutput.rates.house.appreciation;
        expect(isSampler < number > (sampler, 'number')).toBe(true);
        expect(typeof sampler()).toBe('number');
      });
    });
    describe('bonds', () => {
      it('should parse return range', () => {
        const sampler = parsedOutput.rates.bonds.return;
        expect(isSampler < number > (sampler, 'number')).toBe(true);
        expect(typeof sampler()).toBe('number');
      });
      it('should parse capitalGainsTax', () => {
        const sampler = parsedOutput.rates.bonds.capitalGainsTax;
        expect(isSampler < number > (sampler, 'number')).toBe(true);
        expect(sampler()).toBeCloseTo(0.25);
      });
    });
  });

  describe('scenarios', () => {
    describe('simulate', () => {
      it('should parse years', () => {
        const sampler = parsedOutput.scenarios.simulate.years;
        expect(isSampler < number > (sampler, 'number')).toBe(true);
        expect(sampler()).toBe(50);
      });
      // it('should parse samples (with comma)', () => {
      //   const sampler = parsedOutput.scenarios.simulate.samples;
      //   expect(isSampler < number > (sampler, 'number')).toBe(true);
      //   expect(sampler()).toBe(1000); // Verify comma was handled
      // });
    });
    describe('crash', () => {
      it('should parse chance', () => {
        const sampler = parsedOutput.scenarios.crash.chance;
        expect(isSampler < number > (sampler, 'number')).toBe(true);
        expect(sampler()).toBeCloseTo(0);
      });
      it('should parse drop', () => {
        const sampler = parsedOutput.scenarios.crash.drop;
        expect(isSampler < number > (sampler, 'number')).toBe(true);
        expect(sampler()).toBeCloseTo(0);
      });
    });
    describe('move', () => {
      it('should parse tenureYears', () => {
        const sampler = parsedOutput.scenarios.move.tenureYears;
        expect(isSampler < number > (sampler, 'number')).toBe(true);
        expect(sampler()).toBe(5);
      });
      it('should parse annualMoveUpCost', () => {
        const sampler = parsedOutput.scenarios.move.annualMoveUpCost;
        expect(isSampler < number > (sampler, 'number')).toBe(true);
        expect(sampler()).toBeCloseTo(0.01);
      });
    });
    describe('mortgage', () => {
      it('should parse anniversaryPaydown (as number despite % value)', () => {
        const sampler = parsedOutput.scenarios.mortgage.anniversaryPaydown;
        expect(isSampler < number > (sampler, 'number')).toBe(true);
        expect(sampler()).toBeCloseTo(0); // numbro.unformat("0%") should yield 0
      });
    });
  });
});
