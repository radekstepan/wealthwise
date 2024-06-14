import mortgage from '../mortgage';
import {r, range} from '../utils';

describe('mortgage', () => {
  test('mortgage schedule', () => {
    const mgage = mortgage({
      balance: 100000,
      rate: 0.05,
      periods: 12
    });

    expect(r(mgage.payment)).toBe(8560.75);

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
      expect(r(principal)).toBe(schedule[month][0]);
      expect(r(interest)).toBe(schedule[month][1]);
    });

    expect(mgage.balance).toBe(0);
  });

  test('renew mortgage', () => {
    const mgage = mortgage({
      balance: 100000,
      rate: 0.05,
      periods: 24
    });

    expect(r(mgage.payment)).toBe(4387.14);

    const payments = range(12).map(mgage.pay);
    const [principal, interest] = payments.pop()!;

    expect(r(principal)).toBe(4156.29);
    expect(r(interest)).toBe(230.85);
    expect(r(mgage.balance)).toBe(51247.14);

    mgage.renew(0.10);

    expect(r(mgage.payment)).toBe(4505.44);

    range(12).map(mgage.pay);

    expect(mgage.balance).toBe(0);
  });
});
