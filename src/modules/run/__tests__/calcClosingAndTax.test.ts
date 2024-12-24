import { calcClosingAndTax } from '../calcClosingAndTax';
import * as helpers from '../../run.helpers';
import { Province } from '../../../config';

jest.mock('../../run.helpers');

describe('calcClosingAndTax', () => {
  it('should sum closing costs and land transfer tax', () => {
    const mockOpts = {
      house: {
        closingCosts: jest.fn().mockReturnValue(2000)
      }
    } as any;

    (helpers.landTransferTax as jest.Mock).mockReturnValue(3000);

    const result = calcClosingAndTax(mockOpts, Province.BC, 500000);

    expect(result).toBe(5000);
    expect(helpers.landTransferTax).toHaveBeenCalledWith(Province.BC, 500000, true);
  });
});
