import React, {useState} from 'react';
import {
  Button,
  Pane,
  Heading,
} from 'evergreen-ui';
import Form from './Form';
import Chart from './Chart';
import config from '../config';

export default function Page() {
  const [form, setForm] = useState(config.form);

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