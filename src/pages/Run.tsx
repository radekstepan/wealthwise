import React, { useEffect } from "react";
import Form from "../components/form/Form";
import Chart from "../components/chart/Chart";
import Table from "../components/table/Table";
import Dist from "../components/dist/Dist.jsx";

const Run: React.FC = () => {
  useEffect(() => {
    document.title = "Buy vs rent net worth";
  }, []);

  return (
    <div className="flex">
      <div className="sidebar">
        <Form />
      </div>
      <div className="main">
        <div className="fixed">
          <h2 className="h2 title">Buy vs rent net worth comparison</h2>
          <Chart />
          <Dist />
          <Table />
        </div>
      </div>
    </div>
  );
};

export default Run;
