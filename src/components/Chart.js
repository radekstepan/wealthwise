import React, {useEffect, useRef} from 'react';
import * as d3 from 'd3';
import {
  Pane
} from 'evergreen-ui';
import currency from 'currency.js';
import estimate from '../modules/estimate';
import './chart.less';

const graph = async (ref, form) => {
  const root = d3.select(ref);
  root.select('svg').remove();
  const wrapper = root.node().getBoundingClientRect();

  const data = estimate(form);

  // set the dimensions and margins of the graph
  var margin = {top: 20, right: 20, bottom: 50, left: 70 };
  const width = wrapper.width - margin.left - margin.right;
  const height = 500 - margin.top - margin.bottom;

  // append the svg object to the body of the page
  const svg = root.append('svg');

  svg
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // add X axis and Y axis
  var x = d3.scaleLinear().range([0, width]);
  var y = d3.scaleLinear().range([height, 0]);

  const {min, max} = data.reduce(({min, max}, d) => ({
    min: Math.min(min, d.buy, d.rent),
    max: Math.max(max, d.buy, d.rent)
  }), {min: +Infinity, max: -Infinity});

  x.domain([0, 25 * 12]); // months
  y.domain([min, max]); // $

  svg.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3
      .axisBottom(x)
      .tickSize(-height)
      .ticks(form.years / 5)
      .tickFormat(d => d ? Math.ceil(d / 12) + 'y' : '')
    );

  svg.append("g")
    .call(d3
      .axisLeft(y)
      .tickSize(-width)
      .tickFormat(d => currency(d, {precision: 0}).format())
    );
    
  const buy = d3.line()
    .x((d, i) => x(i))
    .y(d => y(d.buy));
  const rent = d3.line()
    .x((d, i) => x(i))
    .y(d => y(d.rent));

  svg.append("path")
    .data([data])
    .attr("class", "line")
    .attr("fill", "none")
    .attr("stroke", "#2952CC")
    .attr("stroke-width", 1)
    .attr("d", buy);

  svg.append("path")
    .data([data])
    .attr("class", "line")
    .attr("fill", "none")
    .attr("stroke", "#A73636")
    .attr("stroke-width", 1)
    .attr("d", rent);
}

export default function Chart({form}) {
  const el = useRef(null);

  useEffect(() => {
    if (el.current) {
      graph(el.current, form);
    }
  }, [el.current, form]);

  return (
    <Pane ref={el} padding={16} id="chart" />
  );
}
