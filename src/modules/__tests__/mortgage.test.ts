import mortgage from '../mortgage';
import {range} from '../utils';

describe('mortgage', () => {
  test('mortgage schedule', () => {
    const mgage = mortgage({
      balance: 100000,
      interest: 0.05,
      periods: 12
    });

    // https://www.bankrate.com/mortgages/amortization-calculator/
    const schedule = [
      [8144.08, 416.67],
      [8178.02, 382.73],
      [8212.09, 348.66],
      [8246.31, 314.44],
      [8280.67, 280.08],
      [8315.17, 245.58],
      [8349.82, 210.93],
      [8384.61, 176.14],
      [8419.54, 141.21],
      [8454.62, 106.12],
      [8489.85,  70.90],
      [8525.23,  35.52]
    ];

    range(12).map(month => {
      const [principal, interest] = mgage.pay();
      expect(principal).toBe(schedule[month][0]);
      expect(interest).toBe(schedule[month][1]);
    });

    expect(mgage.balance).toBe(0);
  });

  test('renew mortgage', () => {
    const mgage = mortgage({
      balance: 100000,
      interest: 0.05,
      periods: 24
    });

    expect(mgage.payment).toBe(4387.14);

    const payments = range(12).map(mgage.pay);
    const [principal, interest] = payments.pop();

    // https://www.bankrate.com/mortgages/amortization-calculator/
    expect(principal).toBe(4156.29);
    expect(interest).toBe(230.85);
    expect(mgage.balance).toBe(51247.14);

    mgage.renew(0.10);

    expect(mgage.payment).toBe(4505.44);

    range(12).map(mgage.pay);

    expect(mgage.balance).toBe(0);
  });
});
