import clean from '../clean';
import { isProvince } from '../inputs';
import { Province } from '../../../interfaces';

jest.mock('numeraljs', () => ({
  __esModule: true,
  default: (val) => ({
    value: () => parseFloat(val)
  })
}));

describe('clean', () => {
  describe('Province handling', () => {
    it('should return the value if it is a valid province', () => {
      Object.values(Province).forEach(province => {
        expect(clean(province)).toBe(province);
      });
    });

    it('should handle non-province strings differently', () => {
      const nonProvince = 'NotAProvince';
      expect(clean(nonProvince)).toBe('0');
      expect(isProvince(nonProvince)).toBe(false);
    });
  });

  describe('Boolean handling', () => {
    it('should convert "Yes" to true', () => {
      expect(clean('Yes')).toBe(true);
    });

    it('should convert "No" to false', () => {
      expect(clean('No')).toBe(false);
    });

    it('should not convert other boolean-like strings', () => {
      expect(clean('yes')).toBe('0'); // case sensitive
      expect(clean('no')).toBe('0'); // case sensitive
      expect(clean('true')).toBe('0');
      expect(clean('false')).toBe('0');
    });
  });

  describe('Range handling', () => {
    it('should maintain valid ranges', () => {
      expect(clean('10 - 20')).toBe('10 - 20');
      expect(clean('1.5 - 2.5')).toBe('1.5 - 2.5');
      expect(clean('0 - 100')).toBe('0 - 100');
    });

    it('should flip ranges where first number is larger', () => {
      expect(clean('20 - 10')).toBe('10 - 20');
      expect(clean('100 - 0')).toBe('0 - 100');
      expect(clean('2.5 - 1.5')).toBe('1.5 - 2.5');
    });

    it('should handle single number in range format', () => {
      expect(clean('10 - ')).toBe('10');
      expect(clean(' - 10')).toBe('10');
      expect(clean('10 -')).toBe('10 -');
    });

    it('should return "0" when range contains no numbers', () => {
      expect(clean(' - ')).toBe('0');
      expect(clean('-')).toBe('0');
      expect(clean('- -')).toBe('0');
    });
  });

  describe('Numeric handling', () => {
    it('should return "0" for non-numeric strings', () => {
      expect(clean('abc')).toBe('0');
      expect(clean('!@#')).toBe('0');
      expect(clean('text')).toBe('0');
    });

    it('should return the value for numeric strings', () => {
      expect(clean('123')).toBe('123');
      expect(clean('0')).toBe('0');
      expect(clean('1.5')).toBe('1.5');
    });

    it('should handle strings with mixed content', () => {
      expect(clean('abc123')).toBe('abc123');
      expect(clean('123abc')).toBe('123abc');
      expect(clean('1a2b3c')).toBe('1a2b3c');
    });
  });

  describe('Edge cases', () => {
    it('should handle empty string', () => {
      expect(clean('')).toBe('0');
    });

    it('should handle whitespace', () => {
      expect(clean('   ')).toBe('0');
      expect(clean('\t')).toBe('0');
      expect(clean('\n')).toBe('0');
    });

    it('should handle special characters', () => {
      expect(clean('$100')).toBe('$100');
      expect(clean('100%')).toBe('100%');
    });
  });
});
