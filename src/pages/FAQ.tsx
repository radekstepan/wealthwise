import React, { useEffect } from "react";
import Link from "../components/link/Link";
import { AppRoute } from "../routes";

const FAQ: React.FC = () => {
  useEffect(() => {
    document.title = "Simulator Settings Explained";
  }, []);

  return (
    <div className="home">
      <header className="home__header">
        <h1>Buy vs Rent Simulator: Settings Explained</h1>
        <p>
          This guide details each simulation parameter used in our Buy vs Rent Calculator. Explore the inputs and understand how they affect the simulation.
        </p>
      </header>

      <main className="home__main">
        {/* Simulation Overview */}
        <section id="overview">
          <h2>Simulation Overview</h2>
          <p>
            Our simulator runs Monte Carlo simulations entirely in your browser. By leveraging your inputs—including ranges with natural distributions—we explore hundreds of iterations to model potential outcomes. 
          </p>
          <p>
            The simulation produces:
          </p>
          <ul>
            <li>A dynamic chart showing the 5th, 50th, and 95th percentile outcomes over time.</li>
            <li>A quick overview table summarizing key metrics.</li>
            <li>A downloadable spreadsheet with a detailed year-by-year breakdown.</li>
          </ul>
          <p>
            Net worth is calculated as the sum of your property and portfolio values. In the renting scenario, if rent exceeds expenses, the surplus is funneled into your portfolio as imputed rent savings. Even for buyers, an imputed rent component is considered to reflect the cost of living in your own home.
          </p>
        </section>

        {/* Property Settings */}
        <section id="property">
          <h2>Property Settings</h2>
          <p>Parameters related to the property under consideration.</p>
          <div>
            <h3>Price</h3>
            <p>
              The listing price or market value of the property, which is fundamental in determining the mortgage principal and overall investment.
            </p>
          </div>
          <div>
            <h3>Downpayment</h3>
            <p>
              The percentage of the purchase price paid upfront. A higher downpayment reduces the financed amount.
            </p>
          </div>
          <div>
            <h3>Maintenance</h3>
            <p>
              The recurring monthly cost for property maintenance or condo fees, included in the operating expenses.
            </p>
          </div>
          <div>
            <h3>Property Taxes</h3>
            <p>
              The annual tax based on the property's assessed value.
            </p>
          </div>
          <div>
            <h3>Homeowner's Insurance</h3>
            <p>
              The monthly premium covering property damage and liability.
            </p>
          </div>
          <div>
            <h3>Expenses Increases</h3>
            <p>
              The expected annual percentage escalation in property-related expenses, reflecting inflationary pressures.
            </p>
          </div>
          <div>
            <h3>Province</h3>
            <p>
              The jurisdiction where the property is located. Tax rates, fees, and regulations vary by province.
            </p>
          </div>
        </section>

        {/* Mortgage Settings */}
        <section id="mortgage">
          <h2>Mortgage Settings</h2>
          <p>Parameters defining the characteristics of your mortgage.</p>
          <div>
            <h3>Downpayment</h3>
            <p>
              (Reiterated) The percentage of the purchase price paid upfront, which lowers the mortgage principal.
            </p>
          </div>
          <div>
            <h3>Current Interest Rate</h3>
            <p>
              The prevailing mortgage rate, directly affecting your monthly payments.
            </p>
          </div>
          <div>
            <h3>Future Interest Rate</h3>
            <p>
              A range that represents potential fluctuations in rates at mortgage term renewal.
            </p>
          </div>
          <div>
            <h3>Amortization</h3>
            <p>
              The total duration (in years) over which the mortgage is scheduled to be repaid.
            </p>
          </div>
          <div>
            <h3>Term</h3>
            <p>
              The length (in years) of the current mortgage term before a rate review or renewal.
            </p>
          </div>
          <div>
            <h3>Fixed Rate</h3>
            <p>
              Indicates if the mortgage rate is fixed (true) or variable (false) during the term.
            </p>
          </div>
        </section>

        {/* Rent Settings */}
        <section id="rent">
          <h2>Rent Settings</h2>
          <p>Inputs for modeling the renting scenario.</p>
          <div>
            <h3>Rent</h3>
            <p>
              The current monthly rental payment, serving as the baseline expense.
            </p>
          </div>
          <div>
            <h3>Market Rent</h3>
            <p>
              The prevailing rental rate for comparable properties.
            </p>
          </div>
          <div>
            <h3>Rent Increases</h3>
            <p>
              The expected annual percentage increase in the current rental payment, often subject to regulatory limits.
            </p>
          </div>
          <div>
            <h3>Market Rent Increases</h3>
            <p>
              The anticipated annual escalation in prevailing rental rates.
            </p>
          </div>
        </section>

        {/* Returns Settings */}
        <section id="returns">
          <h2>Returns Settings</h2>
          <p>
            This section compares property investment returns with those from secure investments.
          </p>
          <div>
            <h3>Property Appreciation</h3>
            <p>
              The expected annual percentage increase in property value, reflecting asset growth.
            </p>
          </div>
          <div>
            <h3>Safe Investment Return</h3>
            <p>
              The anticipated annual return from secure investments (e.g., bonds), used as a benchmark.
            </p>
          </div>
          <div>
            <h3>Capital Gains Tax</h3>
            <p>
              The effective tax rate on gains from property or investment sales, reducing net returns.
            </p>
          </div>
        </section>

        {/* Scenario Settings */}
        <section id="scenarios">
          <h2>Scenario Settings</h2>
          <p>
            Parameters that incorporate uncertainty and potential future events into the simulation.
          </p>
          <div>
            <h3>Simulation Years</h3>
            <p>
              The total number of years over which the simulation runs, representing your long-term planning horizon.
            </p>
          </div>
          <div>
            <h3>Property Price Drop Chance</h3>
            <p>
              The probability (in percentage) of a significant property value correction occurring during the simulation.
            </p>
          </div>
          <div>
            <h3>Property Price Drop Amount</h3>
            <p>
              The percentage reduction in property value during a downturn event.
            </p>
          </div>
          <div>
            <h3>Years Before Moving</h3>
            <p>
              The interval (in years) between property moves, which influences transaction costs and timing.
            </p>
          </div>
          <div>
            <h3>New Home Premium</h3>
            <p>
              The additional cost percentage incurred when purchasing a new property, accounting for the typical premium on new acquisitions.
            </p>
          </div>
          <div>
            <h3>Principal Prepayment</h3>
            <p>
              The percentage of the original mortgage principal paid down annually on the mortgage anniversary, reducing total interest expenses.
            </p>
          </div>
        </section>

        <section>
          <p>
            Many inputs allow for range values (e.g., "3% - 5%") so that our Monte Carlo simulation can run hundreds of iterations to quantify volatility. Adjust these parameters to align with your financial strategy and assumptions.
          </p>
          <p>
            For further details or to review the underlying code, please visit our{" "}
            <a
              href="https://github.com/your-repo"
              target="_blank"
              rel="noopener noreferrer"
              className="home__github-link"
            >
              GitHub repository
            </a>.
          </p>
          <p>
            <strong>Happy Simulating!</strong>
          </p>
        </section>
      </main>
    </div>
  );
};

export default FAQ;
