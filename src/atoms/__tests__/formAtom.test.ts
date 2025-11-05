import { createStore } from 'jotai';
import clone from 'clone-deep';
import { Province } from '../../interfaces';

describe('formAtom', () => {
  beforeEach(() => {
    window.localStorage.clear();
    jest.resetModules();
  });

  it('initializes with default province', async () => {
    const { formAtom } = await import('../formAtom');
    const store = createStore();

    const value = store.get(formAtom);

    expect(value.province[0]).toBe(Province.BC);
  });

  it('rehydrates persisted state from localStorage', async () => {
    const { formAtom } = await import('../formAtom');
    const store = createStore();

    store.set(formAtom, (prev) => {
      const next = clone(prev);
      next.house.price[0] = '$720,000';
      return next;
    });

  const { storageKey } = await import('../../modules/formStatePersistence');
    expect(window.localStorage.getItem(storageKey)).not.toBeNull();

    jest.resetModules();

    const { formAtom: rehydratedAtom } = await import('../formAtom');
    const secondStore = createStore();
    const rehydratedValue = secondStore.get(rehydratedAtom);

    expect(rehydratedValue.house.price[0]).toBe('$720,000');
  });
});
