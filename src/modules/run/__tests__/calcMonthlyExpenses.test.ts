import { calcMonthlyExpenses } from "../calcMonthlyExpenses";

describe("calcMonthlyExpenses", () => {
  it("sums maintenance, monthly property tax, and insurance", () => {
    const mockOpts = {
      house: {
        maintenance: () => 100,
        propertyTax: () => 1200,
        insurance: () => 50
      }
    } as any;

    const result = calcMonthlyExpenses(mockOpts);
    
    expect(result).toBe(250);
  });
});
