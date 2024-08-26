import numeral from 'numeraljs';
import { isProvince } from './inputs';

// Cleanup the input onBlur to determine if it's valid.
export default function clean(value: string) {
  // Province.
  if (isProvince(value)) {
    return value;
  }

  // Boolean.
  if (value === "Yes" || value === "No") {
    return value === "Yes";
  }

  // Ranges have to have two numbers.
  if (value.includes('-')) {
    const parts = value.split(' - ').filter(part => /[0-9]/.test(part));
    if (parts.length !== 2) {
      if (!parts.length) {
        return '0';
      }
      return parts[0];
    }

    // Flip large > small
    const nums = parts.map(part => numeral(part).value());
    if (nums[0] > nums[1]) {
      return parts.reverse().join(' - ');
    }

    return value;
  }

  // Numeric.
  if (!/[0-9]/.test(value)) {
    return '0';
  }

  return value;
};
