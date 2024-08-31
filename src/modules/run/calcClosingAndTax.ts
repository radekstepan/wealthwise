import { type TypedInputs } from "../inputs/inputs";
import { type ParsedInputs } from "../inputs/parse";
import * as helpers from "../run.helpers";
import { sum } from "../utils";
import { type Province } from "../../config";

export function calcClosingAndTax(opts: ParsedInputs<TypedInputs>, province: Province, currentHousePrice: number) {
  return sum(
    opts.house.closingCosts(),
    helpers.landTransferTax(province, currentHousePrice, true)
  );
};
