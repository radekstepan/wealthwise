import clone from 'clone-deep';
import { atom } from 'jotai';
import { formStatePersistence, defaultFormState } from '../modules/formStatePersistence';
import type { TypedInputs } from '../modules/inputs/inputs';

type FormUpdate = TypedInputs | ((prev: TypedInputs) => TypedInputs);

const persistedFormState = formStatePersistence.load();
const initialFormState: TypedInputs = persistedFormState ?? clone(defaultFormState);

if (!persistedFormState) {
  formStatePersistence.save(initialFormState);
}

const formStateAtom = atom<TypedInputs>(initialFormState);

export const formAtom = atom(
  (get) => get(formStateAtom),
  (get, set, update: FormUpdate) => {
    const nextValue = typeof update === 'function'
      ? (update as (prev: TypedInputs) => TypedInputs)(get(formStateAtom))
      : update;

    formStatePersistence.save(nextValue);
    set(formStateAtom, nextValue);
  }
);
