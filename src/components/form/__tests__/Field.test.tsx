import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { unformatValue } from '../../../utils/number';
import { INPUTS } from '../../../const';

// Mock the clipboard API
const mockClipboard = {
  writeText: jest.fn(),
  readText: jest.fn(() => Promise.resolve('')),
};

Object.assign(navigator, {
  clipboard: mockClipboard,
});

// Mock the Field component to test copy functionality in isolation
const MockField = ({ value, type }: { value: string; type: INPUTS }) => {
  const onCopy = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const unformattedValue = unformatValue(value, type);
    e.clipboardData.setData('text/plain', unformattedValue);
  };

  return (
    <input
      value={value}
      onCopy={onCopy}
      data-testid="test-input"
      readOnly
    />
  );
};

describe('Field Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Copy functionality', () => {
    test('copies unformatted currency value', async () => {
      render(<MockField value="$100,000" type={INPUTS.CURRENCY} />);
      const input = screen.getByTestId('test-input');
      
      // Simulate copy event
      const copyEvent = new Event('copy', { bubbles: true }) as any;
      Object.defineProperty(copyEvent, 'clipboardData', {
        value: {
          setData: jest.fn(),
        },
        writable: true,
      });

      fireEvent(input, copyEvent);

      expect(copyEvent.clipboardData.setData).toHaveBeenCalledWith('text/plain', '100000');
    });

    test('copies unformatted percent value', async () => {
      render(<MockField value="4.5%" type={INPUTS.PERCENT} />);
      const input = screen.getByTestId('test-input');
      
      // Simulate copy event
      const copyEvent = new Event('copy', { bubbles: true }) as any;
      Object.defineProperty(copyEvent, 'clipboardData', {
        value: {
          setData: jest.fn(),
        },
        writable: true,
      });

      fireEvent(input, copyEvent);

      expect(copyEvent.clipboardData.setData).toHaveBeenCalledWith('text/plain', '4.5');
    });

    test('copies unformatted number value', async () => {
      render(<MockField value="25" type={INPUTS.NUMBER} />);
      const input = screen.getByTestId('test-input');
      
      // Simulate copy event
      const copyEvent = new Event('copy', { bubbles: true }) as any;
      Object.defineProperty(copyEvent, 'clipboardData', {
        value: {
          setData: jest.fn(),
        },
        writable: true,
      });

      fireEvent(input, copyEvent);

      expect(copyEvent.clipboardData.setData).toHaveBeenCalledWith('text/plain', '25');
    });

    test('copies boolean value as-is', async () => {
      render(<MockField value="Yes" type={INPUTS.BOOLEAN} />);
      const input = screen.getByTestId('test-input');
      
      // Simulate copy event
      const copyEvent = new Event('copy', { bubbles: true }) as any;
      Object.defineProperty(copyEvent, 'clipboardData', {
        value: {
          setData: jest.fn(),
        },
        writable: true,
      });

      fireEvent(input, copyEvent);

      expect(copyEvent.clipboardData.setData).toHaveBeenCalledWith('text/plain', 'Yes');
    });

    test('copies province value as-is', async () => {
      render(<MockField value="British Columbia" type={INPUTS.PROVINCE} />);
      const input = screen.getByTestId('test-input');
      
      // Simulate copy event
      const copyEvent = new Event('copy', { bubbles: true }) as any;
      Object.defineProperty(copyEvent, 'clipboardData', {
        value: {
          setData: jest.fn(),
        },
        writable: true,
      });

      fireEvent(input, copyEvent);

      expect(copyEvent.clipboardData.setData).toHaveBeenCalledWith('text/plain', 'British Columbia');
    });

    test('handles empty values gracefully', async () => {
      render(<MockField value="" type={INPUTS.CURRENCY} />);
      const input = screen.getByTestId('test-input');
      
      // Simulate copy event
      const copyEvent = new Event('copy', { bubbles: true }) as any;
      Object.defineProperty(copyEvent, 'clipboardData', {
        value: {
          setData: jest.fn(),
        },
        writable: true,
      });

      fireEvent(input, copyEvent);

      expect(copyEvent.clipboardData.setData).toHaveBeenCalledWith('text/plain', '');
    });

    test('copies currency range values correctly', async () => {
      render(<MockField value="$100,000 - $200,000" type={INPUTS.CURRENCY} />);
      const input = screen.getByTestId('test-input');
      
      const copyEvent = new Event('copy', { bubbles: true }) as any;
      Object.defineProperty(copyEvent, 'clipboardData', {
        value: {
          setData: jest.fn(),
        },
        writable: true,
      });

      fireEvent(input, copyEvent);

      expect(copyEvent.clipboardData.setData).toHaveBeenCalledWith('text/plain', '100000 - 200000');
    });

    test('copies percent range values correctly', async () => {
      render(<MockField value="1% - 3%" type={INPUTS.PERCENT} />);
      const input = screen.getByTestId('test-input');
      
      const copyEvent = new Event('copy', { bubbles: true }) as any;
      Object.defineProperty(copyEvent, 'clipboardData', {
        value: {
          setData: jest.fn(),
        },
        writable: true,
      });

      fireEvent(input, copyEvent);

      expect(copyEvent.clipboardData.setData).toHaveBeenCalledWith('text/plain', '1 - 3');
    });

    test('copies number range values correctly', async () => {
      render(<MockField value="1,000 - 2,000" type={INPUTS.NUMBER} />);
      const input = screen.getByTestId('test-input');
      
      const copyEvent = new Event('copy', { bubbles: true }) as any;
      Object.defineProperty(copyEvent, 'clipboardData', {
        value: {
          setData: jest.fn(),
        },
        writable: true,
      });

      fireEvent(input, copyEvent);

      expect(copyEvent.clipboardData.setData).toHaveBeenCalledWith('text/plain', '1000 - 2000');
    });
  });
});

describe('unformatValue utility', () => {
  test('unformats currency values correctly', () => {
    expect(unformatValue('$100,000.00', INPUTS.CURRENCY)).toBe('100000');
    expect(unformatValue('$1,234,567.89', INPUTS.CURRENCY)).toBe('1234567.89');
    expect(unformatValue('$0', INPUTS.CURRENCY)).toBe('0');
  });

  test('unformats percent values correctly', () => {
    expect(unformatValue('4.5%', INPUTS.PERCENT)).toBe('4.5');
    expect(unformatValue('100%', INPUTS.PERCENT)).toBe('100');
    expect(unformatValue('0.25%', INPUTS.PERCENT)).toBe('0.25');
  });

  test('unformats number values correctly', () => {
    expect(unformatValue('1,000', INPUTS.NUMBER)).toBe('1000');
    expect(unformatValue('123,456.789', INPUTS.NUMBER)).toBe('123456.789');
    expect(unformatValue('42', INPUTS.NUMBER)).toBe('42');
  });

  test('returns boolean values as-is', () => {
    expect(unformatValue('Yes', INPUTS.BOOLEAN)).toBe('Yes');
    expect(unformatValue('No', INPUTS.BOOLEAN)).toBe('No');
  });

  test('returns province values as-is', () => {
    expect(unformatValue('BC', INPUTS.PROVINCE)).toBe('BC');
    expect(unformatValue('ON', INPUTS.PROVINCE)).toBe('ON');
  });

  test('handles empty and edge cases', () => {
    expect(unformatValue('', INPUTS.CURRENCY)).toBe('');
    expect(unformatValue(null as any, INPUTS.CURRENCY)).toBe('');
    expect(unformatValue(undefined as any, INPUTS.CURRENCY)).toBe('');
  });

  test('handles unknown types gracefully', () => {
    expect(unformatValue('$100', 'unknown' as any)).toBe('100');
    expect(unformatValue('invalid', 'unknown' as any)).toBe('invalid');
  });
});