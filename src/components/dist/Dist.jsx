import React, {useEffect, useState, useRef} from 'react';
import * as d3 from 'd3';
import numbro from 'numbro';
import { useAtomValue } from 'jotai';
import { distAtom } from '../../atoms/distAtom';
import './dist.less';

const init = (ref) => {
  const root = d3.select(ref);
  const wrapper = root.node().getBoundingClientRect();

  // set the dimensions and margins of the graph
  var margin = {top: 0, right: 10, bottom: 20, left: 20 };
  const width = wrapper.width - margin.left - margin.right;
  const height = 300 - margin.top - margin.bottom;

  // append the svg object to the body of the page
  const svg = root.append('svg');

  svg
    .attr("width", wrapper.width)
    .attr("height", height)

  svg.append("g")
    // Push to the bottom.
    .attr("transform", `translate(0, ${height})`)
    .attr("class", "x-axis");

  svg.append("g")
    // Push to the right.
    .attr("transform", `translate(${width + margin.left + margin.right + 60}, 0)`)
    .attr('class', 'y-axis');

  // add X axis and Y axis
  const x = d3.scaleBand().range([0, wrapper.width]);
  const y = d3.scaleLinear().range([height, 0]);

  const xAxis = d3.axisBottom(x).tickFormat((d) =>
    d.map(n => '$' + numbro(n).format({
      average: true,
      optionalMantissa: true,
      mantissa: n > 500000 ? 2 : 0,
      negative: 'parenthesis'
    })).join(' - ')
  );
  const yAxis = d3.axisLeft(y);

  return [svg, x, xAxis, y, yAxis];
}

const update = (svg, x, xAxis, y, yAxis, data) => {
  const {width, height} = svg.node().getBoundingClientRect();

  const [max, sum] = data.reduce(
    ([m, s], d) => d[1] > m ? [d[1], s + d[1]] : [m, s + d[1]]
  , [-Infinity, 0]);

  x.domain(data.map(d => d[0]));
  y.domain([0, max]);

  svg.selectAll(".x-axis")
    .transition()
    .duration(500)
    .call(xAxis);

  // svg.selectAll(".y-axis")
  //   .transition()
  //   .duration(500)
  //   .call(yAxis);

  const dist = svg.selectAll('.bar').data(data);
  
  const barWidth = (width / data.length) - 30;

  dist
    .enter()
    .append("rect")
    .attr("class", (_d, i) =>
      i === Math.floor(data.length / 2) ? 'bar median' : 'bar'
    )
    .merge(dist)
    .transition()
    .duration(500)
    .attr("x", d => x(d[0]) + 15)
    .attr("y", d => y(d[1]))
    .attr("width", barWidth)
    .attr("height", d => height - y(d[1]));
  
  const text = svg.selectAll('.text').data(data);

  text
    .enter()
    .append("text")
    .attr('class', 'text')
    .merge(text)
    .transition()
    .duration(500)
    .attr("x", d => x(d[0]) + 15 + (barWidth / 2))
    .attr("y", d => y(d[1]) - 5)
    .text(d => (d[1] / sum * 100).toFixed(2) + '%');
}

function Distribution() {
  const el = useRef(null);
  const [graph, setGraph] = useState(null);
  const distState = useAtomValue(distAtom);

  useEffect(() => {
    setGraph(init(el.current));
  }, []);

  useEffect(() => {
    if (distState.length) {
      update(...graph, distState);
    }
  }, [distState]);

  return (
    <div className="distribution">
      <div ref={el} className="svg" />
    </div>
  );
}

export default Distribution;
