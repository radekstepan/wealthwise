import React, {useState} from 'react';
import {RiUserLine, RiSettings4Line} from 'react-icons/ri';
import Form from '../form/Form.jsx';
import Chart from '../chart/Chart.jsx';
// @ts-ignore
import inputs from '../../modules/inputs.yaml';
import './page.less';

export default function Page() {
  const [form, setForm] = useState(inputs);

  return (
    <div className="page">
      <div className="topbar">
        <div className="logo" />
        <div className="icons">
          <RiSettings4Line />
          <RiUserLine />
        </div>
      </div>
      <div className="flex">
        <div className="sidebar">
          <Form form={form} setForm={setForm} />
        </div>
        <div className="main">
          <div className="fixed">
            <h2 className="h2 title">Buy vs rent net worth comparison</h2>
            <Chart form={form} />
          </div>
        </div>
      </div>
    </div>
  );
}