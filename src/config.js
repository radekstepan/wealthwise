export default {
  form: {
    years: 25,
    price: 810000,
    downpayment: 20,
    maintenance: 440,
    taxes: 300,
    insurance: 200,
    rent: 2000,
    rates: {
      expenses: 5,
      interest: 3.5,
      rent: 2, // rent increases
      marketRent: 5, // market rent increases
      appreciation: 3, // property appreciation
      market: 3 // stock market return
    },
    scenarios: {
      sell: 7 // sell and move every x years
    }
  },
  graph: {
    animation: 500 // ms
  }
}
