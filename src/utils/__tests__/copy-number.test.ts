import { unformatValue } from '../number';
import { INPUTS } from '../../const';

describe('Copy functionality demonstration', () => {
  test('demonstrates copy behavior for different input types', () => {
    // These examples show what users would copy vs what gets copied to clipboard
    
    // Currency examples
    const currencyExamples = [
      { display: '$100,000', clipboard: '100000' },
      { display: '$1,234,567.89', clipboard: '1234567.89' },
      { display: '$0.01', clipboard: '0.01' },
    ];

    currencyExamples.forEach(({ display, clipboard }) => {
      const result = unformatValue(display, INPUTS.CURRENCY);
      expect(result).toBe(clipboard);
      console.log(`Currency: User sees "${display}" → clipboard gets "${clipboard}"`);
    });

    // Percent examples
    const percentExamples = [
      { display: '4.5%', clipboard: '4.5' },
      { display: '100%', clipboard: '100' },
      { display: '0.25%', clipboard: '0.25' },
    ];

    percentExamples.forEach(({ display, clipboard }) => {
      const result = unformatValue(display, INPUTS.PERCENT);
      expect(result).toBe(clipboard);
      console.log(`Percent: User sees "${display}" → clipboard gets "${clipboard}"`);
    });

    // Number examples
    const numberExamples = [
      { display: '1,000', clipboard: '1000' },
      { display: '123,456.789', clipboard: '123456.789' },
      { display: '42', clipboard: '42' },
    ];

    numberExamples.forEach(({ display, clipboard }) => {
      const result = unformatValue(display, INPUTS.NUMBER);
      expect(result).toBe(clipboard);
      console.log(`Number: User sees "${display}" → clipboard gets "${clipboard}"`);
    });

    // Boolean and Province examples (pass through as-is)
    const passThroughExamples = [
      { display: 'Yes', type: INPUTS.BOOLEAN, clipboard: 'Yes' },
      { display: 'No', type: INPUTS.BOOLEAN, clipboard: 'No' },
      { display: 'British Columbia', type: INPUTS.PROVINCE, clipboard: 'British Columbia' },
      { display: 'Ontario', type: INPUTS.PROVINCE, clipboard: 'Ontario' },
    ];

    passThroughExamples.forEach(({ display, type, clipboard }) => {
      const result = unformatValue(display, type);
      expect(result).toBe(clipboard);
      console.log(`${type}: User sees "${display}" → clipboard gets "${clipboard}"`);
    });
  });
});