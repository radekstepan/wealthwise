import { initMortgage } from '../initMortgage';
import Mortgage from '../../mortgage';

jest.mock('../../mortgage');

describe('initMortgage', () => {
  test('passes correct values to Mortgage', () => {
    const balance = 300000;
    const rate = 0.05;
    const amortization = 25;

    initMortgage(balance, rate, amortization);

    expect(Mortgage).toHaveBeenCalledWith({
      balance: balance,
      rate: rate,
      periods: amortization * 12
    });
  });
});