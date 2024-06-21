export const inputs = {
  mortgage: {
    amortization: 25, // years
    term: 5 // year; for a fixed rate
  },

  house: {
    price: "$650,000",
    downpayment: "20%",
    maintenance: "$550", // or condo fees
    propertyTax: "$3,100", // yearly
    insurance: "$100", // personal condo insurance
    closingCosts: "$3,000"
  },

  // https://rentals.ca/national-rent-report
  // https://www.rentfaster.ca/ab/calgary/rentals/townhouse
  rent: {
    current: "$2,050",
    market: "$2,900"
  },

  rates: {
    interest: { // mortgage
      isFixedRate: 1, // 1 = fixed, 0 = variable
      initial: "5%", // https://wowa.ca/best-mortgage-rates/5-year/fixed
      future: "3.5% - 6%"
    },
    rent: {
      controlled: "2% - 4%", // 3% per year on average
      market: "2% - 5%"
    },
    house: {
      expenses: "3% - 5%", // expenses increases
      appreciation: "1.9%" // 1.9% house price https://www.ceicdata.com/en/indicator/canada/house-prices-growth
    },
    bonds: {
      return: "3% - 4%",
      // TODO unused
      capitalGainsTax: "25%" // 50% on 50% (over $250k profit yearly is 66% inclusion rate)
    }
  },

  scenarios: {
    crash: { // property market crash
      chance: "4% - 8%", // 1x - 2x in 25 years
      drop: "20%" // each time
    },
    move: 5 // move every x years https://www.financialsamurai.com/the-median-homeownership-duration-is-too-short-to-build-real-wealth/
  }
};
