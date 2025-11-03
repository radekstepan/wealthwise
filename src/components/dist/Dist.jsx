import React, { useEffect, useState, useRef } from 'react';
import * as d3 from 'd3';
import numbro from 'numbro';
import { useAtomValue } from 'jotai';
import { distAtom } from '../../atoms/distAtom';
import { simulationLoadingAtom } from '../../atoms/simulationLoadingAtom';
import './dist.less';

const init = (ref) => {
  const root = d3.select(ref);
  root.select('svg').remove(); // Clear any previous SVG before re-init
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
    // Clear any existing bars/labels but keep space for skeleton overlay
    svg.selectAll('rect.bar').remove();
    svg.selectAll('text.text').remove();
    return;
  }

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

  // Calculate bar width dynamically based on the number of data points
  const barWidth = x.bandwidth();
  if (barWidth <= 0) {
    // Container not measurable yet (hidden). Skip drawing to avoid showing labels without bars.
    return;
  }
  const maxIndex = data.reduce((maxIdx, curr, idx, arr) =>
    curr[1] > arr[maxIdx][1] ? idx : maxIdx, 0);

  // Bars
  const bars = svg.selectAll('rect.bar').data(data);

  // Exit stale bars
  bars.exit()
    .transition().duration(300)
    .attr('opacity', 0)
    .attr('y', height)
    .attr('height', 0)
    .remove();

  // Enter new bars
  const barsEnter = bars.enter()
    .append('rect')
    .attr('class', (_d, i) => (i === maxIndex ? 'bar median' : 'bar'))
    .attr('x', (d) => x(d[0]))
    .attr('y', height)
    .attr('width', barWidth)
    .attr('height', 0)
    .attr('opacity', 0);

  // Merge + update
  barsEnter.merge(bars)
    .attr('class', (_d, i) => (i === maxIndex ? 'bar median' : 'bar'))
    .transition()
    .duration(500)
    .attr('opacity', 1)
    .attr('x', (d) => x(d[0]))
    .attr('y', (d) => y(d[1]))
    .attr('width', barWidth)
    .attr('height', (d) => Math.max(height - y(d[1]), 0));

  // Labels
  const labels = svg.selectAll('text.text').data(data);

  // Exit stale labels
  labels.exit()
    .transition().duration(200)
    .attr('opacity', 0)
    .remove();

  // Enter new labels
  const labelsEnter = labels.enter()
    .append('text')
    .attr('class', 'text')
    .attr('opacity', 0)
    .attr('x', (d) => x(d[0]) + barWidth / 2)
    .attr('y', height - 5)
    .text((d) => (sum ? ((d[1] / sum) * 100).toFixed(2) : '0.00') + '%');

  // Merge + update with slight delay so bars are visible first
  labelsEnter.merge(labels)
    .transition()
    .delay(520)
    .duration(400)
    .attr('opacity', 1)
    .attr('x', (d) => x(d[0]) + barWidth / 2)
    .attr('y', (d) => Math.max(y(d[1]) - 5, 10))
    .tween('text', function(d) {
      const that = d3.select(this);
      const from = +that.text().replace('%','') || 0;
      const to = sum ? ((d[1] / sum) * 100) : 0;
      const i = d3.interpolateNumber(from, to);
      return (t) => that.text(i(t).toFixed(2) + '%');
    });
};

function Distribution() {
  const el = useRef(null);
  const [graph, setGraph] = useState(null);
  const distState = useAtomValue(distAtom);
  const simLoading = useAtomValue(simulationLoadingAtom);
  const latestDataRef = useRef(null);
  const resizeObsRef = useRef(null);

  useEffect(() => {
    if (!el.current) return;

    // Lazy init; will re-init on first measurable size
    const ro = new ResizeObserver(() => {
      if (!el.current) return;
      const rect = el.current.getBoundingClientRect();
      if (rect.width > 0 && rect.height >= 0) {
        const g = init(el.current);
        setGraph(g);
        if (latestDataRef.current) {
          update(...g, latestDataRef.current);
        }
      }
    });
    resizeObsRef.current = ro;
    ro.observe(el.current);

    return () => {
      if (resizeObsRef.current && el.current) {
        resizeObsRef.current.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    if (graph) {
      latestDataRef.current = distState;
      if (!distState) {
        // Clear SVG, skeleton will show via overlay
        update(...graph, null);
      } else {
        update(...graph, distState);
      }
    }
  }, [distState, graph]);

  return (
    <div className="distribution">
      {(simLoading && !distState) && (
        <div className="dist-skeleton" aria-hidden />
      )}
      <div ref={el} className="svg" />
    </div>
  );
}

export default Distribution;
