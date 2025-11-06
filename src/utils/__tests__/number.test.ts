import { unformatValue } from '../number';
import { INPUTS } from '../../const';

describe('unformatValue utility', () => {
  test('unformats currency values correctly', () => {
    expect(unformatValue('$100,000.00', INPUTS.CURRENCY)).toBe('100000');
    expect(unformatValue('$1,234,567.89', INPUTS.CURRENCY)).toBe('1234567.89');
    expect(unformatValue('$0', INPUTS.CURRENCY)).toBe('0');
    expect(unformatValue('$42.5', INPUTS.CURRENCY)).toBe('42.5');
  });

  test('unformats percent values correctly', () => {
    expect(unformatValue('4.5%', INPUTS.PERCENT)).toBe('4.5');
    expect(unformatValue('100%', INPUTS.PERCENT)).toBe('100');
    expect(unformatValue('0.25%', INPUTS.PERCENT)).toBe('0.25');
    expect(unformatValue('12.75%', INPUTS.PERCENT)).toBe('12.75');
  });

  test('unformats number values correctly', () => {
    expect(unformatValue('1,000', INPUTS.NUMBER)).toBe('1000');
    expect(unformatValue('123,456.789', INPUTS.NUMBER)).toBe('123456.789');
    expect(unformatValue('42', INPUTS.NUMBER)).toBe('42');
    expect(unformatValue('1,234,567', INPUTS.NUMBER)).toBe('1234567');
  });

  test('returns boolean values as-is', () => {
    expect(unformatValue('Yes', INPUTS.BOOLEAN)).toBe('Yes');
    expect(unformatValue('No', INPUTS.BOOLEAN)).toBe('No');
  });

  test('returns province values as-is', () => {
    expect(unformatValue('BC', INPUTS.PROVINCE)).toBe('BC');
    expect(unformatValue('Ontario', INPUTS.PROVINCE)).toBe('Ontario');
    expect(unformatValue('British Columbia', INPUTS.PROVINCE)).toBe('British Columbia');
  });

  test('handles empty and edge cases', () => {
    expect(unformatValue('', INPUTS.CURRENCY)).toBe('');
    expect(unformatValue(null as any, INPUTS.CURRENCY)).toBe('');
    expect(unformatValue(undefined as any, INPUTS.CURRENCY)).toBe('');
  });

  test('handles unknown types gracefully', () => {
    expect(unformatValue('$100', 'unknown' as any)).toBe('100');
    expect(unformatValue('invalid', 'unknown' as any)).toBe('invalid');
    expect(unformatValue('50%', 'unknown' as any)).toBe('0.5'); // numbro.unformat treats % as division by 100
  });

  test('handles complex currency formats', () => {
    expect(unformatValue('$1,000,000.00', INPUTS.CURRENCY)).toBe('1000000');
    expect(unformatValue('$999,999.99', INPUTS.CURRENCY)).toBe('999999.99');
    expect(unformatValue('$0.01', INPUTS.CURRENCY)).toBe('0.01');
  });

  test('handles decimal percentages', () => {
    expect(unformatValue('0.1%', INPUTS.PERCENT)).toBe('0.1');
    expect(unformatValue('99.99%', INPUTS.PERCENT)).toBe('99.99');
    expect(unformatValue('100.0%', INPUTS.PERCENT)).toBe('100');
  });

  test('handles range values correctly', () => {
    // Currency ranges
    expect(unformatValue('$100,000 - $200,000', INPUTS.CURRENCY)).toBe('100000 - 200000');
    expect(unformatValue('$1,000 - $2,500', INPUTS.CURRENCY)).toBe('1000 - 2500');
    expect(unformatValue('$0 - $1,000,000', INPUTS.CURRENCY)).toBe('0 - 1000000');

    // Percent ranges
    expect(unformatValue('1% - 3%', INPUTS.PERCENT)).toBe('1 - 3');
    expect(unformatValue('0.5% - 1.5%', INPUTS.PERCENT)).toBe('0.5 - 1.5');
    expect(unformatValue('0% - 100%', INPUTS.PERCENT)).toBe('0 - 100');

    // Number ranges
    expect(unformatValue('1,000 - 2,000', INPUTS.NUMBER)).toBe('1000 - 2000');
    expect(unformatValue('10 - 100', INPUTS.NUMBER)).toBe('10 - 100');
    expect(unformatValue('0.5 - 1.5', INPUTS.NUMBER)).toBe('0.5 - 1.5');
  });

  test('handles edge cases in ranges', () => {
    // Range with extra spaces (should not be treated as range)
    expect(unformatValue('1-2', INPUTS.NUMBER)).toBe('1-2'); // no spaces around dash - treated as single value
    expect(unformatValue('1 -2', INPUTS.NUMBER)).toBe('1 -2'); // only space before dash - treated as single value
    expect(unformatValue('1- 2', INPUTS.NUMBER)).toBe('1- 2'); // only space after dash - treated as single value

    // Empty range parts
    expect(unformatValue(' - ', INPUTS.NUMBER)).toBe(' - ');
    expect(unformatValue('100 - ', INPUTS.NUMBER)).toBe('100 - ');
    expect(unformatValue(' - 200', INPUTS.NUMBER)).toBe(' - 200');
  });
});