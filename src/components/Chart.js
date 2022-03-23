import React, {useEffect, useState, useRef, useCallback} from 'react';
import {useDebounce} from 'react-use';
import * as d3 from 'd3';
import {
  Pane
} from 'evergreen-ui';
import currency from 'currency.js';
import estimate from '../modules/estimate';
import config from '../config';
import './chart.less';

const init = (ref) => {
  const root = d3.select(ref);
  // root.select('svg').remove();
  const wrapper = root.node().getBoundingClientRect();

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

  svg.append("g")
    .attr("transform", `translate(0, ${height})`)
    .attr("class", "x-axis");

  svg.append("g")
    .attr('class', 'y-axis');

  // add X axis and Y axis
  const x = d3.scaleLinear().range([0, width]);
  const y = d3.scaleLinear().range([height, 0]);

  const xAxis = d3
    .axisBottom(x)
    .tickSize(-height)
    .ticks(5)
    .tickFormat(d => d ? Math.ceil(d / 12) + 'y' : '');

  const yAxis = d3
    .axisLeft(y)
    .tickSize(-width)
    .tickFormat(d => currency(d, {precision: 0}).format());

  return [svg, x, y, xAxis, yAxis];
}

const update = (svg, x, y, xAxis, yAxis, data) => {
  const {min, max} = data.reduce(({min, max}, d) => ({
    min: Math.min(min, d.buy, d.rent),
    max: Math.max(max, d.buy, d.rent)
  }), {min: +Infinity, max: -Infinity});

  x.domain([0, 25 * 12]); // months
  y.domain([min, max]); // $

  svg.selectAll(".x-axis")
    .transition()
    .duration(config.graph.animation)
    .call(xAxis);
  svg.selectAll(".y-axis")
    .transition()
    .duration(config.graph.animation)
    .call(yAxis);

  const buy = svg.selectAll(".buy-line")
    .data([data], d => d.buy);
  const rent = svg.selectAll(".rent-line")
    .data([data], d => d.rent);

  buy
    .enter()
    .append("path")
    .attr("class", "buy-line")
    .merge(buy)
    .transition()
    .duration(config.graph.animation)
    .attr("d", d3.line()
      .x((d, i) => x(i))
      .y(d => y(d.buy))
    )
      .attr("fill", "none")
      .attr("stroke", "#2952CC")
      .attr("stroke-width", 1);

    rent
      .enter()
      .append("path")
      .attr("class", "rent-line")
      .merge(rent)
      .transition()
      .duration(config.graph.animation)
      .attr("d", d3.line()
        .x((d, i) => x(i))
        .y(d => y(d.rent))
      )
        .attr("fill", "none")
        .attr("stroke", "#A73636")
        .attr("stroke-width", 1);
}

export default function Chart({form}) {
  const el = useRef(null);
  const [graph, setGraph] = useState(null);

  useEffect(() => {
    console.log('init');
    setGraph(init(el.current));
  }, []);

  useDebounce(() => {
    console.log('update');
    update(...graph, estimate(form));
  }, 500, [form]);

  return (
    <Pane ref={el} padding={16} id="chart" />
  );
}
