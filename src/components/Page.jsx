import React, {useState} from 'react';
import Form from './form/Form.jsx';
import Chart from './chart/Chart.jsx';
// @ts-ignore
import inputs from '../modules/inputs.yaml';

export default function Page() {
  const [form, setForm] = useState(inputs);

  return (
    <>
      <div className="header">Guesstimate Buy vs Rent</div>
      <Chart form={form} />
      <Form form={form} setForm={setForm} />
    </>
  );
}