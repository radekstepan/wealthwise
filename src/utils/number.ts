import numbro from 'numbro';
import { INPUTS } from '../const';

/**
 * Converts a formatted value back to its raw unformatted string representation
 * @param value The formatted value (e.g., "$100,000.00", "4.5%", "1,000", "1% - 3%")
 * @param type The input type to determine the formatting rules
 * @returns The unformatted value as a string (e.g., "100000", "4.5", "1000", "0.01 - 0.03")
 */
export const unformatValue = (value: string, type: INPUTS): string => {
  if (!value || value === '') {
    return '';
  }

  // Helper function to unformat a single value based on type
  const unformatSingleValue = (val: string): string => {
    if (!val || val === '') {
      return '';
    }

    const safeUnformat = (input: string): string => {
      const result = numbro.unformat(input);
      return result !== undefined && result !== null ? result.toString() : input;
    };

    switch (type) {
      case INPUTS.CURRENCY:
        // Remove currency prefix and format as number
        return safeUnformat(val);
      
      case INPUTS.PERCENT:
        // Remove percent suffix and convert to decimal
        const percentValue = val.replace('%', '');
        return safeUnformat(percentValue);
      
      case INPUTS.NUMBER:
        // Just remove formatting characters
        return safeUnformat(val);
      
      case INPUTS.BOOLEAN:
        // Return as-is for boolean values
        return val;
      
      case INPUTS.PROVINCE:
        // Return as-is for province values
        return val;
      
      default:
        // Default case - try to unformat as number
        return safeUnformat(val);
    }
  };

  // Handle ranges (same logic as in parse.ts)
  if (value.includes(' - ')) {
    return value
      .split(' - ')
      .map(part => unformatSingleValue(part.trim()))
      .join(' - ');
  }

  // Handle single values
  return unformatSingleValue(value);
};