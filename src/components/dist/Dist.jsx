import React, { useEffect, useState, useRef } from 'react';
import * as d3 from 'd3';
import numbro from 'numbro';
import { useAtomValue } from 'jotai';
import { distAtom } from '../../atoms/distAtom';
import './dist.less';

const init = (ref) => {
  const root = d3.select(ref);
  const wrapper = root.node().getBoundingClientRect();

  // Set the dimensions and margins of the graph
  const margin = { top: 0, right: 10, bottom: 20, left: 20 };
  const width = wrapper.width - margin.left - margin.right;
  const height = 300 - margin.top - margin.bottom;

  // Append the SVG object to the root element
  const svg = root.append('svg');

  svg
    .attr('width', wrapper.width)
    .attr('height', height);

  svg.append('g')
    // Push to the bottom.
    .attr('transform', `translate(0, ${height})`)
    .attr('class', 'x-axis');

  svg.append('g')
    // Push to the right.
    .attr("transform", `translate(${width + margin.left + margin.right + 60}, 0)`)
    .attr('class', 'y-axis');

  // Define X and Y axes
  const x = d3.scaleBand().range([0, width]).padding(0.4);
  const y = d3.scaleLinear().range([height, 0]);

  const xAxis = d3.axisBottom(x).tickFormat((d) => {
    const [min, max] = d;
    const center = (min + max) / 2;

    return numbro(center).format({
      prefix: '$',
      average: true,
      optionalMantissa: true,
      mantissa: 2,
    });
  });
  const yAxis = d3.axisLeft(y);

  return [svg, x, xAxis, y, yAxis];
};

const update = (svg, x, xAxis, y, _yAxis, data) => {
  const { height } = svg.node().getBoundingClientRect();

  if (!data) {
    // Hide the SVG completely if there is no data
    svg.style('display', 'none');
    return;
  }

  // Ensure SVG is visible when there is data
  svg.style('display', 'block');

  // Calculate the domains for the axes
  const [max, sum] = data.reduce(
    ([m, s], d) => (d[1] > m ? [d[1], s + d[1]] : [m, s + d[1]]),
    [0, 0] // Ensure a default value of 0 for max and sum
  );

  x.domain(data.map((d) => d[0]));
  y.domain([0, max || 1]); // Ensure the y-domain has a minimum range of [0, 1]

  svg.selectAll('.x-axis')
    .transition()
    .duration(500)
    .call(xAxis);

  // svg.selectAll('.y-axis')
  //   .transition()
  //   .duration(500)
  //   .call(yAxis);

  const dist = svg.selectAll('.bar').data(data);

  // Calculate bar width dynamically based on the number of data points
  const barWidth = x.bandwidth();
  const maxIndex = data.reduce((maxIdx, curr, idx, arr) =>
    curr[1] > arr[maxIdx][1] ? idx : maxIdx, 0);

  dist
    .enter()
    .append('rect')
    .attr('class', (_d, i) => (i === maxIndex ? 'bar median' : 'bar'))
    .merge(dist)
    .transition()
    .duration(500)
    .attr('x', (d) => x(d[0]))
    .attr('y', (d) => y(d[1]))
    .attr('width', barWidth)
    .attr('height', (d) => Math.max(height - y(d[1]), 0));

  const text = svg.selectAll('.text').data(data);

  text
    .enter()
    .append('text')
    .attr('class', 'text')
    .merge(text)
    .transition()
    .duration(500)
    .attr('x', (d) => x(d[0]) + barWidth / 2)
    .attr('y', (d) => y(d[1]) - 5)
    .text((d) => ((d[1] / sum) * 100).toFixed(2) + '%');
};

function Distribution() {
  const el = useRef(null);
  const [graph, setGraph] = useState(null);
  const distState = useAtomValue(distAtom);

  useEffect(() => {
    setGraph(init(el.current));
  }, []);

  useEffect(() => {
    if (graph) {
      if (!distState) {
        el.current.style.display = 'none';
      } else {
        el.current.style.display = 'block';
        update(...graph, distState);
      }
    }
  }, [distState, graph]);

  return (
    <div className="distribution">
      <div ref={el} className="svg" />
    </div>
  );
}

export default Distribution;
