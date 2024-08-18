export enum Province {
  "Alberta"
};

export const inputs = {
  province: Province.Alberta,

  mortgage: {
    amortization: 25, // years
    term: 5, // year; for a fixed rate
    isFixedRate: "Yes"
  },

  house: {
    price: "$650,000",
    downpayment: "20%",
    maintenance: "$550", // or condo fees
    propertyTax: "$3,100", // yearly
    insurance: "$100", // personal condo insurance
    closingCosts: "$3,000" // https://www.ratehub.ca/mortgage-payment-calculator
  },

  // https://rentals.ca/national-rent-report
  // https://www.rentfaster.ca/ab/calgary/rentals/townhouse
  rent: {
    current: "$2,050",
    market: "$2,900"
  },

  rates: {
    interest: { // mortgage
      initial: "4.65%", // https://wowa.ca/best-mortgage-rates/5-year/fixed
      future: "3.5% - 6%"
    },
    rent: {
      controlled: "1% - 4%",
      market: "2% - 5%"
    },
    house: {
      expenses: "3% - 5%", // expenses increases
      appreciation: "1.9%" // 1.9% house price https://www.ceicdata.com/en/indicator/canada/house-prices-growth
    },
    bonds: {
      return: "3% - 4%",
      capitalGainsTax: "25%" // 50% on 50% (over $250k profit yearly is 66% inclusion rate)
    }
  },

  scenarios: {
    crash: { // property market crash
      chance: "4% - 8%", // 1x - 2x in 25 years
      drop: "10%" // each time
    },
    move: {
      tenureYears: 5, // move every x years https://www.financialsamurai.com/the-median-homeownership-duration-is-too-short-to-build-real-wealth/
      annualMoveUpCost: "0%", // how much more expensive a shiny new property is going to be
    },
    mortgage: {
      anniversaryPaydown: "0%" // simulate the effect of paying down a percentage of the original principal on the mortgage anniversary
    }
  }
};
