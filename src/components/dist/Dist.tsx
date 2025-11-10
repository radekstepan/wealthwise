import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import numbro from 'numbro';
import { useAtomValue } from 'jotai';
import { distAtom } from '../../atoms/distAtom';
import { formAtom } from '../../atoms/formAtom';
import { magicRentAtom } from '../../atoms/magicRentAtom';
import { magicAppreciationAtom } from '../../atoms/magicAppreciationAtom';
import LoadingDots from '../common/LoadingDots';
import './dist.less';

const CHART_MARGIN = { top: 30, right: 20, bottom: 40, left: 40 } as const;
const CHART_HEIGHT = 300 - CHART_MARGIN.top - CHART_MARGIN.bottom;
const NUM_THRESHOLDS = 40; // Controls the "smoothness" of the density plot

interface DistState {
  buyer: number[];
  renter: number[];
}

interface Graph {
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  chartGroup: d3.Selection<SVGGElement, unknown, null, undefined>;
  x: d3.ScaleLinear<number, number>;
  y: d3.ScaleLinear<number, number>;
  xAxis: d3.Axis<number | { valueOf(): number }>;
  yAxis: d3.Axis<number | { valueOf(): number }>;
}

interface QuantilePoint {
  value: number;
  label: string;
}

const init = (ref: HTMLElement | null): Graph | null => {
  if (!ref) return null;

  const root = d3.select(ref);
  root.selectAll('*').remove();

  const svg = root.append('svg');
  const chartGroup = svg.append('g').attr('class', 'chart-content');

  chartGroup.append('g').attr('class', 'x-axis');
  chartGroup.append('g').attr('class', 'y-axis');
  chartGroup.append('path').attr('class', 'area buyer');
  chartGroup.append('path').attr('class', 'area renter');
  chartGroup.append('g').attr('class', 'buyer-quantiles');
  chartGroup.append('g').attr('class', 'renter-quantiles');

  const x = d3.scaleLinear();
  const y = d3.scaleLinear().range([CHART_HEIGHT, 0]);

  const xAxis = d3
    .axisBottom<number>(x)
    .ticks(5)
    .tickSizeOuter(0)
    .tickFormat((d) =>
      numbro(d).format({
        prefix: '$',
        average: true,
        optionalMantissa: true,
        mantissa: 2,
      })
    );

  const yAxis = d3
    .axisLeft<number>(y)
    .ticks(4)
    .tickSizeOuter(0)
    .tickFormat(d3.format('.0%'));

  return { svg: svg as any, chartGroup: chartGroup as any, x, y, xAxis, yAxis };
};

const update = (graph: Graph | null, containerEl: HTMLElement | null, data: DistState | null) => {
  if (!graph || !containerEl || !data || !data.buyer || !data.renter) {
    return;
  }

  const { svg, chartGroup, x, y, xAxis, yAxis } = graph;
  const { buyer: buyerData, renter: renterData } = data;

  const bounds = containerEl.getBoundingClientRect();
  const fullWidth = bounds.width;

  if (!fullWidth) return;

  const chartWidth = Math.max(0, fullWidth - CHART_MARGIN.left - CHART_MARGIN.right);
  svg.attr('width', fullWidth).attr('height', CHART_HEIGHT + CHART_MARGIN.top + CHART_MARGIN.bottom);
  chartGroup.attr('transform', `translate(${CHART_MARGIN.left}, ${CHART_MARGIN.top})`);

  chartGroup.select<SVGGElement>('.x-axis').attr('transform', `translate(0, ${CHART_HEIGHT})`);

  // 1. Determine combined domain for X-axis
  const combinedData = [...buyerData, ...renterData];
  const xDomain = d3.extent(combinedData) as [number, number];
  x.domain(xDomain).range([0, chartWidth]);

  // 2. Create histogram generator
  const histogram = d3
    .histogram()
    .domain(x.domain() as [number, number])
    .thresholds(x.ticks(NUM_THRESHOLDS));

  const buyerBins = histogram(buyerData);
  const renterBins = histogram(renterData);

  if (!buyerBins.length || !renterBins.length) return;

  // 3. Determine Y-axis domain based on density (percentage)
  const maxBuyerDensity = (d3.max(buyerBins, (d) => d.length) || 0) / buyerData.length;
  const maxRenterDensity = (d3.max(renterBins, (d) => d.length) || 0) / renterData.length;
  const maxDensity = Math.max(maxBuyerDensity, maxRenterDensity);

  if (!Number.isFinite(maxDensity) || maxDensity <= 0) return;

  y.domain([0, maxDensity * 1.1]); // Add 10% padding

  // 4. Update axes
  chartGroup.select<SVGGElement>('.x-axis').transition().duration(400).call(xAxis as any);
  chartGroup.select<SVGGElement>('.y-axis').transition().duration(400).call(yAxis as any);

  // 5. Create area generators
  const buyerArea = d3
    .area<d3.Bin<number, number>>()
    .x((d) => x(((d.x0 || 0) + (d.x1 || 0)) / 2))
    .y0(y(0))
    .y1((d) => y(d.length / buyerData.length))
    .curve(d3.curveBasis);

  const renterArea = d3
    .area<d3.Bin<number, number>>()
    .x((d) => x(((d.x0 || 0) + (d.x1 || 0)) / 2))
    .y0(y(0))
    .y1((d) => y(d.length / renterData.length))
    .curve(d3.curveBasis);

  // 6. Draw the areas
  chartGroup.select<SVGPathElement>('.area.buyer').datum(buyerBins).transition().duration(400).attr('d', buyerArea as any);
  chartGroup.select<SVGPathElement>('.area.renter').datum(renterBins).transition().duration(400).attr('d', renterArea as any);

  // 7. Draw Quantile Lines and Labels
  const drawQuantiles = (
    selection: d3.Selection<SVGGElement, unknown, null, undefined>,
    quantileData: QuantilePoint[],
    className: 'buyer' | 'renter'
  ) => {
    const lines = selection.selectAll<SVGLineElement, QuantilePoint>('line').data(quantileData, (d: any) => d.label);

    lines
      .enter()
      .append('line')
      .merge(lines)
      .attr('class', (d) => `quantile-line ${className} ${d.label === 'Median' ? 'median' : ''}`)
      .transition()
      .duration(400)
      .attr('x1', (d) => x(d.value))
      .attr('x2', (d) => x(d.value))
      .attr('y1', 0)
      .attr('y2', CHART_HEIGHT);

    lines.exit().remove();

    const labels = selection.selectAll<SVGTextElement, QuantilePoint>('text').data(quantileData, (d: any) => d.label);

    labels
      .enter()
      .append('text')
      .merge(labels)
      .attr('class', `quantile-label ${className}`)
      .style('text-anchor', (d) => {
        if (d.label === '5%') return 'end';
        if (d.label === '95%') return 'start';
        return 'middle';
      })
      .text((d) => d.label)
      .transition()
      .duration(400)
      .attr('x', (d) => x(d.value))
      .attr('y', className === 'buyer' ? -15 : -5)
      .attr('dx', (d) => {
        if (d.label === '5%') return -4; // Nudge left
        if (d.label === '95%') return 4; // Nudge right
        return 0;
      });

    labels.exit().remove();
  };

  const sortedBuyer = buyerData.slice().sort(d3.ascending);
  const sortedRenter = renterData.slice().sort(d3.ascending);

  const buyerQuantileData: QuantilePoint[] = [
    { value: d3.quantile(sortedBuyer, 0.05) || 0, label: '5%' },
    { value: d3.quantile(sortedBuyer, 0.5) || 0, label: 'Median' },
    { value: d3.quantile(sortedBuyer, 0.95) || 0, label: '95%' },
  ].filter((d) => Number.isFinite(d.value));

  const renterQuantileData: QuantilePoint[] = [
    { value: d3.quantile(sortedRenter, 0.05) || 0, label: '5%' },
    { value: d3.quantile(sortedRenter, 0.5) || 0, label: 'Median' },
    { value: d3.quantile(sortedRenter, 0.95) || 0, label: '95%' },
  ].filter((d) => Number.isFinite(d.value));

  drawQuantiles(chartGroup.select<SVGGElement>('.buyer-quantiles'), buyerQuantileData, 'buyer');
  drawQuantiles(chartGroup.select<SVGGElement>('.renter-quantiles'), renterQuantileData, 'renter');
};

const Distribution: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [graph, setGraph] = useState<Graph | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [loadingToastMounted, setLoadingToastMounted] = useState(false);
  const [loadingToastVisible, setLoadingToastVisible] = useState(false);
  const distState = useAtomValue(distAtom) as DistState | null;
  const formState = useAtomValue(formAtom);
  const magicRent = useAtomValue(magicRentAtom);
  const magicAppreciation = useAtomValue(magicAppreciationAtom);
  const prevFormRef = useRef(formState);

  const activeMagicSearch =
    magicRent.status === 'searching'
      ? { ...magicRent, type: 'rent' as const }
      : magicAppreciation.status === 'searching'
      ? { ...magicAppreciation, type: 'appreciation' as const }
      : null;

  useEffect(() => {
    if (!graph && containerRef.current) {
      setGraph(init(containerRef.current));
      setIsLoading(true);
      setHasLoadedOnce(false);
    }
  }, [graph]);

  useEffect(() => {
    if (!graph || !containerRef.current) return;
    const hasData = !!(
      distState &&
      Array.isArray(distState.buyer) &&
      distState.buyer.length > 0 &&
      Array.isArray(distState.renter) &&
      distState.renter.length > 0
    );

    graph.svg.style('display', hasData ? 'block' : 'none');

    if (hasData) {
      update(graph, containerRef.current, distState);
      // Stay in loading state while magic search is active so UI matches main chart
      setIsLoading(!!activeMagicSearch);
      // Hide loading toast when data is ready
      setLoadingToastVisible(false);
      setTimeout(() => {
        setLoadingToastMounted(false);
      }, 240);
      if (!hasLoadedOnce) {
        setHasLoadedOnce(true);
      }
    } else {
      setIsLoading(true);
      // Show loading toast while data is being processed
      setLoadingToastMounted(true);
      setTimeout(() => setLoadingToastVisible(true), 12);
    }
  }, [graph, distState, hasLoadedOnce, activeMagicSearch]);


  // Detect form changes to anticipate new simulation runs
  useEffect(() => {
    if (prevFormRef.current !== formState) {
      prevFormRef.current = formState;

      setLoadingToastMounted(true);
      setTimeout(() => setLoadingToastVisible(true), 12);

      setIsLoading(true);
    }
  }, [formState]);

  useEffect(() => {
    if (!graph || !containerRef.current) {
      return () => undefined;
    }
    const node = containerRef.current;

    if (typeof ResizeObserver === 'undefined') {
      return () => undefined;
    }

    const observer = new ResizeObserver(() => {
      if (distState) {
        update(graph, node, distState);
      }
    });

    observer.observe(node);
    return () => observer.disconnect();
  }, [graph, distState]);

  return (
    <div className={`distribution ${hasLoadedOnce ? 'loaded' : ''} ${isLoading ? 'is-loading' : ''} ${activeMagicSearch ? 'is-searching' : ''}`}>
      <div className="distribution__title">Distribution of Final Net Worth</div>
      <div className="distribution__subtitle">
        How often different net worth outcomes appear across your simulations for both buyers and renters.
      </div>
      
      {/* Toast during loading */}
      {isLoading && (
        <div className={`distribution__toast visible`} role="status">
          <LoadingDots isLoading={true} />
        </div>
      )}

      {/* Subtle white overlay while loading */}
      <div className="distribution__overlay" aria-hidden="true" />

      <div ref={containerRef} className="svg" />
      {!hasLoadedOnce && !distState && !isLoading && (
        <div className="distribution__placeholder">
          <p className="placeholder-text">Run a simulation to see the distribution.</p>
        </div>
      )}
    </div>
  );
};

export default Distribution;
