## wealthwi.se

### Overview

Wealthwise is a Monte Carlo simulator that helps you decide whether to buy or rent a home. It runs thousands of simulations to explore various scenarios and outcomes, providing a detailed analysis of potential financial impacts. The tool is entirely browser-based and open source.

### Features

- No Sign-Up Required: Everything runs locally in your browser.
- Built-In Uncertainty: Specify ranges for interest rates, house appreciation, and more.
- Monte Carlo Analysis: Runs 1,000+ random iterations to show potential 5th, 50th, and 95th percentile outcomes.
- Detailed Results: View a summary table and download an Excel spreadsheet with every year’s data.
- Open Source: Review the code on GitHub.

### How to Run

1. **Clone the repository:**
   ```sh
   git clone https://github.com/radekstepan/wealthwise.git
   cd wealthwise
   ```

2. **Install dependencies:**
   ```sh
   yarn install
   ```

3. **Run the development server:**
   ```sh
   yarn start
   ```

4. **Build for production:**
   ```sh
   yarn build-prod
   ```

5. **Run tests:**
   ```sh
   yarn test
   ```

6. **Run benchmarks:**
   ```sh
   yarn benchmark
   ```

### Model

This code is a simulation that runs a number of times (SAMPLES) and calculates the expected outcome of buying a house and investing in bonds or renting and investing in bonds. The inputs for the simulation are read from a JSON file, which is parsed using the parse function. The run function simulates a single run, and uses helper functions from run.helpers to calculate costs and returns at each step of the simulation. The simulation keeps track of the house price, the mortgage balance, the investment portfolio, and the monthly expenses and returns. It also takes into account the possibility of a property crash and the option to sell the property and move after a certain number of years. At the end of the simulation, the final portfolio value is compared to the final rent value to determine whether buying or renting was more profitable.
