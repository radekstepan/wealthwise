import React, { useEffect } from "react";
import Link from "../components/link/Link";
import { AppRoute } from "../routes";
import Chart from "../components/chart/Chart";

const Home: React.FC = () => {
  useEffect(() => {
    document.title = "Wealthwise";
  }, []);

  return (
    <div className="home">
      <header className="home__header">
        <div className="home__header-content">
          <div className="home__header-text">
            <h1>Buy or Rent? See Your Potential Future with Monte Carlo Simulation</h1>
            <p><strong>Stop guessing. This simulator runs thousands of scenarios based on your inputs and uncertainty ranges to show you the potential financial outcomes of buying vs. renting—from best-case to worst-case. All in your browser. All open source.</strong></p>
            <div className="home__cta">
              <Link routeName={AppRoute.run} className="button">Launch the Simulator</Link>
            </div>
          </div>

          <div className="home__header-chart">
            <div style={{ height: '200px', width: '100%' }}>
              <Chart isMini={true} />
            </div>
          </div>
        </div>
      </header>

      <main className="home__main">
        <section>
          <h2>Why Simulate? Uncertainty is Real.</h2>
          <p>Simple buy-vs-rent calculators give you one answer based on fixed assumptions. But what if interest rates rise? What if the market dips? This tool embraces uncertainty. By providing ranges for key variables, you get a realistic spectrum of possibilities, not just a single guess.</p>
          <p>See how your net worth could evolve under different market conditions with the <strong>5th, 50th (median), and 95th percentile</strong> outcomes visualized over time.</p>
        </section>

        <section>
          <h2>Made for Thoughtful Decision-Making</h2>
          <p>If you appreciate data-driven insights and understand concepts like investment returns, inflation, and risk, this tool is built for you. It provides the detail needed for a deeper analysis beyond basic calculators.</p>
        </section>

        <section>
          <h2>Key Features</h2>
          <ul>
            <li><strong>Monte Carlo Engine:</strong> Runs hundreds of simulations based on your inputs and specified ranges (uncertainty).</li>
            <li><strong>Percentile Chart:</strong> Visualizes the 5th, 50th, and 95th percentile net worth trajectories for buying and renting.</li>
            <li><strong>Distribution Insights:</strong> See a histogram showing the likelihood of different final net worth outcomes for the buyer.</li>
            <li><strong>Detailed Modeling:</strong> Accounts for mortgage dynamics, all major costs, inflation, taxes (on investments), moving scenarios, and market shocks.</li>
            <li><strong>Interactive Legend:</strong> Hover over the chart to see specific net worth values for any year.</li>
            <li><strong>Data Export:</strong> Download a detailed year-by-year spreadsheet for the median scenario.</li>
            <li><strong>Privacy First:</strong> All calculations happen securely in your browser.</li>
            <li><strong>Open Source:</strong> Trust through transparency. Check the code on GitHub.</li>
          </ul>
        </section>

        <section>
          <h2>How It Works</h2>
          <ol>
            <li><strong>Enter Your Scenario:</strong> Input property details, mortgage terms, rent, expected rates, and costs.</li>
            <li><strong>Define Uncertainty (Ranges):</strong> Where unsure, provide a range (e.g., "3% - 5%") for future rates or returns.</li>
            <li><strong>Run Simulation:</strong> The engine performs hundreds of calculations, varying inputs within your ranges.</li>
            <li><strong>Analyze Results:</strong> Study the percentile chart, distribution histogram, summary table, and download the detailed spreadsheet.</li>
          </ol>
        </section>

        <blockquote>
          <p><strong>Disclaimer</strong>: This simulator provides informational projections based on your inputs and assumptions. It is not financial advice. Consult a qualified professional for advice tailored to your specific situation.</p>
        </blockquote>
      </main>
    </div>
  )
};

export default Home;
