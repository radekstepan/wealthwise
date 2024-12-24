import { type MetaState } from "../../atoms/metaAtom";
import Mortgage from "../mortgage";

export function emitMeta({
  downpaymentAmount,
  closingAndTax,
  cmhc,
  monthlyExpenses,
  mortgage
}: {
  downpaymentAmount: number,
  closingAndTax: number,
  cmhc: number,
  monthlyExpenses: number,
  mortgage: ReturnType<typeof Mortgage>
}) {
  const meta: MetaState = {
    cmhc,
    downpayment: downpaymentAmount,
    closingAndTax: closingAndTax,
    expenses: monthlyExpenses,
    payment: mortgage.payment
  };

  self.postMessage({
    action: 'meta',
    meta
  }, '*');
};
