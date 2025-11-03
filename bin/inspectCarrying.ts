import { walkAndAssignTypes } from '../src/modules/inputs/inputs';
import parse from '../src/modules/inputs/parse';
import { run } from '../src/modules/run';
import { collectCarryingCostSeries } from '../src/modules/carryingCostAggregator';
import { smoothCarryingCostSeries } from '../src/modules/carryingCostHelpers';
import { Province } from '../src/interfaces';

const scenario = {
  province: Province.BC,
  mortgage: {
    amortization: 25,
    term: 5,
    isFixedRate: true
  },
  house: {
    price: '$719,000',
    downpayment: '20%',
    maintenance: '$586',
    propertyTax: '$3,733',
    insurance: '$100',
    closingCosts: '$3,000'
  },
  rent: {
    current: '$1,000',
    market: '$1,000',
    rentalIncome: '$0'
  },
  rates: {
    interest: {
      initial: '4.3%',
      future: '4.3%'
    },
    rent: {
      controlled: '0%',
      market: '0%',
      rentalIncome: '0%'
    },
    house: {
      expenses: '0%',
      appreciation: '2%'
    },
    bonds: {
      return: '4.5%',
      capitalGainsTax: '25%'
    }
  },
  scenarios: {
    simulate: {
      years: 5,
      samples: 1
    },
    crash: {
      chance: '0%',
      drop: '0%'
    },
    move: {
      tenureYears: 5,
      annualMoveUpCost: '0%'
    },
    mortgage: {
      anniversaryPaydown: '0%'
    }
  }
} as const;

const typed = walkAndAssignTypes(scenario);
const parsed = parse(typed);
const data = run(parsed, false);
const series = collectCarryingCostSeries([data]);

console.log('First 3 months carrying costs (median series)');
for (const entry of series.slice(0, 3)) {
  console.log({
    month: entry.absoluteMonth,
    gross: entry.gross,
    net: entry.net,
    rent: entry.rent,
    equityDelta: entry.equityDelta,
    principal: entry.principal,
    appreciation: entry.appreciation,
    opportunityCost: entry.opportunityCost
  });
}

const smoothed = smoothCarryingCostSeries(series, 12);
console.log('\nSmoothed series (window=12) first entry:', {
  month: smoothed[0]?.absoluteMonth,
  gross: smoothed[0]?.gross,
  net: smoothed[0]?.net,
  rent: smoothed[0]?.rent
});

console.log('Breakeven month (net vs rent):', series.find(point => point.net <= point.rent)?.absoluteMonth ?? 'not found');
console.log('Breakeven month (net + opportunity vs rent):', series.find(point => point.net + point.opportunityCost <= point.rent)?.absoluteMonth ?? 'not found');
