import React, {useEffect, useRef} from 'react';
import * as d3 from 'd3';
import {
  Pane
} from 'evergreen-ui';
import estimate from '../modules/estimate';
import './chart.less';

const graph = async (ref, wrapper) => {
  const data = estimate({
    years: 25,
    price: 500000,
    downpayment: 0.2,
    maintenance: 400,
    taxes: 200,
    insurance: 200,
    rent: 2000,
    rates: {
      expenses: 0.03,
      interest: 0.035,
      rent: 0.02, // rent increases
      appreciation: 0.02,
      market: 0.03 // stock market return
    }
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
  var x = d3.scaleLinear().range([0, width]);
  var y = d3.scaleLinear().range([height, 0]);

  x.domain([0, 25 * 12]); // months
  y.domain([-500000, 2000000]); // $

  svg.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(x));

  svg.append("g")
    .call(d3.axisLeft(y));
    
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
