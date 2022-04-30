import {currencyMask} from '../number';

describe('currencyMask', () => {
  test('currency', () => {
    expect(currencyMask('$3,000.59')).toEqual([
      '$', /\d/, ',', /\d/, /\d/, /\d/, '[]', '.', '[]', /\d/, /\d/
    ]);
  });

  // TODO
  test('currency range', () => {
    expect(currencyMask('$3,000.59')).toEqual([
      '$', /\d/, ',', /\d/, /\d/, /\d/, '[]', '.', '[]', /\d/, /\d/
    ]);
  });
});
