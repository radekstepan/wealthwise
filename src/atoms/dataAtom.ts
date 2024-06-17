import { atom } from 'jotai';
import { type ChartData } from '../components/chart/Chart';

export const dataAtom = atom<ChartData>([
  [],
  [],
  [],
]);
