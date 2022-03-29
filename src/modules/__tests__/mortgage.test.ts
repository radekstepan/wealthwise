import mortgage from '../mortgage';

const range = d => Array(d).fill(true).map((_, i) => i + 1);

describe('mortgage', () => {
  // TODO https://itools-ioutils.fcac-acfc.gc.ca/MC-CH/MCReport-CHSommaire-eng.aspx
  test('first payment period', () => {
    const mgage = mortgage({
      interest: 0.05,
      principal: 100000,
      periods: 25 * 12
    });

    mgage.pay({period: 1});

    expect(mgage.payment().toFixed(2)).toBe('582.16');
    expect(mgage.balance().toFixed(2)).toBe('174067.15');
    expect(mgage.principal().toFixed(2)).toBe('99417.84');
  });

  test('pay off mortgage', () => {
    const mgage = mortgage({
      interest: 0.05,
      principal: 100,
      periods: 12
    });

    for (const period of range(12)) {
      mgage.pay({period});
    }

    expect(mgage.balance()).toBe(0);
    expect(mgage.principal()).toBe(0);
  });
});
