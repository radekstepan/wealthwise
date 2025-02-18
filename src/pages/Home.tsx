import React, { useEffect } from "react";
import Link from "../components/link/Link";
import { AppRoute } from "../routes";

const Home: React.FC = () => {
  useEffect(() => {
    document.title = "Wealthwise";
  }, []);

  return (
    <div className="home">
      <header className="home__header">
        <h1>Buy or Rent? Let This Free Monte Carlo Simulator Guide You</h1>
        <p><strong>Finally, a simple, no-nonsense way to see if buying a home really beats renting—backed by thousands of Monte Carlo simulations. All in your browser. All open source.</strong></p>

        <div className="home__cta">
          <Link routeName={AppRoute.run} className="button">Launch the Simulator</Link>
        </div>

        {/**<hr />*/}
      </header>

      <main className="home__main">
        <section>
          <h2>Why This Matters</h2>
          <p>Most buy-vs-rent calculators ignore the uncertainty of real life. Where are house prices heading? How high will rates go? Instead of guessing, this tool runs hundreds of simulations to explore all the possibilities—best, worst, and everything in between.</p>
          <p>It’s like rolling the dice on your own future, without risking a cent.</p>
        </section>

        <section>
          <h2>Made for Finance Nerds</h2>
          <p>You’re comfortable with terms like “capital gains tax rate” and “standard deviation.” You might be a longtime listener of Rational Reminder, or you geek out over sites like Portfolio Visualizer. <strong>This tool is for you.</strong></p>
        </section>

        <section>
          <h2>Key Features</h2>
          <ul>
            <li><strong>No Sign-Up Required:</strong> Everything runs locally in your browser.</li>
            <li><strong>Built-In Uncertainty:</strong> Specify <em>ranges</em> for interest rates, house appreciation, and more. We’ll simulate it.</li>
            <li><strong>Monte Carlo Analysis:</strong> We run 1,000+ random iterations to show potential 5th, 50th, and 95th percentile outcomes.</li>
            <li><strong>Detailed Results:</strong> View a summary table <em>and</em> download an Excel spreadsheet with every year’s data.</li>
            <li><strong>Open Source:</strong> Review the code on GitHub. Tinker, trust, or fork to your heart’s content.</li>
          </ul>
        </section>

        <section>
          <h2>How It Works</h2>
          <ol>
            <li><strong>Enter Your Numbers:</strong> Home price, down payment, mortgage term, annual rent increases—whatever you’d like to model.</li>
            <li><strong>Add Ranges (Optional):</strong> Not sure where interest rates are going? Input a range. We handle the uncertainty.</li>
            <li><strong>Run the Simulation:</strong> We project each year of ownership or renting, factoring in mortgage paydown, crashes, rent hikes, and more.</li>
            <li><strong>See Your Chances:</strong> You’ll get a chart with the plausible outcomes for each scenario—<strong>worst-case</strong>, <strong>typical</strong>, and <strong>best-case</strong>.</li>
            <li><strong>Dig Deeper:</strong> Download a year-by-year report for deeper analysis.</li>
          </ol>
        </section>

        <section>
          <h2>100% In-Browser</h2>
          <p>Concerned about privacy? Don’t be. All calculations happen locally, in your web browser. There’s <strong>no backend</strong>, no hidden servers, and no uploading of personal data.</p>
        </section>

        <section>
          <h2>Built by a Nerd, for Nerds</h2>
          <p>This started as a personal side project—just the kind of thing a data wonk would do for fun. If the community wants more improvements, I’ll keep going. Otherwise, enjoy it as-is, free of charge.</p>
        </section>

        <section>
          <h2>Check Out the Code</h2>
          <p>We believe in transparency. <a href="#" className="home__github-link">View our GitHub repo</a> to see how it all works under the hood. Fork it, hack it, or just read through the Monte Carlo logic yourself.</p>
        </section>

        <section>
          <h2>Ready to Try?</h2>
          <ol>
            <li><strong>Open the App</strong></li>
            <li><strong>Tweak Some Inputs</strong></li>
            <li><strong>Click “Simulate”</strong></li>
          </ol>
          <p>Grab your results, exhale, and walk away with a clearer vision of what <em>might</em> happen if you buy or keep renting. No sign-up. No gotchas. Just the data.</p>
        </section>

        <blockquote>
          <p><strong>Disclaimer</strong>: This simulator is not financial advice. It’s a tool to help you explore outcomes under different assumptions. Always consider consulting a qualified professional for advice specific to your situation.</p>
        </blockquote>

        <p><strong>Happy Simulating—and May the Best Scenario Win!</strong></p>
      </main>
    </div>
  )
};

export default Home;
