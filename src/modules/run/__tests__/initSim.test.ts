import * as helpers from "../../run.helpers";
import { calcClosingAndTax } from "../calcClosingAndTax";
import { calcMonthlyExpenses } from "../calcMonthlyExpenses";
import { initMortgage } from "../initMortgage";
import { initUsers } from "../initUsers";
import { initSim } from "../initSim";
import { Province } from "../../../config";

jest.mock("../../run.helpers");
jest.mock("../calcClosingAndTax");
jest.mock("../calcMonthlyExpenses");
jest.mock("../initMortgage");
jest.mock("../initUsers");

describe("initSim", () => {
  it("should initialize simulation with correct values", () => {
    // Setup mock values
    const mockAmortization = 25;
    const mockSimulateYears = 30;
    const mockTerm = 5;
    const mockIsFixedRate = true;
    const mockDownpayment = 0.2;
    const mockCapitalGainsTax = 0.5;
    const mockHousePrice = 500000;
    const mockInterestRate = 0.05;
    const mockRentCurrent = 2000;
    const mockRentMarket = 2200;

    const mockOpts = {
      province: () => Province.BC,
      mortgage: {
        amortization: () => mockAmortization,
        term: () => mockTerm,
        isFixedRate: () => mockIsFixedRate,
      },
      scenarios: {
        simulate: {
          years: () => mockSimulateYears,
        },
      },
      house: {
        downpayment: () => mockDownpayment,
        price: () => mockHousePrice,
      },
      rates: {
        bonds: {
          capitalGainsTax: () => mockCapitalGainsTax,
        },
        interest: {
          initial: () => mockInterestRate,
        },
      },
      rent: {
        current: () => mockRentCurrent,
        market: () => mockRentMarket,
      },
    } as any;

    const mockClosingAndTax = 10000;
    const mockMortgage = { balance: 400000 };
    const mockMonthlyExpenses = 3000;
    const mockUsers = {
      buyer: {},
      renter: {},
    };
    const mockCmhc = 15000;

    (calcClosingAndTax as jest.Mock).mockReturnValue(mockClosingAndTax);
    (calcMonthlyExpenses as jest.Mock).mockReturnValue(mockMonthlyExpenses);
    (initMortgage as jest.Mock).mockReturnValue(mockMortgage);
    (initUsers as jest.Mock).mockReturnValue(mockUsers);
    (helpers.cmhc as jest.Mock).mockReturnValue(mockCmhc);

    const result = initSim(mockOpts);
    
    const originalBalance = mockHousePrice * (1 - mockDownpayment);
    const downpaymentAmount = mockHousePrice - originalBalance;

    // Verify function calls
    expect(calcClosingAndTax).toHaveBeenCalledWith(mockOpts, Province.BC, mockHousePrice);
    expect(initMortgage).toHaveBeenCalledWith(originalBalance, mockInterestRate, mockAmortization);
    expect(calcMonthlyExpenses).toHaveBeenCalledWith(mockOpts);
    expect(helpers.cmhc).toHaveBeenCalledWith(mockDownpayment, mockHousePrice);
    expect(initUsers).toHaveBeenCalledWith({
      downpaymentAmount,
      closingAndTax: mockClosingAndTax,
      cmhc: mockCmhc,
      province: Province.BC,
      capitalGainsTaxRate: mockCapitalGainsTax,
      currentHousePrice: mockHousePrice,
      mortgageBalance: mockMortgage.balance
    });

    // Verify return values
    expect(result).toEqual({
      province: Province.BC,
      amortization: mockAmortization,
      term: mockTerm,
      isFixedRate: mockIsFixedRate,
      downpayment: mockDownpayment,
      capitalGainsTaxRate: mockCapitalGainsTax,
      currentHousePrice: mockHousePrice,
      currentInterestRate: mockInterestRate,
      newHousePrice: mockHousePrice,
      closingAndTax: mockClosingAndTax,
      originalBalance,
      mortgage: mockMortgage,
      rent: mockRentCurrent,
      marketRent: mockRentMarket,
      downpaymentAmount,
      cmhc: mockCmhc,
      monthlyExpenses: mockMonthlyExpenses,
      buyer: mockUsers.buyer,
      renter: mockUsers.renter,
      simulateYears: mockSimulateYears
    });
  });
});
