import { atom } from 'jotai';

export interface DistData {
  buyer: number[];
  renter: number[];
}

export type DistState = DistData | null;

export const distAtom = atom(null as DistState);
