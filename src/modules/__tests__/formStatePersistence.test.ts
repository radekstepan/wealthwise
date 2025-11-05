import clone from 'clone-deep';

describe('formStatePersistence', () => {
  const importModule = async () => import('../formStatePersistence');

  beforeEach(() => {
    window.localStorage.clear();
    jest.resetModules();
  });

  test('load returns undefined when nothing is stored', async () => {
    const { formStatePersistence } = await importModule();

    expect(formStatePersistence.load()).toBeUndefined();
  });

  test('save persists form state and load returns a clone', async () => {
    const { formStatePersistence, defaultFormState, storageKey } = await importModule();
    const workingCopy = clone(defaultFormState);

    workingCopy.house.price[0] = '750,000';

    formStatePersistence.save(workingCopy);

    const serialized = window.localStorage.getItem(storageKey);
    expect(serialized).not.toBeNull();

    const loaded = formStatePersistence.load();
    expect(loaded).toEqual(workingCopy);
    expect(loaded).not.toBe(workingCopy);
  });

  test('load drops incompatible persisted payloads', async () => {
    const { formStatePersistence, storageKey } = await importModule();

    window.localStorage.setItem(storageKey, JSON.stringify({ legacy: true }));

    expect(formStatePersistence.load()).toBeUndefined();
    expect(window.localStorage.getItem(storageKey)).toBeNull();
  });

  test('legacy keys are purged during load', async () => {
    const { formStatePersistence } = await importModule();
    const legacyKey = 'wealthwise.formState:legacy';

    window.localStorage.setItem(legacyKey, JSON.stringify({ old: true }));

    formStatePersistence.load();

    expect(window.localStorage.getItem(legacyKey)).toBeNull();
  });

  // --- additional coverage from full test suite ---
  test('schemaHash is stable across imports', async () => {
    const modA = await importModule();
    const hashA = modA.schemaHash;

    jest.resetModules();

    const modB = await importModule();
    const hashB = modB.schemaHash;

    expect(hashA).toBeDefined();
    expect(hashA).toEqual(hashB);
  });

  test('load accepts compatible payloads (different values)', async () => {
    const { formStatePersistence, defaultFormState, storageKey } = await importModule();
    const working = clone(defaultFormState);
    // mutate a scalar value keeping the input token the same
    working.house.price[0] = '$999,999';

    window.localStorage.setItem(storageKey, JSON.stringify(working));

    const loaded = formStatePersistence.load();
    expect(loaded).toBeDefined();
    expect(loaded).toEqual(working);
  });

  test('load removes corrupted JSON', async () => {
    const { formStatePersistence, storageKey } = await importModule();

    window.localStorage.setItem(storageKey, "not a json");

    const loaded = formStatePersistence.load();
    expect(loaded).toBeUndefined();
    expect(window.localStorage.getItem(storageKey)).toBeNull();
  });

  test('purgeLegacySnapshots removes old keys but preserves current key', async () => {
    const { formStatePersistence, storageKey } = await importModule();

    const legacyKey = 'wealthwise.formState:legacy1';
    window.localStorage.setItem(legacyKey, JSON.stringify({ old: true }));

    // put current key with a compatible payload (defaults)
    const { defaultFormState } = await importModule();
    window.localStorage.setItem(storageKey, JSON.stringify(defaultFormState));

    formStatePersistence.load();

    expect(window.localStorage.getItem(legacyKey)).toBeNull();
    expect(window.localStorage.getItem(storageKey)).not.toBeNull();
  });

  test('save swallows storage errors and does not throw', async () => {
    const { formStatePersistence, defaultFormState } = await importModule();

    // make setItem throw
    const realSetItem = window.localStorage.setItem;
    // @ts-ignore
    window.localStorage.setItem = () => { throw new Error('quota'); };

    expect(() => formStatePersistence.save(defaultFormState)).not.toThrow();

    // restore
    // @ts-ignore
    window.localStorage.setItem = realSetItem;
  });

  test('load drops incompatible payload even if JSON valid', async () => {
    const { formStatePersistence, storageKey } = await importModule();

    // valid JSON but incompatible structure
    window.localStorage.setItem(storageKey, JSON.stringify({ some: 'thing', number: 5 }));

    const loaded = formStatePersistence.load();
    expect(loaded).toBeUndefined();
    expect(window.localStorage.getItem(storageKey)).toBeNull();
  });
});
