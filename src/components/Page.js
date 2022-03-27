import React, {useState} from 'react';
import {
  Button,
  Pane,
  Heading,
} from 'evergreen-ui';
import Form from './form/Form';
import Chart from './chart/Chart';
import vars from '../modules/variables';

export default function Page() {
  const [form, setForm] = useState(vars);

  return (
    <Pane padding={16}>
      <Pane display="flex">
        <Pane flex={1} alignItems="center" display="flex">
          <Heading size={600}>Buy vs Rent Guesstimate Net Worth</Heading>
        </Pane>
        <Pane>
          <Button marginRight={16}>Reset</Button>
          <Button appearance="primary">Run</Button>
        </Pane>
      </Pane>
      <Pane display="flex">
        <Pane display="flex" flexDirection="column">
          <Form form={form} setForm={setForm} />
        </Pane>
        <Pane flex={1}>
          <Chart form={form} />
        </Pane>
      </Pane>
    </Pane>
  );
}