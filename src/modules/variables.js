export default {
  years: 25,
  price: '810000',
  downpayment: '20',
  maintenance: '440',
  propertyTax: '300',
  insurance: '200',
  rent: '2000',
  rates: {
    expenses: '3 - 5',
    interest: '3 - 5',
    rent: '1.5 - 2.5', // rent increases
    marketRent: '3 - 7', // market rent increases
    appreciation: '2 - 4', // property appreciation
    stocks: '1 - 3', // stock market return
    capitalGainsTax: '25' // 50% on 50% income tax
  },
  scenarios: {
    sell: 7 // sell and move every x years
  }
}
