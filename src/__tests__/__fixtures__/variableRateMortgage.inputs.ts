import { Province } from "../../interfaces";
import { walkAndAssignTypes } from "../../modules/inputs/inputs";

export const inputs = {
  province: Province.BC,
  mortgage: {
    amortization: 25,
    term: 5,
    isFixedRate: false
  },
  house: {
    price: "$710,000",
    downpayment: "20%",
    maintenance: "$586",
    propertyTax: "$3,733",
    insurance: "$100",
    closingCosts: "$3,000"
  },
  rent: {
    current: "$2,050",
    market: "$2,500",
    rentalIncome: "$0",
  },
  rates: {
    interest: {
      initial: "4.3%",
      future: "3%"
    },
    rent: {
      controlled: "2.5%",
      market: "3.5%",
      rentalIncome: "0%"
    },
    house: {
      expenses: "3.25%",
      appreciation: "2%"
    },
    bonds: {
      return: "4.5%",
      capitalGainsTax: "25%"
    }
  },
  scenarios: {
    simulate: {
      years: 50,
      samples: 1000
    },
    crash: {
      chance: "0%",
      drop: "0%"
    },
    move: {
      tenureYears: 5,
      annualMoveUpCost: "0%",
    },
    mortgage: {
      anniversaryPaydown: "0%"
    }
  }
};

export default walkAndAssignTypes(inputs);
