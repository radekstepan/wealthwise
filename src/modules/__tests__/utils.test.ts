import {isEvery} from '../utils';

describe('utils', () => {
  describe('isEvery', () => {
    test('every n times', () => {
      expect(isEvery(0, 3)).toBeFalsy();
      expect(isEvery(1, 3)).toBeFalsy();
      expect(isEvery(2, 3)).toBeFalsy();
      expect(isEvery(3, 3)).toBeTruthy();
      expect(isEvery(6, 3)).toBeTruthy();
    });
  });
});
