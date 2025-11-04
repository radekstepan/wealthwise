import { atom } from 'jotai';

export type MagicRentStatus = 'idle' | 'searching' | 'success' | 'error';

export interface MagicRentState {
  status: MagicRentStatus;
  message: string | null;
  iteration: number;
  diff: number | null;
  total?: number | null;
  // AbortController is not serializable but useful to cancel the worker from UI.
  controller?: AbortController | null;
}

export const magicRentAtom = atom<MagicRentState>({
  status: 'idle',
  message: null,
  iteration: 0,
  diff: null,
  total: null,
  controller: null,
});
