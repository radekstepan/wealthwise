import clone from 'clone-deep';
import typedInputs, { type TypedInputs, type InputNode } from './inputs/inputs';

const STORAGE_PREFIX = 'wealthwise.formState';

const normalizeScalar = (value: unknown): unknown => {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value.toString() : 'NaN';
  }

  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'boolean' || value === null) {
    return value;
  }

  if (typeof value === 'undefined') {
    return null;
  }

  return value;
};

const normalizeForHash = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map(normalizeForHash);
  }

  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, child]) => [key, normalizeForHash(child)] as const);

    return Object.fromEntries(entries);
  }

  return normalizeScalar(value);
};

const hashString = (input: string): string => {
  let hash = 5381;

  for (let index = 0; index < input.length; index += 1) {
    hash = ((hash << 5) + hash) ^ input.charCodeAt(index);
  }

  return (hash >>> 0).toString(16);
};

const normalizedDefaults = normalizeForHash(typedInputs);
const schemaFingerprint = JSON.stringify(normalizedDefaults);
export const schemaHash = hashString(schemaFingerprint);
export const storageKey = `${STORAGE_PREFIX}:${schemaHash}`;

const getStorage = (): Storage | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return window.localStorage;
  } catch (error) {
    return null;
  }
};

const purgeLegacySnapshots = (storage: Storage): void => {
  const keysToRemove: string[] = [];

  for (let index = 0; index < storage.length; index += 1) {
    const candidate = storage.key(index);

    if (candidate && candidate.startsWith(STORAGE_PREFIX) && candidate !== storageKey) {
      keysToRemove.push(candidate);
    }
  }

  for (const key of keysToRemove) {
    storage.removeItem(key);
  }
};

const isInputNode = (value: unknown): value is InputNode => Array.isArray(value) && value.length === 2;

const isCompatibleWithTemplate = (candidate: unknown, template: unknown): boolean => {
  if (isInputNode(template)) {
    if (!isInputNode(candidate)) {
      return false;
    }

    const [, expectedType] = template;
    const [, candidateType] = candidate;

    return expectedType === candidateType;
  }

  if (template && typeof template === 'object' && !Array.isArray(template)) {
    if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) {
      return false;
    }

    const candidateRecord = candidate as Record<string, unknown>;

    for (const [key, templateValue] of Object.entries(template as Record<string, unknown>)) {
      if (!(key in candidateRecord)) {
        return false;
      }

      if (!isCompatibleWithTemplate(candidateRecord[key], templateValue)) {
        return false;
      }
    }

    return true;
  }

  return false;
};

let purgedLegacyOnce = false;

export const formStatePersistence = {
  storageKey,
  schemaHash,
  load(): TypedInputs | undefined {
    const storage = getStorage();

    if (!storage) {
      return undefined;
    }

    if (!purgedLegacyOnce) {
      purgeLegacySnapshots(storage);
      purgedLegacyOnce = true;
    }

    const serialized = storage.getItem(storageKey);

    if (!serialized) {
      return undefined;
    }

    try {
      const parsed = JSON.parse(serialized);

      if (isCompatibleWithTemplate(parsed, typedInputs)) {
        return clone(parsed);
      }
    } catch (error) {
      // Intentionally ignore JSON parse errors and clean up below.
    }

    storage.removeItem(storageKey);
    return undefined;
  },
  save(state: TypedInputs): void {
    const storage = getStorage();

    if (!storage) {
      return;
    }

    try {
      storage.setItem(storageKey, JSON.stringify(state));
    } catch (error) {
      // Ignore storage quota or serialization errors to avoid breaking the UI.
    }
  },
  clear(): void {
    const storage = getStorage();

    if (!storage) {
      return;
    }

    storage.removeItem(storageKey);
  }
};

export const defaultFormState = clone(typedInputs);
