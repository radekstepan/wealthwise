import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as d3 from 'd3';
import numbro from 'numbro';
import { IoInformationCircle } from 'react-icons/io5';
import { useAtomValue } from 'jotai';
import { formAtom } from '../../atoms/formAtom';
import { carryingCostAtom, carryingCostLoadingAtom } from '../../atoms/carryingCostAtom';
import { type CarryingCostSeries, type CarryingCostSeriesPoint } from '../../interfaces';
import {
  CARRYING_COST_CATEGORIES,
  CARRYING_COST_LABELS,
  CARRYING_COST_COLORS,
  CARRYING_COST_DESCRIPTIONS,
  CARRYING_COST_LINE_DESCRIPTIONS
} from '../../modules/carryingCostConfig';
import {
  calculateCarryingCostMetrics,
  formatMonthLabel,
  smoothCarryingCostSeries
} from '../../modules/carryingCostHelpers';
import Loader from '../loader/Loader';
import './carrying-costs.less';

const CHART_HEIGHT = 340;
const MARGIN = { top: 20, right: 80, bottom: 40, left: 60 };
const SMOOTHING_WINDOW = 12;

const TOOLTIPS = {
  peakGross: 'The highest monthly carrying cost (property tax, insurance, maintenance, etc.) over the simulation period.',
  averageGross: 'The average gross carrying cost over the first X months of the simulation, smoothed for better trend visibility.',
  breakeven: 'The first month when the net carrying cost plus the opportunity cost becomes cheaper than the comparable rent for the median simulation scenario.'
};

const formatCurrency = (value: number) => numbro(value).formatCurrency({
  thousandSeparated: true,
  mantissa: 0
});

interface CarryingCostChartProps {
  isActive: boolean;
}

const CarryingCostChart: React.FC<CarryingCostChartProps> = ({ isActive }) => {
  const series = useAtomValue(carryingCostAtom);
  const isSeriesLoading = useAtomValue(carryingCostLoadingAtom);
  const form = useAtomValue(formAtom);
  const hasSeries = series.length > 0;
  // Always show all lines, no toggles
  const smooth = true;
  const showNet = true;
  const showOpportunity = true;
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [hoverPixel, setHoverPixel] = useState<number | null>(null);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  // Local loading removed; rely on global carryingCostLoadingAtom to avoid races

  const wrapperRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  // Removed pending updates tracking to simplify state handling
  const [isChartHovered, setIsChartHovered] = useState(false);

  const workingSeries: CarryingCostSeries = useMemo(
    () => smoothCarryingCostSeries(series, SMOOTHING_WINDOW),
    [series]
  );


  useEffect(() => {
    if (!isActive) {
      setHoverIndex(null);
      return;
    }

    if (!workingSeries.length) {
      setHoverIndex(null);
      setHasLoadedOnce(false);
      return;
    }

    setHoverIndex(prev => {
      if (prev === null) {
        return workingSeries.length - 1;
      }
      return Math.min(prev, workingSeries.length - 1);
    });
    setHasLoadedOnce(true);
  }, [workingSeries.length, isActive]);

  useEffect(() => {
  const container = wrapperRef.current;
  const svgElement = svgRef.current;

    if (!isActive) {
      if (svgElement) {
        d3.select(svgElement).selectAll('*').remove();
      }
      return;
    }

    if (!container || !svgElement || !workingSeries.length) {
      if (!workingSeries.length) {
        setHasLoadedOnce(false);
      }
      return;
    }

    const width = container.clientWidth || 800;
    const height = CHART_HEIGHT;
    const innerWidth = width - MARGIN.left - MARGIN.right;
    const innerHeight = height - MARGIN.top - MARGIN.bottom;

    const lastMonth = workingSeries[workingSeries.length - 1].absoluteMonth;
    const x = d3.scaleLinear()
      .domain([workingSeries[0].absoluteMonth, lastMonth])
      .range([0, innerWidth]);

    const stackInput = workingSeries.map(point => ({
      ...point.components,
      month: point.absoluteMonth
    }));

    const stackGenerator = d3.stack<typeof stackInput[number]>().keys(CARRYING_COST_CATEGORIES);
    const stackSeries = stackGenerator(stackInput);

    const stackMax = d3.max(stackSeries, layer => d3.max(layer, d => d[1]) ?? 0) ?? 0;
    const rentMax = d3.max<CarryingCostSeriesPoint, number>(workingSeries, point => point.rent) ?? 0;
    const opportunityMax = showOpportunity
      ? d3.max<CarryingCostSeriesPoint, number>(workingSeries, point => point.gross + point.opportunityCost) ?? 0
      : 0;
    const yMax = Math.max(stackMax, rentMax, opportunityMax);
    const yMin = Math.min(0, d3.min<CarryingCostSeriesPoint, number>(workingSeries, point => point.net) ?? 0);

    const y = d3.scaleLinear()
      .domain([yMin, yMax])
      .nice()
      .range([innerHeight, 0]);

    const svg = d3.select(svgElement);
    svg.selectAll('*').remove();

    svg
      .attr('width', width)
      .attr('height', height);

    const g = svg.append('g')
      .attr('transform', `translate(${MARGIN.left},${MARGIN.top})`);

    // Use 5 ticks, label as years, like main Chart
    const xAxis = d3.axisBottom(x)
      .ticks(5)
      .tickFormat((value, i) => {
        if (i === 0) return 'Now';
        return `${Math.ceil(Number(value) / 12)}y`;
      });

    const yAxis = d3.axisLeft(y)
      .ticks(6)
      .tickFormat(value => formatCurrency(Number(value)));

    g.append('g')
      .attr('transform', `translate(0, ${innerHeight})`)
      .attr('class', 'cc-axis cc-axis-x')
      .call(xAxis as any);

    g.append('g')
      .attr('class', 'cc-axis cc-axis-y')
      .call(yAxis as any);

    const area = d3.area<[number, number]>()
      .x((_, i) => x(workingSeries[i].absoluteMonth))
      .y0(d => y(d[0]))
      .y1(d => y(d[1]));

    g.append('g')
      .attr('class', 'cc-area-stack')
      .selectAll('path')
      .data(stackSeries)
      .enter()
      .append('path')
      .attr('class', layer => `cc-area cc-${layer.key}`)
      .attr('fill', layer => CARRYING_COST_COLORS[layer.key as typeof CARRYING_COST_CATEGORIES[number]])
      .attr('d', layer => area(layer as unknown as Array<[number, number]>));

    const rentLine = d3.line<CarryingCostSeriesPoint>()
      .x(point => x(point.absoluteMonth))
      .y(point => y(point.rent));

    const netLine = d3.line<CarryingCostSeriesPoint>()
      .x(point => x(point.absoluteMonth))
      .y(point => y(point.net));

    const opportunityLine = d3.line<CarryingCostSeriesPoint>()
      .x(point => x(point.absoluteMonth))
      .y(point => y(point.gross + point.opportunityCost));

    g.append('path')
      .datum(workingSeries)
      .attr('class', 'cc-line cc-line-rent')
      .attr('d', rentLine);

    if (showNet) {
      g.append('path')
        .datum(workingSeries)
        .attr('class', 'cc-line cc-line-net')
        .attr('d', netLine);
    }

    if (showOpportunity) {
      g.append('path')
        .datum(workingSeries)
        .attr('class', 'cc-line cc-line-opportunity')
        .attr('d', opportunityLine);
    }

    const hovered = hoverIndex !== null ? workingSeries[hoverIndex] : null;
    if (hovered) {
      const hoverX = x(hovered.absoluteMonth);
      setHoverPixel(MARGIN.left + hoverX);

      g.append('line')
        .attr('class', 'cc-hover-line')
        .attr('x1', hoverX)
        .attr('x2', hoverX)
        .attr('y1', 0)
        .attr('y2', innerHeight);

      g.append('circle')
        .attr('class', 'cc-hover-point rent')
        .attr('cx', hoverX)
        .attr('cy', y(hovered.rent))
        .attr('r', 3.5);

      if (showNet) {
        g.append('circle')
          .attr('class', 'cc-hover-point net')
          .attr('cx', hoverX)
          .attr('cy', y(hovered.net))
          .attr('r', 3.5);
      }

      if (showOpportunity) {
        g.append('circle')
          .attr('class', 'cc-hover-point opportunity')
          .attr('cx', hoverX)
          .attr('cy', y(hovered.gross + hovered.opportunityCost))
          .attr('r', 3.5);
      }
    }

    const bisect = d3.bisector<CarryingCostSeriesPoint, number>(point => point.absoluteMonth).left;

    g.append('rect')
      .attr('class', 'cc-overlay')
      .attr('width', innerWidth)
      .attr('height', innerHeight)
      .attr('fill', 'transparent')
      .on('mousemove', (event) => {
        const [pointerX] = d3.pointer(event);
        const monthValue = x.invert(pointerX);
        const index = Math.min(workingSeries.length - 1, Math.max(0, bisect(workingSeries, monthValue)));
        setHoverIndex(index);
      })
      .on('mouseleave', () => {
        setHoverIndex(workingSeries.length - 1);
      });

    if (!hasLoadedOnce) {
      setHasLoadedOnce(true);
    }
  }, [workingSeries, showNet, showOpportunity, hoverIndex, hasLoadedOnce, isActive]);

  // When form changes, we rely on global carryingCostLoadingAtom set by the simulator
  // to control the loader; no local loading increments here to avoid race conditions.

  const metrics = useMemo(() => calculateCarryingCostMetrics(series), [series]);
  const hoveredPoint = hoverIndex !== null ? workingSeries[hoverIndex] : null;

  const showLoader = isActive && (isSeriesLoading || !hasSeries);

  return (
    <div className={`carrying-costs${!isActive ? ' is-inactive' : ''}`}>
      {/* Controls removed: always show all lines */}
      <div
        className="cc-chart"
        ref={wrapperRef}
        onMouseEnter={() => setIsChartHovered(true)}
        onMouseLeave={() => setIsChartHovered(false)}
      >
  {showLoader && (
          <div className="chart-loader-overlay">
            <Loader />
          </div>
        )}
        <svg ref={svgRef} />
  {(isActive && !showLoader && isChartHovered && hoveredPoint && hoverPixel !== null) && (() => {
          // Tooltip logic: show right if in left half, left if in right half
          const containerWidth = wrapperRef.current?.clientWidth || 0;
          const tooltipWidth = 260;
          const margin = 16;
          let left = hoverPixel;
          let transform = 'translateX(0)';
          if (hoverPixel < containerWidth / 2) {
            // Show to right
            left = Math.min(hoverPixel + margin, containerWidth - tooltipWidth - margin);
            transform = 'translateX(0)';
          } else {
            // Show to left
            left = Math.max(hoverPixel - tooltipWidth - margin, margin);
            transform = 'translateX(0)';
          }
          return (
            <div
              className="cc-tooltip"
              style={{ left, transform, minWidth: tooltipWidth }}
            >
              <div className="title">{formatMonthLabel(hoveredPoint.absoluteMonth)}</div>
              <div className="row" title={CARRYING_COST_LINE_DESCRIPTIONS.gross}>
                <span>Gross carrying cost</span>
                <span>{formatCurrency(hoveredPoint.gross)}</span>
              </div>
              {showOpportunity && (
                <div className="row" title={CARRYING_COST_LINE_DESCRIPTIONS.grossWithOpportunity}>
                  <span>Gross + opportunity</span>
                  <span>{formatCurrency(hoveredPoint.gross + hoveredPoint.opportunityCost)}</span>
                </div>
              )}
              {showNet && (
                <div className="row" title={CARRYING_COST_LINE_DESCRIPTIONS.net}>
                  <span>Net carrying cost</span>
                  <span>{formatCurrency(hoveredPoint.net)}</span>
                </div>
              )}
              <div className="row" title={CARRYING_COST_LINE_DESCRIPTIONS.rent}>
                <span>Comparable rent</span>
                <span>{formatCurrency(hoveredPoint.rent)}</span>
              </div>
              <div className="row" title={CARRYING_COST_LINE_DESCRIPTIONS.opportunity}>
                <span>Opportunity cost</span>
                <span>{formatCurrency(hoveredPoint.opportunityCost)}</span>
              </div>
              {hoveredPoint.rentalIncome > 0 && (
                <div className="row" title={CARRYING_COST_LINE_DESCRIPTIONS.rentalIncome}>
                  <span>Rental income offset</span>
                  <span>-{formatCurrency(hoveredPoint.rentalIncome)}</span>
                </div>
              )}
              <div className="divider" />
              <div className="section">Monthly expenses</div>
              {CARRYING_COST_CATEGORIES.map(category => (
                <div key={category} className="row" title={CARRYING_COST_DESCRIPTIONS[category]}>
                  <span>
                    <span className="dot" style={{ backgroundColor: CARRYING_COST_COLORS[category] }} />
                    {CARRYING_COST_LABELS[category]}
                  </span>
                  <span>{formatCurrency(hoveredPoint.components[category])}</span>
                </div>
              ))}
              <div className="divider" />
              <div className="section">Equity adjustments</div>
              <div className="row" title={CARRYING_COST_LINE_DESCRIPTIONS.equityDelta}>
                <span>Equity gained</span>
                <span>{formatCurrency(hoveredPoint.equityDelta)}</span>
              </div>
              <div className="row" title={CARRYING_COST_LINE_DESCRIPTIONS.principal}>
                <span>Principal paid</span>
                <span>{formatCurrency(hoveredPoint.principal)}</span>
              </div>
              <div className="row" title={CARRYING_COST_LINE_DESCRIPTIONS.appreciation}>
                <span>Appreciation</span>
                <span>{formatCurrency(hoveredPoint.appreciation)}</span>
              </div>
            </div>
          );
        })()}
      </div>

      {!hasSeries && !hasLoadedOnce && (
        <div className="cc-placeholder">Run the simulation to view monthly carrying costs.</div>
      )}

      {isActive && hasSeries && (
        <div className="cc-legend">
          {CARRYING_COST_CATEGORIES.map(category => (
            <div key={category} className="item" title={CARRYING_COST_DESCRIPTIONS[category]}>
              <span className="swatch" style={{ backgroundColor: CARRYING_COST_COLORS[category] }} />
              <span className="label">{CARRYING_COST_LABELS[category]}</span>
            </div>
          ))}
          <div className="item line rent" title={CARRYING_COST_LINE_DESCRIPTIONS.rent}>
            <span className="line-indicator" />
            <span className="label">Rent line</span>
          </div>
          {showNet && (
            <div className="item line net" title={CARRYING_COST_LINE_DESCRIPTIONS.net}>
              <span className="line-indicator" />
              <span className="label">Net cost</span>
            </div>
          )}
          {showOpportunity && (
            <div className="item line opportunity" title={CARRYING_COST_LINE_DESCRIPTIONS.grossWithOpportunity}>
              <span className="line-indicator" />
              <span className="label">Gross + opportunity</span>
            </div>
          )}
        </div>
      )}

  {isActive && hasSeries && hasLoadedOnce && metrics && (
        <div className="cc-summary">
          <div className="card">
            <div className="label">
              Peak gross monthly cost
              <span className="info" data-tooltip={TOOLTIPS.peakGross}>
                <IoInformationCircle />
              </span>
            </div>
            <div className="value">{formatCurrency(metrics.peakGross.value)}</div>
            <div className="hint">{formatMonthLabel(metrics.peakGross.month)}</div>
          </div>
          <div className="card">
            <div className="label">
              Average gross (first {metrics.averageGross.months}m)
              <span className="info" data-tooltip={TOOLTIPS.averageGross}>
                <IoInformationCircle />
              </span>
            </div>
            <div className="value">{formatCurrency(metrics.averageGross.value)}</div>
            <div className="hint">Smoothed ≈ {smooth ? 'on' : 'off'}</div>
          </div>
          <div className="card">
            <div className="label">
              Net cheaper than rent
              <span className="info" data-tooltip={TOOLTIPS.breakeven}>
                <IoInformationCircle />
              </span>
            </div>
            <div className="value">{metrics.breakeven ? formatMonthLabel(metrics.breakeven.month) : 'Not reached'}</div>
            <div className="hint">Median scenario · incl. opportunity cost</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CarryingCostChart;
