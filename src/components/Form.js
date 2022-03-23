import React from 'react';
import {
  Pane,
  TextInputField,
} from 'evergreen-ui';

export default function Form({form, setForm}) {
  return (
    <>
      <Pane>
        <TextInputField
          label="Price"
          placeholder="Property price"
          value={form.price}
          onChange={e => setForm(d => ({
            ...d,
            price: e.target.value
          }))}
        />
      </Pane>
      <Pane>
        <TextInputField
          label="Property appreciation"
          description="% yearly"
          value={form.rates.appreciation}
          onChange={e => setForm(d => ({
            ...d,
            rates: {
              ...d.rates,
              appreciation: e.target.value
            }
          }))}
        />
      </Pane>
      <Pane>
        <TextInputField
          label="Downpayment"
          description="% of the purchase price"
          value={form.downpayment}
          onChange={e => setForm(d => ({
            ...d,
            downpayment: e.target.value
          }))}
        />
      </Pane>
      <Pane>
        <TextInputField
          label="Interest Rate"
          description="yearly mortgage interest rate"
          value={form.rates.interest}
          onChange={e => setForm(d => ({
            ...d,
            rates: {
              ...d.rates,
              interest: e.target.value
            }
          }))}
        />
      </Pane>
      <Pane>
        <TextInputField
          label="Mortgage Term"
          description="years"
          value={form.years}
          onChange={e => setForm(d => ({
            ...d,
            years: e.target.value
          }))}
        />
      </Pane>
      <Pane>
        <TextInputField
          label="Maintenance"
          description="monthly maintenance/strata fees"
          value={form.maintenance}
          onChange={e => setForm(d => ({
            ...d,
            maintenance: e.target.value
          }))}
        />
      </Pane>
      <Pane>
        <TextInputField
          label="Property Taxes"
          description="monthly"
          value={form.taxes}
          onChange={e => setForm(d => ({
            ...d,
            taxes: e.target.value
          }))}
        />
      </Pane>
      <Pane>
        <TextInputField
          label="Homeowner's Insurance"
          description="monthly"
          value={form.insurance}
          onChange={e => setForm(d => ({
            ...d,
            insurance: e.target.value
          }))}
        />
      </Pane>
      <Pane>
        <TextInputField
          label="Expenses increases"
          description="% yearly maintenance, taxes and insurance"
          value={form.rates.expenses}
          onChange={e => setForm(d => ({
            ...d,
            rates: {
              ...d.rates,
              expenses: e.target.value
            }
          }))}
        />
      </Pane>
      <Pane>
        <TextInputField
          label="Rent"
          description="monthly"
          value={form.rent}
          onChange={e => setForm(d => ({
            ...d,
            rent: e.target.value
          }))}
        />
      </Pane>
      <Pane>
        <TextInputField
          label="Rent increases"
          description="% yearly"
          value={form.rates.rent}
          onChange={e => setForm(d => ({
            ...d,
            rates: {
              ...d.rates,
              rent: e.target.value
            }
          }))}
        />
      </Pane>
      <Pane>
        <TextInputField
          label="Investment return"
          description="% yearly"
          value={form.rates.market0}
          onChange={e => setForm(d => ({
            ...d,
            rates: {
              ...d.rates,
              market: e.target.value
            }
          }))}
        />
      </Pane>
    </>
  );
}