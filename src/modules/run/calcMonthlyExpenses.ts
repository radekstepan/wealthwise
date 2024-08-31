import { sum } from "mathjs";
import { type TypedInputs } from "../inputs/inputs";
import { type ParsedInputs } from "../inputs/parse";

// Expenses of the buyer.
export function calcMonthlyExpenses(opts: ParsedInputs<TypedInputs>) {
  return sum(
    opts.house.maintenance(),
    opts.house.propertyTax() / 12, // yearly to monthly
    opts.house.insurance()
  );
};
