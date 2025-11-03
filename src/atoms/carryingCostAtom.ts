import { atom } from 'jotai';
import { type CarryingCostSeries } from '../interfaces';

export const carryingCostAtom = atom<CarryingCostSeries>([]);
export const carryingCostLoadingAtom = atom(false);
