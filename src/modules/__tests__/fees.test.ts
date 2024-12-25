import { Province } from '../../interfaces';
import { landTransferTax, cmhc, saleFees } from '../fees';

describe('fees', () => {
  describe('cmhc', () => {
    test('5% on $150k', () => {
      expect(cmhc(0.05, 150000)).toBe(5700);
    });

    test('10% on $300k', () => {
      expect(cmhc(0.1, 300000)).toBe(8370);
    });

    test('15% on $500k', () => {
      expect(cmhc(0.15, 500000)).toBe(11900);
    });

    test('20% on $650k', () => {
      expect(cmhc(0.2, 650000)).toBe(0);
    });
  });

  describe('saleFees', () => {
    // https://wowa.ca/calculators/cost-selling-house
    test('$500k', () => {
      expect(saleFees(Province.AB, 500000)).toBe(19650);
    });
  });

  describe('landTransferTax', () => {
    describe('Alberta', () => {
      test('calculates tax for $300,000 house', () => {
        expect(landTransferTax(Province.AB, 300000, false)).toBe(300);
      });

      test('rounds up to nearest $5', () => {
        expect(landTransferTax(Province.AB, 302500, false)).toBe(305);
      });
    });

    describe('British Columbia', () => {
      test('calculates tax for first-time buyer under $500,000', () => {
        expect(landTransferTax(Province.BC, 450000, true)).toBe(0);
      });

      test('calculates tax for non-first-time buyer under $200,000', () => {
        expect(landTransferTax(Province.BC, 180000, false)).toBe(1800);
      });

      test('calculates tax for property over $2,000,000', () => {
        expect(landTransferTax(Province.BC, 2500000, false)).toBe(53000);
      });

      test('calculates tax for property over $3,000,000', () => {
        expect(landTransferTax(Province.BC, 3500000, false)).toBe(93000);
      });
    });

    describe('Ontario', () => {
      test('calculates tax for property under $55,000', () => {
        expect(landTransferTax(Province.ON, 50000, false)).toBe(250);
      });
  
      test('calculates tax for property between $55,000 and $250,000', () => {
        expect(landTransferTax(Province.ON, 200000, false)).toBe(1725);
      });
  
      test('calculates tax for property between $250,000 and $400,000', () => {
        expect(landTransferTax(Province.ON, 300000, false)).toBe(2975);
      });
  
      test('calculates tax for property between $400,000 and $2,000,000', () => {
        expect(landTransferTax(Province.ON, 500000, false)).toBe(6475);
      });
  
      test('calculates tax for property over $2,000,000', () => {
        expect(landTransferTax(Province.ON, 2500000, false)).toBe(48975);
      });
    });

    describe('Ontario (Toronto)', () => {
      test('calculates tax for property under $55,000', () => {
        expect(landTransferTax(Province.Toronto, 50000, false)).toBe(500);
      });
    
      test('calculates tax for property between $55,000 and $250,000', () => {
        expect(landTransferTax(Province.Toronto, 200000, false)).toBe(3450);
      });
    
      test('calculates tax for property between $250,000 and $400,000', () => {
        expect(landTransferTax(Province.Toronto, 300000, false)).toBe(5950);
      });
    
      test('calculates tax for property between $400,000 and $2,000,000', () => {
        expect(landTransferTax(Province.Toronto, 500000, false)).toBe(12950);
      });
    
      test('calculates tax for property between $2M and $3M', () => {
        expect(landTransferTax(Province.Toronto, 2500000, false)).toBe(97950); 
      });
    
      test('calculates tax for property between $3M and $4M', () => {
        expect(landTransferTax(Province.Toronto, 3500000, false)).toBe(152950);
      });
    
      test('calculates tax for property between $4M and $5M', () => {
        expect(landTransferTax(Province.Toronto, 4500000, false)).toBe(217950);
      });
    
      test('calculates tax for property between $5M and $10M', () => {
        expect(landTransferTax(Province.Toronto, 7500000, false)).toBe(452950);
      });
    
      test('calculates tax for property between $10M and $20M', () => {
        expect(landTransferTax(Province.Toronto, 15000000, false)).toBe(1102950);
      });
    
      test('calculates tax for property over $20M', () => {
        expect(landTransferTax(Province.Toronto, 25000000, false)).toBe(2052950);
      });
    });
  });

  describe('cmhc', () => {
    test('5% down payment on $150k', () => {
      expect(cmhc(0.05, 150000)).toBe(5700);
    });

    test('10% down payment on $300k', () => {
      expect(cmhc(0.1, 300000)).toBe(8370);
    });

    test('15% down payment on $500k', () => {
      expect(cmhc(0.15, 500000)).toBe(11900);
    });

    test('20% down payment on $650k', () => {
      expect(cmhc(0.2, 650000)).toBe(0);
    });

    test('returns 0 for property over $1,000,000', () => {
      expect(cmhc(0.15, 1100000)).toBe(0);
    });

    test('returns 0 for down payment less than 5%', () => {
      expect(cmhc(0.04, 200000)).toBe(0);
    });
  });

  describe('saleFees', () => {
    describe('Alberta', () => {
      test('calculates fees for $500k', () => {
        expect(saleFees(Province.AB, 500000)).toBe(19650);
      });
    });

    describe('British Columbia', () => {
      test('calculates fees for $300k in British Columbia', () => {
        expect(saleFees(Province.BC, 300000)).toBeCloseTo(14190);
      });
  
      test('calculates fees for $100k in Alberta', () => {
        expect(saleFees(Province.AB, 100000)).toBeCloseTo(7050);
      });

      test('calculates partial exemption for first-time buyer between $500k-$525k', () => {
        expect(landTransferTax(Province.BC, 510000, true)).toBe(3400);
      });
    
      test('applies $8000 exemption for first-time buyer between $525k-$835k', () => {
        expect(landTransferTax(Province.BC, 700000, true)).toBe(4000);
      });
    
      test('calculates partial exemption for first-time buyer between $835k-$860k', () => {
        expect(landTransferTax(Province.BC, 845000, true)).toBe(10100);
      });
    
      test('no exemption for first-time buyer over $860k', () => {
        expect(landTransferTax(Province.BC, 875000, true)).toBe(15500);
      });
    });
  });
});
