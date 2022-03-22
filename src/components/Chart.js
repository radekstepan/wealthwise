import React, {useEffect, useRef} from 'react';
import * as d3 from 'd3';
import {
  Pane
} from 'evergreen-ui';
import './chart.less';

const graph = async (ref, wrapper) => {
  // read data from csv and format variables
  let data = await d3.csv('https://raw.githubusercontent.com/holtzy/data_to_viz/master/Example_dataset/3_TwoNumOrdered_comma.csv');
  var parseTime = d3.timeParse("%Y-%m-%d");

  data.forEach((d) => {
    d.date = parseTime(d.date);
    d.value = +d.value;
  });

  // set the dimensions and margins of the graph
  var margin = {top: 20, right: 20, bottom: 50, left: 70 };
  const width = wrapper.width - margin.left - margin.right;
  const height = 500 - margin.top - margin.bottom;

  // append the svg object to the body of the page
  const svg = d3.select(ref);

  svg
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // add X axis and Y axis
  var x = d3.scaleTime().range([0, width]);
  var y = d3.scaleLinear().range([height, 0]);

  x.domain(d3.extent(data, (d) => { return d.date; }));
  y.domain([0, d3.max(data, (d) => { return d.value; })]);

  svg.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(x));

  svg.append("g")
    .call(d3.axisLeft(y));
    
  // add the Line
  var valueLine = d3.line()
  .x((d) => { return x(d.date); })
  .y((d) => { return y(d.value); });

  svg.append("path")
    .data([data])
    .attr("class", "line")
    .attr("fill", "none")
    .attr("stroke", "#2952CC")
    .attr("stroke-width", 1.5)
    .attr("d", valueLine);

}

export default function Chart() {
  const wrapper = useRef(null);
  const svg = useRef(null);

  useEffect(() => {
    if (svg.current) {
      graph(
        svg.current,
        d3.select(wrapper.current).node().getBoundingClientRect()
      );
    }
  }, [svg.current]);

  return (
    <Pane ref={wrapper} padding={16} id="chart">
      <svg ref={svg} />
    </Pane>
  );
}
