import {currencyMask, percentMask, numberMask} from '../number';

describe('number', () => {
  describe('currencyMask', () => {
    test('', () => {
      expect(currencyMask('')).toEqual([
        '$', /\d/
      ]);
    });
  
    test('$3,000.59', () => {
      expect(currencyMask('$3,000.59')).toEqual([
        '$', /\d/, ',', /\d/, /\d/, /\d/, '[]', '.', '[]', /\d/, /\d/
      ]);
    });
  
    test('$3␣-␣$5', () => {
      expect(currencyMask('$3 - $5')).toEqual([
        '$', /\d/, ' ', '-', ' ', '$', /\d/
      ]);
    });
  
    test('$3␣-', () => {
      expect(currencyMask('$3 -')).toEqual([
        '$', /\d/, ' ', '-', ' ', '$', /\d/
      ]);
    });
  
    test('$3␣', () => {
      expect(currencyMask('$3 ')).toEqual([
        '$', /\d/, ' '
      ]);
    });

    test('empty string returns basic mask', () => {
      expect(currencyMask('')).toEqual([
        '$', /\d/
      ]);
    });

    test('handles basic currency value', () => {
      expect(currencyMask('$3,000.59')).toEqual([
        '$', /\d/, ',', /\d/, /\d/, /\d/, '[]', '.', '[]', /\d/, /\d/
      ]);
    });

    test('handles range with currency values', () => {
      expect(currencyMask('$3 - $5')).toEqual([
        '$', /\d/, ' ', '-', ' ', '$', /\d/
      ]);
    });

    test('handles partial range input', () => {
      expect(currencyMask('$3 -')).toEqual([
        '$', /\d/, ' ', '-', ' ', '$', /\d/
      ]);
    });

    test('handles trailing space', () => {
      expect(currencyMask('$3 ')).toEqual([
        '$', /\d/, ' '
      ]);
    });

    test('handles integer limit', () => {
      expect(currencyMask('$12345678')).toEqual([
        '$', /\d/, ',', /\d/, /\d/, /\d/, ',', /\d/, /\d/, /\d/
      ]);
    });

    test('handles decimal without leading digit', () => {
      expect(currencyMask('$.')).toEqual([
        '$', "[]", '.', "[]"
      ]);
    });

    test('handles value at decimal limit', () => {
      expect(currencyMask('$1.99')).toEqual([
        '$', /\d/, '[]', '.', '[]', /\d/, /\d/
      ]);
    });
  });

  describe('percentMask', () => {
    test('', () => {
      expect(percentMask('')).toEqual([
        /\d/, '%'
      ]);
    });
  
    test('3,000.59%', () => {
      expect(percentMask('3,000.59%')).toEqual([
        /\d/, ',', /\d/, /\d/, /\d/, '[]', '.', '[]', /\d/, /\d/, '%'
      ]);
    });
  
    test('3%␣-␣5%', () => {
      expect(percentMask('3% - 5%')).toEqual([
        /\d/, '%', ' ', '-', ' ', /\d/, '%'
      ]);
    });
  
    test('3%␣-', () => {
      expect(percentMask('3% -')).toEqual([
        /\d/, '%', ' ', '-', ' ', /\d/, '%'
      ]);
    });
  
    test('3%␣', () => {
      expect(percentMask('3% ')).toEqual([
        /\d/, '%', ' '
      ]);
    });

    test('empty string returns basic mask', () => {
      expect(percentMask('')).toEqual([
        /\d/, '%'
      ]);
    });

    test('handles basic percentage value', () => {
      expect(percentMask('3,000.59%')).toEqual([
        /\d/, ',', /\d/, /\d/, /\d/, '[]', '.', '[]', /\d/, /\d/, '%'
      ]);
    });

    test('handles range with percentage values', () => {
      expect(percentMask('3% - 5%')).toEqual([
        /\d/, '%', ' ', '-', ' ', /\d/, '%'
      ]);
    });

    test('handles partial range input', () => {
      expect(percentMask('3% -')).toEqual([
        /\d/, '%', ' ', '-', ' ', /\d/, '%'
      ]);
    });

    test('handles trailing space', () => {
      expect(percentMask('3% ')).toEqual([
        /\d/, '%', ' '
      ]);
    });

    test('handles integer limit', () => {
      expect(percentMask('12345678%')).toEqual([
        /\d/, ',', /\d/, /\d/, /\d/, ',', /\d/, /\d/, /\d/, '%'
      ]);
    });

    test('handles decimal without leading digit', () => {
      expect(percentMask('.')).toEqual([
        '0', '.', /\d/, '%'
      ]);
    });
  });

  describe('numberMask', () => {
    test('empty string returns basic mask', () => {
      expect(numberMask('')).toEqual([
        /\d/
      ]);
    });

    test('handles basic number with decimals', () => {
      expect(numberMask('1,234.56')).toEqual([
        /\d/, ',', /\d/, /\d/, /\d/, '[]', '.', '[]', /\d/, /\d/
      ]);
    });

    test('handles range with numbers', () => {
      expect(numberMask('100 - 200')).toEqual([
        /\d/, /\d/, /\d/, ' ', '-', ' ', /\d/, /\d/, /\d/
      ]);
    });

    test('handles thousands separators', () => {
      expect(numberMask('1,000,000')).toEqual([
        /\d/, ',', /\d/, /\d/, /\d/, ',', /\d/, /\d/, /\d/
      ]);
    });

    test('handles decimal at limit', () => {
      expect(numberMask('1.99')).toEqual([
        /\d/, '[]', '.', '[]', /\d/, /\d/
      ]);
    });
  });
});
