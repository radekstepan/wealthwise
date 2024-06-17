import { atom } from 'jotai';

export type DistState = Array<[ // array of bands
  range: [min: number, max: number], // band range
  count: number // results falling into each band
]>

export const distAtom = atom<DistState>([]);
