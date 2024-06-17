import { atom } from 'jotai';

export interface MetaState {
  downpayment: number; // in $
  closingAndTax: number; // in $
  cmhc: number, // in $
  expenses: number; // in $, maintenance, property tax, insurance
  payment: number; // in $, monthly mortgage payment
}

export const metaAtom = atom<MetaState>({
  downpayment: null,
  closingAndTax: null,
  cmhc: null,
  expenses: null,
  payment: null,
});
