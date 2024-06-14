import React, {useEffect, useState, useRef} from 'react';
import {connect} from 'react-redux'
import * as d3 from 'd3';
import numbro from 'numbro';
import simulate from '../../modules/simulate';
import './chart.less';

// TODO link to actual years
const DOMAIN_X = [0, 24]; // years - 1 (inclusive)

export type ChartData = Array< // quantiles
  Array<ChartDataPoint> // years of data
>;

interface ChartDataPoint {
  buyer: number,
  renter: number
}

type Selection = d3.Selection<SVGSVGElement, unknown, null, undefined>;
type Scale = d3.ScaleLinear<number, number>;
type Axis = d3.Axis<d3.AxisDomain>;

type ChartInit = [
  Selection,
  Scale,
  Axis,
  Scale,
  Axis
];

const init = (ref, setPointer): ChartInit => {
  const root = d3.select(ref);
  const wrapper = root.node().getBoundingClientRect();

  // set the dimensions and margins of the graph
  var margin = {top: 0, right: 10, bottom: 20, left: 20 };
  const width = wrapper.width - margin.left - margin.right;
  const height = 500 - margin.top - margin.bottom;

  // append the svg object to the body of the page
  const svg: Selection = root.append('svg');

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
  const x: Scale = d3.scaleLinear().range([0, wrapper.width]);
  const y: Scale = d3.scaleLinear().range([height, 0]);

  const xAxis: Axis = d3
    .axisBottom(x)
    .tickFormat(d => d ? Math.ceil(d.valueOf()) + 1 + 'y' : 'Now');

  const yAxis: Axis = d3
    .axisLeft(y)
    .tickFormat(d => numbro(d).formatCurrency({
      average: true,
      mantissa: 0
    }));

  return [svg, x, xAxis, y, yAxis];
}

const update = (
  svg: Selection,
  x: Scale,
  xAxis: Axis,
  y: Scale,
  yAxis: Axis,
  data: ChartData
) => {
  const [low, _median, high] = data;

  const min$ = low.reduce((min, d) =>
    Math.min(min, d.buyer, d.renter)
  , +Infinity);

  const max$ = high.reduce((max, d) =>
    Math.max(max, d.buyer, d.renter)
  , -Infinity);

  x.domain(DOMAIN_X);
  y.domain([min$, max$]); // $ net worth

  svg.selectAll<any, string>(".x-axis")
    .transition()
    .duration(500)
    .call(xAxis)
  svg.selectAll<any, string>(".y-axis")
    .transition()
    .duration(500)
    .call(yAxis);

  for (const quantile in data) {
    const q = data[quantile];

    const buy = svg.selectAll<SVGPathElement, Array<ChartDataPoint>>(`.buy-line.q${quantile}`)
      .data([q]);
    const rent = svg.selectAll<SVGPathElement, Array<ChartDataPoint>>(`.rent-line.q${quantile}`)
      .data([q]);

    buy
      .enter()
      .append("path")
      .attr("class", `buy-line q${quantile}`)
      .merge(buy)
      .transition()
      .duration(500)
      .attr("d", d3.line<ChartDataPoint>()
        .x((_d, year) => x(year))
        .y(d => y(d.buyer)) // buyer index
      );

    rent
      .enter()
      .append("path")
      .attr("class", `rent-line q${quantile}`)
      .merge(rent)
      .transition()
      .duration(500)
      .attr("d", d3.line<ChartDataPoint>()
        .x((_d, year) => x(year))
        .y(d => y(d.renter)) // renter index
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
function Chart({data, form, setData, setMeta, setDist}: {
  data: ChartData,
  form: any,
  setData: (data: ChartData) => void,
  setMeta: (meta: any) => void,
  setDist: (dist: any) => void
}) {
  const el = useRef(null);
  const [graph, setGraph] = useState<ChartInit>(null);
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
    if (data && graph) {
      console.log('update');
      update(...graph, data);
    }
  }, [data]);

  useEffect(() => {
    if (data) {
      const [_low, median, _high] = data;
      const {
        buyer,
        renter,
      } = median[Math.max(0, Math.floor(median.length * pointer) - 1)];
      setPoint(buyer > renter ?
        [['buy', buyer], ['rent', renter]] :
        [['rent', renter], ['buy', buyer]]);
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
