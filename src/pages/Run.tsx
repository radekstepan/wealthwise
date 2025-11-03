import React, { useEffect, useState } from "react";
import { useAtom, useSetAtom } from "jotai";
import Form from "../components/form/Form";
import Chart from "../components/chart/Chart";
import Table from "../components/table/Table";
import Dist from "../components/dist/Dist.jsx";
import CarryingCostChart from "../components/carrying-costs/CarryingCostChart";
import CarryingCostTable from "../components/carrying-costs/CarryingCostTable";
import { carryingCostTabAtom } from "../atoms/carryingCostTabAtom";
import { carryingCostAtom, carryingCostLoadingAtom } from "../atoms/carryingCostAtom";
import "./run.less";

const Run: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'results' | 'carrying'>('results');
  const [, setCarryingTabActive] = useAtom(carryingCostTabAtom);
  const setCarryingCostSeries = useSetAtom(carryingCostAtom);
  const setCarryingCostLoading = useSetAtom(carryingCostLoadingAtom);

  useEffect(() => {
    document.title = "Buy vs rent net worth";
    setCarryingTabActive(false);
    setCarryingCostSeries([]);
    setCarryingCostLoading(false);

    return () => {
      setCarryingTabActive(false);
      setCarryingCostSeries([]);
      setCarryingCostLoading(false);
    };
  }, [setCarryingCostSeries, setCarryingTabActive, setCarryingCostLoading]);

  const handleTabChange = (tab: 'results' | 'carrying') => {
    setActiveTab(tab);
    const isCarrying = tab === 'carrying';
    setCarryingTabActive(isCarrying);
    setCarryingCostSeries([]);
  };

  return (
    <div className="flex">
      <div className="sidebar">
        <Form />
      </div>
      <div className="main">
        <div className="fixed">
          <div className="run-header-row">
            <h2 className="h2 title">Buy vs rent net worth comparison</h2>
            <div className="run-tabs" role="tablist" aria-label="Simulation views">
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'results'}
                id="run-results-tab"
                aria-controls="run-results-panel"
                className={`run-tab${activeTab === 'results' ? ' is-active' : ''}`}
                onClick={() => handleTabChange('results')}
              >
                Your results
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'carrying'}
                id="run-carrying-tab"
                aria-controls="run-carrying-panel"
                className={`run-tab${activeTab === 'carrying' ? ' is-active' : ''}`}
                onClick={() => handleTabChange('carrying')}
              >
                Carrying costs
              </button>
            </div>
          </div>

          <div className="run-tab-panel">
            <div
              role="tabpanel"
              id="run-results-panel"
              aria-labelledby="run-results-tab"
              hidden={activeTab !== 'results'}
            >
              <Chart isActive={activeTab === 'results'} />
              <Dist />
              <Table />
            </div>
            <div
              role="tabpanel"
              id="run-carrying-panel"
              aria-labelledby="run-carrying-tab"
              hidden={activeTab !== 'carrying'}
            >
              <div className="tab-description">This view breaks down your monthly carrying costs, including mortgage, taxes, insurance, and other recurring expenses, compared to rent and equity changes over time.</div>
              <CarryingCostChart isActive={activeTab === 'carrying'} />
              <CarryingCostTable isActive={activeTab === 'carrying'} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Run;
