import {currencyMask, percentMask} from '../number';

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
  });    
});
