import { atom } from 'jotai';

export type MagicAppreciationStatus = 'idle' | 'searching' | 'success' | 'error';

export interface MagicAppreciationState {
  status: MagicAppreciationStatus;
  message: string | null;
  iteration: number;
  diff: number | null;
  total?: number | null;
  // AbortController is not serializable but useful to cancel the worker from UI.
  controller?: AbortController | null;
}

export const magicAppreciationAtom = atom<MagicAppreciationState>({
  status: 'idle',
  message: null,
  iteration: 0,
  diff: null,
  total: null,
  controller: null,
});
