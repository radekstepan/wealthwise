import React, {useEffect, useState, useRef} from 'react';
import {useDebounce} from 'react-use';
import * as d3 from 'd3';
import {
  Pane, Card, Text
} from 'evergreen-ui';
import currency from 'currency.js';
import {Flipper, Flipped} from 'react-flip-toolkit'
import estimate from '../../modules/estimate';
import './chart.less';

const curr = d => currency(d, {precision: 0}).format();

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
    .tickFormat(curr);

  return [svg, x, y, xAxis, yAxis];
}

const update = (svg, x, y, xAxis, yAxis, data) => {
  const [low, median, high] = data;

  const min = low.reduce((min, d) => 
    Math.min(min, d.buy, d.rent)
  , +Infinity);

  const max = high.reduce((max, d) => 
    Math.max(max, d.buy, d.rent)
  , -Infinity);

  // TODO does not link to number of years
  x.domain([0, 25 * 12]); // months
  y.domain([min, max]); // $

  svg.selectAll(".x-axis")
    .transition()
    .duration(500)
    .call(xAxis);
  svg.selectAll(".y-axis")
    .transition()
    .duration(500)
    .call(yAxis);

  for (const i in data) {
    const q = data[i];

    const buy = svg.selectAll(`.buy-line.q${i}`)
      .data([q], d => d.buy);
    const rent = svg.selectAll(`.rent-line.q${i}`)
      .data([q], d => d.rent);

    buy
      .enter()
      .append("path")
      .attr("class", `buy-line q${i}`)
      .merge(buy)
      .transition()
      .duration(500)
      .attr("d", d3.line()
        .x((d, i) => x(i))
        .y(d => y(d.buy))
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
          .y(d => y(d.rent))
        );
  }
}

const legend = (point) => {
  return (
    <Text size={300}>
      <Flipper flipKey="legend" spring="veryGentle">
        {point.map(([key, val]) => (
          <Flipped key={key} flipId={key}>
            <div className={`row ${key}`}>
              <span className="square" />
              <span className="value">{curr(val)}</span>
              {key === 'buy' ? 'Buy' : 'Rent'}
            </div>
          </Flipped>          
        ))}
      </Flipper>
    </Text>
  );
}

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

  useDebounce(() => {
    console.log('estimate');
    setData(estimate(form));
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
      const {buy, rent} = median[Math.max(0, Math.floor(median.length * pointer) - 1)];
      setPoint(buy > rent ?
        [['buy', buy], ['rent', rent]] :
        [['rent', rent], ['buy', buy]]);
    }
  }, [data, pointer]);

  return (
    <Pane padding={16}>
      <div className="chart">
        {point && (
          <Card
            elevation={1}
            className={`legend ${pointer < 0.5 ? 'right' : 'left'}`}
            background="white"
            padding="16"
          >
            {legend(point)}
          </Card>
        )}
        <div ref={el} className="svg" />
      </div>
    </Pane>
  );
}
