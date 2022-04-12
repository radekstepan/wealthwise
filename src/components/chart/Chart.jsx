import React, {useEffect, useState, useRef} from 'react';
import {useDebounce} from 'react-use';
import * as d3 from 'd3';
import currency from 'currency.js';
import simulate from '../../modules/simulate';
import './chart.less';

const curr = d => currency(d, {precision: 0}).format();
const perc = d => (d * 100).toFixed(0) + '%';

const init = (ref, setPointer) => {
  const root = d3.select(ref);
  const wrapper = root.node().getBoundingClientRect();

  // set the dimensions and margins of the graph
  var margin = {top: 20, right: 0, bottom: 50, left: 30 };
  const width = wrapper.width - margin.left - margin.right;
  const height = 500 - margin.top - margin.bottom;

  // append the svg object to the body of the page
  const svg = root.append('svg');

  svg
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .on('mousemove', evt => {
      const [x] = d3.pointer(evt, svg.node());
      setPointer(x > 0 && x < width ? x / width : 1);
    })
    .on('mouseleave', () => {
      setPointer(1);
    })
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  svg.append("g")
    .attr("transform", `translate(0, ${height})`)
    .attr("class", "x-axis");

  svg.append("g")
    .attr('class', 'y0-axis');

  svg.append("g")
    .attr('class', 'y1-axis');

  // add X axis and Y axis
  const x = d3.scaleLinear().range([0, width]);
  const y0 = d3.scaleLinear().range([height, 0]);
  const y1 = d3.scaleLinear().range([height, 0]);

  const xAxis = d3
    .axisBottom(x)
    .ticks(5)
    .tickFormat(d => d ? Math.ceil(d / 12) + 'y' : '');

  const y0Axis = d3
    .axisLeft(y0)
    .tickFormat(curr);

  const y1Axis = d3
    .axisLeft(y1)
    .ticks(5)
    .tickFormat(perc);

  return [svg, x, xAxis, y0, y0Axis, y1, y1Axis];
}

const update = (svg, x, xAxis, y0, y0Axis, y1, y1Axis, data) => {
  const [low, median, high] = data;

  const [min$, minP] = low.reduce((min, d) => [
    Math.min(min[0], d.buy, d.rent),
    Math.min(min[1], d.afford)
  ], [+Infinity, +Infinity]);

  const [max$, maxP] = high.reduce((max, d) => [
    Math.max(max[0], d.buy, d.rent),
    Math.max(max[1], d.afford)
  ], [-Infinity, -Infinity]);

  // TODO does not link to number of years
  x.domain([0, 25 * 12]); // months
  y0.domain([min$, max$]); // $ net worth
  y1.domain([minP, maxP]); // % affordability

  svg.selectAll(".x-axis")
    .transition()
    .duration(500)
    .call(xAxis);
  svg.selectAll(".y0-axis")
    .transition()
    .duration(500)
    .call(y0Axis);
  svg.selectAll(".y1-axis")
    .attr("transform", `translate(${parseInt(svg.attr('width')) + 5}, 0)`)
    .transition()
    .duration(500)
    .call(y1Axis);

  for (const i in data) {
    const q = data[i];

    const buy = svg.selectAll(`.buy-line.q${i}`)
      .data([q], d => d.buy);
    const rent = svg.selectAll(`.rent-line.q${i}`)
      .data([q], d => d.rent);
    const afford = svg.selectAll(`.afford-line.q${i}`)
      .data([q], d => d.afford);

    buy
      .enter()
      .append("path")
      .attr("class", `buy-line q${i}`)
      .merge(buy)
      .transition()
      .duration(500)
      .attr("d", d3.line()
        .x((d, i) => x(i))
        .y(d => y0(d.buy))
      );

    rent
      .enter()
      .append("path")
      .attr("class", `rent-line q${i}`)
      .merge(rent)
      .transition()
      .duration(500)
      .attr("d", d3.line()
        .x((d, i) => x(i))
        .y(d => y0(d.rent))
      );

    afford
      .enter()
      .append("path")
      .attr("class", `afford-line q${i}`)
      .merge(afford)
      .transition()
      .duration(500)
      .attr("d", d3.line()
        .x((d, i) => x(i))
        .y(d => y1(d.afford))
      );
  }
}

const legend = (point) => point.map(([key, val]) => (
  <div key={key} className={`row ${key}`}>
    <span className="square" />
    <span className="value">{key === 'afford' ? perc(val) : curr(val)}</span>
    <span className="label">{key}</span>
  </div>
));

export default function Chart({form}) {
  const el = useRef(null);
  const [graph, setGraph] = useState(null);
  const [data, setData] = useState(null);
  const [pointer, setPointer] = useState(1);
  const [point, setPoint] = useState(null);

  useEffect(() => {
    console.log('init');
    setGraph(init(el.current, setPointer));
  }, []);

  useDebounce(async () => {
    console.log('estimate');
    setData(await simulate(form));
  }, 0, [form]); // not needed, onBlur used on input

  useEffect(() => {
    if (data) {
      console.log('update');
      update(...graph, data);
    }
  }, [data]);

  useEffect(() => {
    if (data) {
      const [low, median, high] = data;
      const {
        buy,
        rent,
        afford
      } = median[Math.max(0, Math.floor(median.length * pointer) - 1)];
      setPoint(buy > rent ?
        [['buy', buy], ['rent', rent], ['afford', afford]] :
        [['rent', rent], ['buy', buy], ['afford', afford]]);
    }
  }, [data, pointer]);

  return (
    <div className="chart">
      {point && (
        <div className={`legend ${pointer < 0.5 ? 'right' : 'left'}`}>
          {legend(point)}
        </div>
      )}
      <div ref={el} className="svg" />
    </div>
  );
}
