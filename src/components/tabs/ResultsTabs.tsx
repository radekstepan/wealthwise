import React, { useState } from 'react';
import Chart from '../chart/Chart';
import KeyFactors from '../keyfactors/KeyFactors';
import Dist from '../dist/Dist';
import './results-tabs.less';

const TABS = [
  {
    id: 'trajectory',
    label: 'Net worth over time',
    description: 'Compare buyer vs renter outcomes across years.',
  },
  {
    id: 'distribution',
    label: 'Distribution',
    description: 'View the full spread of simulated outcomes.',
  },
  {
    id: 'drivers',
    label: 'Key factors',
    description: 'See which assumptions actually move your result.',
  },
] as const;

type TabId = (typeof TABS)[number]['id'];

const ResultsTabs: React.FC = () => {
  const [active, setActive] = useState<TabId>('trajectory');

  return (
    <section className="results-tabs" aria-label="Simulation results">
      <div className="results-tabs__list" role="tablist">
        {TABS.map(tab => (
          <button
            key={tab.id}
            role="tab"
            className={
              'results-tabs__tab' + (active === tab.id ? ' results-tabs__tab--active' : '')
            }
            aria-selected={active === tab.id}
            onClick={() => setActive(tab.id)}
            type="button"
          >
            <span className="results-tabs__tab-label">
              {tab.label}
              {tab.id === 'drivers' && (
                <span className="results-tabs__preview-pill" aria-label="Preview">
                  Preview
                </span>
              )}
            </span>
            <span className="results-tabs__tab-sub">{tab.description}</span>
          </button>
        ))}
      </div>

      <div className="results-tabs__body">
        <div
          className={
            'results-tabs__panel' + (active === 'trajectory' ? ' results-tabs__panel--active' : ' results-tabs__panel--hidden')
          }
          role="tabpanel"
        >
          <Chart />
        </div>
        <div
          className={
            'results-tabs__panel' + (active === 'drivers' ? ' results-tabs__panel--active' : ' results-tabs__panel--hidden')
          }
          role="tabpanel"
        >
          <KeyFactors isActive={active === 'drivers'} />
        </div>
        <div
          className={
            'results-tabs__panel' + (active === 'distribution' ? ' results-tabs__panel--active' : ' results-tabs__panel--hidden')
          }
          role="tabpanel"
        >
          <Dist />
        </div>
      </div>
    </section>
  );
};

export default ResultsTabs;
