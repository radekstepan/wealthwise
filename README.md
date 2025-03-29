# wealthwi.se

### Overview

Wealthwise is an advanced **Monte Carlo simulator** designed to help analyze the complex **buy versus rent** decision for housing. Instead of relying on single-point estimates, it runs thousands of simulations, incorporating **user-defined uncertainty** (input ranges) for key variables like interest rates, appreciation, and returns. This provides a probabilistic view of potential financial outcomes over time, helping users understand the risks and potential rewards associated with buying or renting.

The tool is entirely **browser-based**, ensuring user privacy, and is **open source**.

### Features

-   **Monte Carlo Analysis:** Runs 1,000+ random iterations based on your inputs (including ranges) to model uncertainty.
-   **Probabilistic Outputs:**
    -   Displays **5th, 50th (median), and 95th percentile** net worth outcomes for both buyer and renter scenarios over time in an interactive chart.
    -   Shows a **distribution histogram** of the final net worth for the buyer scenario.
-   **Detailed Financial Modeling:** Considers factors like:
    -   Mortgage payments (fixed/variable), amortization, term renewals.
    -   Down payments, CMHC insurance.
    -   Property taxes, maintenance, insurance, and their inflation.
    -   Rent inflation (controlled and market).
    -   Property appreciation and potential market crashes.
    -   Investment returns on saved funds (e.g., down payment for renter, cost differences).
    -   Capital gains tax on investments.
    -   Transaction costs (closing costs, land transfer tax, selling fees).
    -   Costs and premiums associated with moving/upgrading properties.
    -   Optional mortgage principal prepayments.
-   **Interactive Results:**
    -   Chart legend dynamically shows net worth values at the hovered year/point.
    -   Summary table provides key initial costs and final outcome details.
-   **Data Export:** Download a detailed **Excel spreadsheet** with year-by-year financial breakdowns for the median simulation run.
-   **Privacy Focused:** All calculations run locally in your browser. No data is sent to a server.
-   **Open Source:** Review the code, understand the model, or contribute on GitHub.

### How It Works (Model)

The simulator compares two financial paths over a chosen number of years:

1.  **Buyer Path:**
    -   Pays down payment, closing costs, LTT, and potentially CMHC insurance.
    -   Pays monthly mortgage (principal + interest), property tax, maintenance, and insurance.
    -   Builds equity as the mortgage is paid down and the property potentially appreciates.
    -   If total monthly housing costs are *less* than equivalent rent, the difference is invested in a portfolio (e.g., bonds).
    -   Faces transaction costs (selling fees, LTT, closing costs, potential upgrade premium) if moving according to the specified scenario.
    -   Property value can be affected by random appreciation/depreciation and potential market crashes.
    -   Mortgage interest rates can change at renewal based on input ranges.
2.  **Renter Path:**
    -   Invests the equivalent of the buyer's initial down payment, closing costs, LTT, and CMHC insurance into a portfolio.
    -   Pays monthly rent, which inflates over time.
    -   If monthly rent is *less* than the buyer's total monthly housing costs, the difference is invested in the portfolio.
    -   Portfolio grows based on specified investment returns and is subject to capital gains tax upon withdrawal (implicitly calculated at the end for net worth).

The simulation runs these paths hundreds or thousands of times (`SAMPLES`), each time drawing random values from the ranges provided by the user for variables like future interest rates, appreciation, returns, crash chance/severity, etc.

After all simulations complete, the results are processed to calculate the 5th, 50th, and 95th percentile outcomes for net worth (Property Value - Selling Costs - Remaining Mortgage + Portfolio Net Worth for Buyer; Portfolio Net Worth for Renter) for each year, which are then displayed on the chart and table. A histogram shows the distribution of the buyer's final net worth across all simulations.

### How to Run

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/radekstepan/wealthwise.git
    cd wealthwise
    ```

2.  **Install dependencies:**
    ```sh
    yarn install
    ```

3.  **Run the development server:**
    ```sh
    yarn start
    ```
    Access at `http://localhost:8080` (or similar).

4.  **Build for production:**
    ```sh
    yarn build-prod
    ```

5.  **Run tests:**
    ```sh
    yarn test
    ```

6.  **Run benchmarks:**
    ```sh
    yarn benchmark
    ```

### Contributing

Contributions, issues, and feature requests are welcome. Feel free to check the [issues page](https://github.com/radekstepan/wealthwise/issues).

### License

MIT License - see the [LICENSE](LICENSE) file for details.
