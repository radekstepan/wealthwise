import React, {useEffect, useState, useRef, type MutableRefObject} from 'react';
import * as d3 from 'd3';
import numbro from 'numbro';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import simulate, { type DataPoint } from '../../modules/simulate';
import { type Buyer, type Renter } from '../../modules/run';
import { metaAtom } from '../../atoms/metaAtom';
import { distAtom } from '../../atoms/distAtom';
import { dataAtom } from '../../atoms/dataAtom';
import { formAtom } from '../../atoms/formAtom';
import './chart.less';

// TODO link to actual years
const DOMAIN_X = [0, 24]; // years - 1 (inclusive)

export type ChartData = [
  q1: Array<ChartDataPoint>, // 5th - years of data
  q2: Array<ChartDataPoint>, // median - years of data
  q3: Array<ChartDataPoint>, // 95th - years of data
];

export interface ChartDataPoint {
  buyer: DataPoint<Buyer>,
  renter: DataPoint<Renter>
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

const init = (
  ref: HTMLDivElement,
  setPointer: (value: number) => void
): ChartInit => {
  const root = d3.select(ref);
  const wrapper = root.node().getBoundingClientRect();

  // set the dimensions and margins of the graph
  var margin = {top: 0, right: 10, bottom: 20, left: 20 };
  const height = 500 - margin.top - margin.bottom;

  // append the svg object to the body of the page
  const svg: Selection = root.append('svg');

  svg
    .attr("width", wrapper.width) // + margin.left + margin.right)
    .attr("height", height) // + margin.top + margin.bottom)
    .on('mousemove', evt => {
      const [x] = d3.pointer(evt, svg.node());
      setPointer(Math.max(0, Math.min(1, x / wrapper.width)));
    })
    .on('mouseleave', () => {
      setPointer(1);
    });

  svg.append("g")
    // Push to the bottom.
    .attr("transform", `translate(0, ${height})`)
    .attr("class", "x-axis");

  svg.append("g")
    // Push to the right.
    .attr("transform", `translate(${wrapper.width + 50}, 0)`)
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
    Math.min(min, d.buyer.$, d.renter.$)
  , +Infinity);

  const max$ = high.reduce((max, d) =>
    Math.max(max, d.buyer.$, d.renter.$)
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
        .y(d => y(d.buyer.$)) // buyer index
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
        .y(d => y(d.renter.$)) // renter index
      );
  }
}

const legend = (point: ChartDataPoint) => {
  const {buyer, renter} = point;

  const d: [
    ['buy'|'rent', DataPoint<Buyer>|DataPoint<Renter>],
    ['rent'|'buy', DataPoint<Renter>|DataPoint<Buyer>]
  ] = buyer.$ < renter.$
    ? [['buy', buyer], ['rent', renter]]
    : [['rent', renter], ['buy', buyer]];

  return d.map(([key, val]) => (
    <div key={key} className={`row ${key}`}>
      <span className="square" />
      <span className="value">
        {numbro(val.$).formatCurrency({
          thousandSeparated: true,
          mantissa: 0
        })}
      </span>
      <span className="label">{key}</span>
    </div>
  ));
};


// The chart is intended to visualize the net worth of a person
//  over time, given different scenarios such as buying or
//  renting a home.
export default function Chart() {
  const el = useRef<HTMLDivElement>(null);
  const [graph, setGraph] = useState<ChartInit>(null);
  const [pointer, setPointer] = useState(1);
  const [point, setPoint] = useState<ChartDataPoint>(null);
  const setMeta = useSetAtom(metaAtom);
  const setDist = useSetAtom(distAtom);
  const [data, setData] = useAtom(dataAtom);
  const form = useAtomValue(formAtom);

  useEffect(() => {
    console.log('init');
    setGraph(init(el.current, setPointer));
  }, []);

  useEffect(() => {
    console.log('estimate');
    simulate(form, setMeta, setDist, setData);
  }, [form, setMeta, setDist, setData]);

  useEffect(() => {
    if (data[1].length && graph) {
      console.log('update');
      update(...graph, data);
    }
  }, [data]);

  useEffect(() => {
    if (data[1].length) {
      const [_low, median, _high] = data;

      if (pointer === 1) {
        setPoint(median[median.length - 1]);
      } else {
        setPoint(
          median[Math.min(
            median.length - 2,
            Math.floor(
              median.length * (pointer * (median.length - 1) / median.length)
            ))]
        );
      }
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
};
