import React, {useEffect, useState, useRef} from 'react';
import {connect} from 'react-redux'
import * as d3 from 'd3';
import numbro from 'numbro';
import simulate from '../../modules/simulate';
import './chart.less';

// TODO link to actual years
const DOMAIN_X = [0, 24]; // years - 1 (inclusive)

const init = (ref, setPointer) => {
  const root = d3.select(ref);
  const wrapper = root.node().getBoundingClientRect();

  // set the dimensions and margins of the graph
  var margin = {top: 0, right: 10, bottom: 20, left: 20 };
  const width = wrapper.width - margin.left - margin.right;
  const height = 500 - margin.top - margin.bottom;

  // append the svg object to the body of the page
  const svg = root.append('svg');

  svg
    .attr("width", wrapper.width) // + margin.left + margin.right)
    .attr("height", height) // + margin.top + margin.bottom)
    .on('mousemove', evt => {
      const [x] = d3.pointer(evt, svg.node());
      setPointer(x > 0 && x < width ? x / width : 1);
    })
    .on('mouseleave', () => {
      setPointer(1);
    })
    // .attr("transform", `translate(${margin.left}, ${margin.top})`);

  svg.append("g")
    // Push to the bottom.
    .attr("transform", `translate(0, ${height})`)
    .attr("class", "x-axis");

  svg.append("g")
    // Push to the right.
    .attr("transform", `translate(${width + margin.left + margin.right + 50}, 0)`)
    .attr('class', 'y-axis');

  // add X axis and Y axis
  const x = d3.scaleLinear().range([0, wrapper.width]);
  const y = d3.scaleLinear().range([height, 0]);

  const xAxis = d3
    .axisBottom(x)
    .tickFormat(d => d ? Math.ceil(d) + 1 + 'y' : 'Now');

  const yAxis = d3
    .axisLeft(y)
    .tickFormat(d => numbro(d).formatCurrency({
      average: true,
      mantissa: 0
    }));

  return [svg, x, xAxis, y, yAxis];
}

const update = (svg, x, xAxis, y, yAxis, data) => {
  const [low, median, high] = data;

  const min$ = low.reduce((min, d) =>
    Math.min(min, d.buy, d.rent)
  , +Infinity);

  const max$ = high.reduce((max, d) =>
    Math.max(max, d.buy, d.rent)
  , -Infinity);

  x.domain(DOMAIN_X);
  y.domain([min$, max$]); // $ net worth

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
        .x((_d, i) => x(i))
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
        .x((_d, i) => x(i))
        .y(d => y(d.rent))
      );
  }
}

const legend = (point) => point.map(([key, val]) => (
  <div key={key} className={`row ${key}`}>
    <span className="square" />
    <span className="value">
      {numbro(val).formatCurrency({
        thousandSeparated: true,
        mantissa: 0
      })}
    </span>
    <span className="label">{key}</span>
  </div>
));


// The chart is intended to visualize the net worth of a person
//  over time, given different scenarios such as buying or
//  renting a home.
function Chart({data, form, setData, setMeta, setDist}) {
  const el = useRef(null);
  const [graph, setGraph] = useState(null);
  const [pointer, setPointer] = useState(1);
  const [point, setPoint] = useState(null);

  useEffect(() => {
    console.log('init');
    setGraph(init(el.current, setPointer));
  }, []);

  useEffect(() => {
    console.log('estimate');
    simulate(form, setMeta, setDist, setData);
  }, [form]);

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
        // afford
      } = median[Math.max(0, Math.floor(median.length * pointer) - 1)];
      setPoint(buy > rent ?
        [['buy', buy], ['rent', rent], /**['afford', afford]*/] :
        [['rent', rent], ['buy', buy], /**['afford', afford]*/]);
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

const mapState = (state) => ({
	form: state.form,
  data: state.data
})

const mapDispatch = (dispatch) => ({
  setData: dispatch.data.setData,
	setMeta: dispatch.meta.setMeta,
  setDist: dispatch.meta.setDist
})

export default connect(mapState, mapDispatch)(Chart);
