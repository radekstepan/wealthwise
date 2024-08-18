import React from 'react';
import {RiUserLine, RiSettings4Line} from 'react-icons/ri';
import Form from '../form/Form';
import Chart from '../chart/Chart';
import Table from '../table/Table';
import Dist from '../dist/Dist.jsx';
import './page.less';

function Page() {
  return (
    <div className="page">
      <div className="topbar">
        <div className="logo">wealthwise</div>
        <div className="icons">
          <RiSettings4Line />
          <RiUserLine />
        </div>
      </div>
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
    </div>
  );
}

export default Page;
