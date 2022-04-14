import React, {useState} from 'react';
import Form from '../form/Form.jsx';
import Chart from '../chart/Chart.jsx';
// @ts-ignore
import inputs from '../../modules/inputs.yaml';
import './page.less';

export default function Page() {
  const [form, setForm] = useState(inputs);

  return (
    <div className="page">
      <div className="h1">Guesstimate Buy vs Rent</div>
      <div className="flex">
        <Form form={form} setForm={setForm} />
        <Chart form={form} />
      </div>
    </div>
  );
}