import { atom } from 'jotai';

export interface SensitivityResult {
  variable: string;
  s1: number; // First-Order Index
  st: number; // Total-Order Index
}

export interface SensitivityState {
  status: 'idle' | 'running' | 'success' | 'error';
  results: SensitivityResult[] | null;
  progress: number;
  message: string | null;
}

export const sensitivityAtom = atom<SensitivityState>({
  status: 'idle',
  results: null,
  progress: 0,
  message: null,
});
