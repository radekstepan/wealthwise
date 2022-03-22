import React from 'react';
import {
  Pane,
  TextInputField,
} from 'evergreen-ui';

export default function Form() {
  return (
    <>
      <Pane>
        <TextInputField
          label="Price"
          placeholder="Property price"
          defaultValue={500000}
        />
      </Pane>
      <Pane>
        <TextInputField
          label="Downpayment"
          placeholder="%"
          defaultValue="20%"
        />
      </Pane>
      <Pane>
        <TextInputField
          label="Interest Rate"
          placeholder="%"
          description="yearly mortgage interest rate"
          defaultValue="3.5%"
        />
      </Pane>
      <Pane>
        <TextInputField
          label="Mortgage Term"
          description="years"
          defaultValue="25"
        />
      </Pane>
      <Pane>
        <TextInputField
          label="Maintenance"
          description="monthly maintenance/strata fees"
          defaultValue="400"
        />
      </Pane>
      <Pane>
        <TextInputField
          label="Property Taxes"
          description="monthly"
          defaultValue="200"
        />
      </Pane>
      <Pane>
        <TextInputField
          label="Homeowner's Insurance"
          description="monthly"
          defaultValue="200"
        />
      </Pane>
      <Pane>
        <TextInputField
          label="Rent"
          description="monthly"
          defaultValue="2000"
        />
      </Pane>
    </>
  );
}