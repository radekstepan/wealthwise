import React from 'react';
import {
  Pane,
  TextInputField,
} from 'evergreen-ui';
import './form.less';

export default function Form({form, setForm}) {
  return (
    <>
      <Pane className="field">
        <TextInputField
          label="Price"
          placeholder="Property price"
          value={form.price}
          onChange={e => setForm(d => ({
            ...d,
            price: Number(e.target.value)
          }))}
        />
      </Pane>
      <Pane className="field">
        <TextInputField
          label="Property appreciation"
          description="% yearly"
          value={form.rates.appreciation}
          onChange={e => setForm(d => ({
            ...d,
            rates: {
              ...d.rates,
              appreciation: Number(e.target.value)
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
            downpayment: Number(e.target.value)
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
              interest: Number(e.target.value)
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
            years: Number(e.target.value)
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
            maintenance: Number(e.target.value)
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
            taxes: Number(e.target.value)
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
            insurance: Number(e.target.value)
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
              expenses: Number(e.target.value)
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
            rent: Number(e.target.value)
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
              rent: Number(e.target.value)
            }
          }))}
        />
      </Pane>
      <Pane>
        <TextInputField
          label="Market rent increases"
          description="% yearly"
          value={form.rates.marketRent}
          onChange={e => setForm(d => ({
            ...d,
            rates: {
              ...d.rates,
              marketRent: Number(e.target.value)
            }
          }))}
        />
      </Pane>
      <Pane>
        <TextInputField
          label="Investment return"
          description="% yearly"
          value={form.rates.market}
          onChange={e => setForm(d => ({
            ...d,
            rates: {
              ...d.rates,
              market: Number(e.target.value)
            }
          }))}
        />
      </Pane>
    </>
  );
}