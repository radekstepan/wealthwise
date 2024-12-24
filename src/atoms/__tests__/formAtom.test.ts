import { Province } from '../../config';
import { formAtom } from '../formAtom';

describe('formAtom', () => {
  it('should initialize', () => {
    const initialValue = formAtom.init;
    
    expect(initialValue).toEqual(expect.objectContaining({
      province: [
        Province.BC,
        4
      ]
    }))
  });
});
