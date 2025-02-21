import React, { useEffect } from "react";

const FAQ: React.FC = () => {
  useEffect(() => {
    document.title = "Wealthwise FAQ";
  }, []);

  return (
    <div className="home">
      <header className="home__header">
        <h1>Buy vs Rent Simulator: FAQ</h1>
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
            Net worth is calculated as the sum of your property and portfolio values. For renters, they start with a large portfolio which equals that of buyer's downpayment and purchase cost. In the buyer scenario, if rent exceeds expenses, the surplus is funneled into a portfolio as imputed rent savings.
          </p>
        </section>

        {/* Property Settings */}
        <section id="property">
          <h2>Property Settings</h2>
          <p>Parameters related to the property under consideration.</p>
          <div>
            <h3>Price</h3>
            <p>
              The listing price of the property.
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
              The jurisdiction where the property is located. Land transfer taxes vary by province.
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
              The percentage of the purchase price paid upfront.
            </p>
          </div>
          <div>
            <h3>Current Interest Rate</h3>
            <p>
              The prevailing mortgage rate.
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
              The expected annual percentage increase in the current rental payment, often subject to regulatory limits (rent control).
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
              The effective tax rate on gains from investment sales, reducing net returns. Property taxes are not considered in this simulation (owner occupier).
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
              The percentage by which property values may decline if a market correction occurs.
            </p>
          </div>
          <div>
            <h3>Move Every N Years</h3>
            <p>
              How often you expect to move or upgrade your property. This factors in transaction costs like realtor fees, legal fees, and land transfer taxes which can significantly impact long-term wealth accumulation.
            </p>
          </div>
          <div>
            <h3>Anniversary Principal Paydown</h3>
            <p>
              The percentage of your original mortgage balance you plan to pay down each year through lump sum payments. This accelerates mortgage repayment and reduces interest costs.
            </p>
          </div>
        </section>

        {/* Advanced Concepts */}
        <section id="advanced">
          <h2>Advanced Concepts</h2>
          <p>
            Understanding how the simulation handles complex scenarios.
          </p>
          <div>
            <h3>Monte Carlo Method</h3>
            <p>
              The simulator runs hundreds of iterations with random variations in key parameters (within your specified ranges). This produces a distribution of possible outcomes, helping you understand both the potential and risks of your decision.
            </p>
          </div>
          <div>
            <h3>Percentile Bands</h3>
            <p>
              The chart shows three key percentile bands (5th, 50th, and 95th). The middle band (50th) represents the median outcome, while the outer bands show potential upside (95th) and downside (5th) scenarios. This helps visualize the range of possible outcomes.
            </p>
          </div>
          <div>
            <h3>Net Worth Calculation</h3>
            <p>
              Net worth is calculated as: Property Value + Portfolio Value - Mortgage Balance. For renters, it's simply their Portfolio Value. The simulation accounts for:
            </p>
            <ul>
              <li>Property appreciation/depreciation</li>
              <li>Mortgage principal reduction</li>
              <li>Investment returns on saved money</li>
              <li>Transaction costs when moving</li>
              <li>Tax implications of property sales</li>
            </ul>
          </div>
          <div>
            <h3>Imputed Rent</h3>
            <p>
              Even homeowners "pay rent" to themselves (imputed rent). This cost is considered in the simulation to accurately compare scenarios.
            </p>
          </div>
        </section>

        {/* Tips */}
        <section id="tips">
          <h2>Tips for Using the Simulator</h2>
          <p>
            Get the most out of your simulation analysis.
          </p>
          <div>
            <h3>Use Realistic Ranges</h3>
            <p>
              When setting ranges (e.g., for future interest rates or property appreciation), use wider ranges to account for uncertainty over longer time horizons. Historical data can help inform these ranges.
            </p>
          </div>
          <div>
            <h3>Consider Multiple Scenarios</h3>
            <p>
              Run several simulations with different assumptions. For example, compare scenarios with:
            </p>
            <ul>
              <li>Different downpayment amounts</li>
              <li>Various property appreciation rates</li>
              <li>Different moving frequencies</li>
              <li>Conservative vs. optimistic market conditions</li>
            </ul>
          </div>
          <div>
            <h3>Interpreting Results</h3>
            <p>
              Focus on the range of outcomes rather than just the median. Consider your risk tolerance when evaluating the spread between the 5th and 95th percentiles. A wider spread indicates more uncertainty in the outcomes.
            </p>
          </div>
          <div>
            <h3>Download Detailed Results</h3>
            <p>
              Use the spreadsheet download feature to analyze year-by-year projections. This can help identify key milestones like when a buying scenario might overtake renting, or the impact of moving costs over time.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default FAQ;
