const EMPTY = '';
const REGEX_NON_DIGITS = /\D+/g;
const REGEX_DIGIT = /\d/;
const CARET_TRAP = '[]';
const RANGE_TRIGGER = ' -';
const RANGE_SEPARATOR = ' - ';

type Mask = (string | RegExp)[];

// An array of chars and regex digits.
const convertToMask = (text: string): Mask => text
  .split(EMPTY)
  .map(char => REGEX_DIGIT.test(char) ? REGEX_DIGIT : char);

// http://stackoverflow.com/a/10899795/604296
const addThousandsSeparator = (text: string, separator: string) => text
  .replace(/\B(?=(\d{3})+(?!\d))/g, separator);

// This code defines a function createNumberMask that creates a new
//  mask for a number. The mask is an array of strings and regular
//  expressions that define which characters are allowed in a string.
//  The createNumberMask function takes in a number of options that
//  specify the exact mask to be created, including the prefix and
//  suffix to be used, whether to include a thousands separator and
//  decimal symbol, the decimal limit, and other options. It then
//  returns a function parse that takes in a number as a string and
//  returns the mask for that number. This mask can be used to
//  validate whether a given string is a valid number that matches the
//  specified options.
export default function createNumberMask({
  prefix = EMPTY,
  suffix = EMPTY,
  includeThousandsSeparator = true,
  thousandsSeparatorSymbol = ',',
  allowDecimal = false,
  decimalSymbol = '.',
  decimalLimit = 2,

  requireDecimal = false,
  allowNegative = false,
  allowLeadingZeroes = false,
  integerLimit = null, // TODO needs to work for a range
  allowRange = false // 2 numbers separated by a ' - '
} = {}) {
  const prefixLength = prefix && prefix.length || 0;
  const suffixLength = suffix && suffix.length || 0;
  const thousandsSeparatorSymbolLength = thousandsSeparatorSymbol && thousandsSeparatorSymbol.length || 0;

  return function parse(text = EMPTY) {
    const length = text.length;

    // Empty or just the prefix.
    if (text === EMPTY || (text[0] === prefix[0] && length === 1)) {
      return [...prefix.split(EMPTY), REGEX_DIGIT, ...suffix.split(EMPTY)];
    // Insert a zero in front of a decimal separator.
    } else if (allowDecimal && text === decimalSymbol) {
      return [...prefix.split(EMPTY), '0', decimalSymbol, REGEX_DIGIT, ...suffix.split(EMPTY)];
    }

    if (allowRange) {
      if (text.includes(RANGE_TRIGGER)) {
        // TODO handle (disallow) multiple ranges.
        const [a, b] = text.split(RANGE_TRIGGER).map(d => d.trim()).map(parse);
        return [...a, ...RANGE_SEPARATOR.split(EMPTY), ...b];
      }
      // Allow a trailing space.
      if (length > 1 && text[length - 1] === ' ') {
        return [...parse(text.substring(0, length - 1)), ' '];
      }
    }


    const isNegative = allowNegative && (text[0] === '-');
    // If negative remove "-" sign.
    if (isNegative) {
      text = text.substring(1);
    }

    const indexOfLastDecimal = text.lastIndexOf(decimalSymbol);
    const hasDecimal = indexOfLastDecimal >= 0;

    // Remove the suffix.
    if (text.slice(suffixLength * -1) === suffix) {
      text = text.slice(0, suffixLength * -1);
    }

    let integer: string;
    let fraction: Mask;
    // Grab the integer value (and any decimals).
    if (hasDecimal && (allowDecimal || requireDecimal)) {
      integer = text.slice(text.slice(0, prefixLength) === prefix ? prefixLength : 0, indexOfLastDecimal);
      fraction = convertToMask(text
        .slice(indexOfLastDecimal + 1, length)
        .replace(REGEX_NON_DIGITS, EMPTY)
      );
    } else {
      if (text.slice(0, prefixLength) === prefix) {
        integer = text.slice(prefixLength);
      } else {
        integer = text;
      }
    }

    // Trim?
    if (typeof integerLimit === 'number') {
      const thousandsSeparatorRegex = thousandsSeparatorSymbol === '.' ? '[.]' : `${thousandsSeparatorSymbol}`;
      const numberOfThousandSeparators = (integer.match(new RegExp(thousandsSeparatorRegex, 'g')) || []).length;

      integer = integer.slice(0, integerLimit + (numberOfThousandSeparators * thousandsSeparatorSymbolLength));
    }

    // Remove any non digit chars.
    integer = integer.replace(REGEX_NON_DIGITS, EMPTY);
    // Remove leading zeroes?
    if (!allowLeadingZeroes) {
      integer = integer.replace(/^0+(0$|[^0])/, '$1');
    }
    // Add the thousands separator.
    integer = (includeThousandsSeparator) ? addThousandsSeparator(integer, thousandsSeparatorSymbol) : integer;

    let mask: Mask = convertToMask(integer);

    if ((hasDecimal && allowDecimal) || requireDecimal === true) {
      if (text[indexOfLastDecimal - 1] !== decimalSymbol) {
        mask.push(CARET_TRAP);
      }

      mask.push(decimalSymbol, CARET_TRAP);

      // Trim and add the fraction.
      if (fraction) {
        fraction = fraction.slice(0, decimalLimit);
        mask = [...mask, ...fraction];
      }

      if (requireDecimal === true && text[indexOfLastDecimal - 1] === decimalSymbol) {
        mask.push(REGEX_DIGIT);
      }
    }

    // Add the prefix to the mask?
    if (prefixLength) {
      mask = [...prefix.split(EMPTY), ...mask];
    }

    if (isNegative) {
      // If user is entering a negative number, add a mask placeholder spot to attract the caret to it.
      if (mask.length === prefixLength) {
        mask.push(REGEX_DIGIT);
      }

      mask = [/-/, ...mask];
    }

    // Add the suffix to the mask?
    if (suffix.length) {
      mask = [...mask, ...suffix.split(EMPTY)];
    }

    return mask;
  };
}

export const currencyMask = createNumberMask({
  prefix: '$',
  includeThousandsSeparator: true,
  thousandsSeparatorSymbol: ',',
  allowDecimal: true,
  decimalSymbol: '.',
  decimalLimit: 2, // how many digits allowed after the decimal
  integerLimit: 7, // limit length of integer numbers
  allowNegative: false,
  allowLeadingZeroes: false,
  allowRange: true
});

export const percentMask = createNumberMask({
  suffix: '%',
  includeThousandsSeparator: true,
  thousandsSeparatorSymbol: ',',
  allowDecimal: true,
  decimalSymbol: '.',
  decimalLimit: 2, // how many digits allowed after the decimal
  integerLimit: 7, // limit length of integer numbers
  allowNegative: false,
  allowLeadingZeroes: false,
  allowRange: true
});

export const numberMask =  createNumberMask({
  includeThousandsSeparator: true,
  thousandsSeparatorSymbol: ',',
  allowDecimal: true,
  decimalSymbol: '.',
  decimalLimit: 2, // how many digits allowed after the decimal
  integerLimit: 7, // limit length of integer numbers
  allowNegative: false,
  allowLeadingZeroes: false,
  allowRange: true
});
