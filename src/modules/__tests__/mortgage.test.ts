import mortgage from '../mortgage';
import {range} from '../utils';

describe('mortgage', () => {
  // TODO https://itools-ioutils.fcac-acfc.gc.ca/MC-CH/MCReport-CHSommaire-eng.aspx
  test('first payment period', () => {
    const mgage = mortgage({
      interest: 0.05,
      principal: 100000,
      periods: 25 * 12
    });

    mgage.pay();

    expect(mgage.payment()).toBe(582.16);
    expect(mgage.balance()).toBe(174067.14);
    expect(mgage.principal()).toBe(99417.84);
  });

  test('pay off mortgage', () => {
    const mgage = mortgage({
      interest: 0.05,
      principal: 100,
      periods: 12
    });

    range(12).map(mgage.pay)

    expect(mgage.balance()).toBe(0);
    expect(mgage.principal()).toBe(0);
  });

  test('renew mortgage', () => {
    const mgage = mortgage({
      interest: 0.05,
      principal: 100,
      periods: 24
    });

    range(12).map(mgage.pay)

    expect(mgage.payment()).toBe(4.37);
    expect(mgage.balance()).toBe(52.43);
    expect(mgage.principal()).toBe(51.03);

    mgage.renew({
      periods: 12,
      interest: 0.05
    });

    expect(mgage.payment()).toBe(4.35);
    expect(mgage.balance()).toBe(52.21);
    expect(mgage.principal()).toBe(51.03);

    range(12).map(mgage.pay)

    expect(mgage.balance()).toBe(0);
    expect(mgage.principal()).toBe(0);
  });
});
