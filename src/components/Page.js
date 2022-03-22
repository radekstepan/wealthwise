import React from 'react';
import {
  Button,
  Pane,
  Heading,
} from 'evergreen-ui';
import Form from './Form';
import Chart from './Chart';

export default function Page() {
  return (
    <Pane padding={16}>
      <Pane display="flex">
        <Pane flex={1} alignItems="center" display="flex">
          <Heading size={600}>Guesstimate</Heading>
        </Pane>
        <Pane>
          <Button marginRight={16}>Reset</Button>
          <Button appearance="primary">Run</Button>
        </Pane>
      </Pane>
      <Pane display="flex">
        <Pane display="flex" flexDirection="column">
          <Form />
        </Pane>
        <Pane flex={1}>
          <Chart />
        </Pane>
      </Pane>
    </Pane>
  );
}