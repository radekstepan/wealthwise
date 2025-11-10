import React, {useEffect, useState, useRef} from 'react';
import * as d3 from 'd3';
import numbro from 'numbro';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import simulate from '../../modules/simulate';
import { metaAtom } from '../../atoms/metaAtom';
import { distAtom } from '../../atoms/distAtom';
import { dataAtom } from '../../atoms/dataAtom';
import { formAtom } from '../../atoms/formAtom';
import { magicRentAtom } from '../../atoms/magicRentAtom';
import { cls } from '../../utils/css';
import Loader from '../loader/Loader'
import LoadingDots from '../common/LoadingDots';
import { type Renter, type Buyer } from '../../interfaces';
import './chart.less';

export type ChartData = [
  q1: Array<ChartDataPoint>, // 5th - years of data
  q2: Array<ChartDataPoint>, // median - years of data
  q3: Array<ChartDataPoint>, // 95th - years of data
];

export interface ChartDataPoint {
  buyer: Buyer,
  renter: Renter
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

const MINI_CHART_SAMPLES = 50; // Fewer samples for the homepage chart

const init = (
  ref: HTMLDivElement,
  setPointer: (value: number) => void,
  isMini: boolean // Keep isMini flag
): ChartInit => {
  const root = d3.select(ref);
  root.select('svg').remove(); // Clear previous SVG
  const wrapper = root.node().getBoundingClientRect();

  // Adjust dimensions and margins for mini chart
  var margin = isMini ? { top: 10, right: 15, bottom: 20, left: 45 } : { top: 0, right: 10, bottom: 20, left: 30 }; // Give mini more left margin for Y axis
  const chartWidth = wrapper.width - margin.left - margin.right;
  // Make mini height slightly taller to accommodate axes
  const height = (isMini ? 150 : 500) - margin.top - margin.bottom;

  const svg: Selection = root.append('svg');

  svg
    .attr("width", wrapper.width)
    .attr("height", height + margin.top + margin.bottom)
    .append("g") // Group for chart content
    .attr("transform", `translate(${margin.left},${margin.top})`);

  svg
    .on('mousemove', evt => {
      // Use the chart content group's coordinate system for pointer calculation
      const chartContentGroup = svg.select('g').node() as SVGGElement;
      if (!chartContentGroup) return;
      const [xPos] = d3.pointer(evt, chartContentGroup);
      // Calculate pointer relative to chartWidth (ensure chartWidth > 0)
      setPointer(chartWidth > 0 ? Math.max(0, Math.min(1, xPos / chartWidth)) : 0);
    })
    .on('mouseleave', () => {
      setPointer(1); // Reset pointer when mouse leaves
    });

  // Always add axis groups now
  svg.select('g').append("g")
    .attr("transform", `translate(0, ${height})`) // Position X axis at the bottom
    .attr("class", "x-axis");

  svg.select('g').append("g")
    // Y axis is positioned at x=0 within the group
    .attr('class', 'y-axis');

  // Define scales
  const x: Scale = d3.scaleLinear().range([0, chartWidth]);
  const y: Scale = d3.scaleLinear().range([height, 0]);

  // Define axes, adjust ticks for mini
  const xAxis: Axis = d3
    .axisBottom(x)
    .ticks(isMini ? 3 : 5) // Fewer ticks for mini
    .tickFormat(d => d ? Math.ceil(d.valueOf()) + 1 + 'y' : 'Now');

  const yAxis: Axis = d3
    .axisLeft(y)
    .ticks(isMini ? 3 : 5) // Fewer ticks for mini
    .tickFormat(d => numbro(d).formatCurrency({
      average: true,
      mantissa: 0,
      spaceSeparated: false // Compact for mini
    }));

  return [svg, x, xAxis, y, yAxis];
}

const update = (
  svg: Selection,
  x: Scale,
  xAxis: Axis,
  y: Scale,
  yAxis: Axis,
  data: ChartData,
  isMini: boolean,
) => {
  if (!data || !data[1] || data[1].length === 0) return;

  const chartContent = svg.select<SVGGElement>('g');
  const height = y.range()[0];

  // Always use all quantiles to determine scale range for consistency
  const allDataPoints = [...(data[0] || []), ...(data[1] || []), ...(data[2] || [])];
   if (allDataPoints.length === 0) return; // Exit if no data points at all

  const min$ = d3.min(allDataPoints, d => Math.min(d.buyer.$, d.renter.$));
  const max$ = d3.max(allDataPoints, d => Math.max(d.buyer.$, d.renter.$));

  const validMin = typeof min$ === 'number' ? min$ : 0;
  const validMax = typeof max$ === 'number' && max$ > validMin ? max$ : validMin + 1;

  x.domain([0, data[1].length - 1]);
  y.domain([validMin, validMax]);

  // Always update axes now
  chartContent.selectAll<SVGGElement, unknown>(".x-axis")
      .transition().duration(500)
      .call(xAxis);

  chartContent.selectAll<SVGGElement, unknown>(".y-axis")
      .transition().duration(500)
      .call(yAxis);

  // Render lines: Median thicker, others thinner. Maybe only median in mini?
  // Let's render all but style them differently for mini.
  const quantilesToRender = [0, 1, 2]; // Always use data from all quantiles for lines

  for (const quantileIndex of quantilesToRender) {
    const q = data[quantileIndex];
    if (!q || q.length === 0) continue;

    const lineGeneratorBuyer = d3.line<ChartDataPoint>()
        .x((_d, year) => x(year))
        .y(d => y(d.buyer.$));

    const buy = chartContent.selectAll<SVGPathElement, ChartDataPoint[]>(`.buy-line.q${quantileIndex}`)
      .data([q]);

    buy.enter()
      .append("path")
      // Add 'mini' class conditionally, median line gets 'median' class
      .attr("class", `buy-line q${quantileIndex}${isMini ? ' mini' : ''}${quantileIndex === 1 ? ' median' : ''}`)
      .merge(buy)
      .transition()
      .duration(500)
      .attr("d", lineGeneratorBuyer);

     const lineGeneratorRenter = d3.line<ChartDataPoint>()
        .x((_d, year) => x(year))
        .y(d => y(d.renter.$));

    const rent = chartContent.selectAll<SVGPathElement, ChartDataPoint[]>(`.rent-line.q${quantileIndex}`)
      .data([q]);

    rent.enter()
      .append("path")
      .attr("class", `rent-line q${quantileIndex}${isMini ? ' mini' : ''}${quantileIndex === 1 ? ' median' : ''}`)
      .merge(rent)
      .transition()
      .duration(500)
      .attr("d", lineGeneratorRenter);
  }

    const showExtraLines = !isMini;

    let mortgagePaidOffYear: number = null;
    if (showExtraLines && data[1]) { // Only calculate if needed and data exists
        for (let year = 0; year < data[1].length; year++) {
             if (data[1][year]?.buyer?.house?.principalRemaining <= 0) {
                 mortgagePaidOffYear = year;
                 break;
             }
         }
    }
    const mortgageLine = chartContent.selectAll<SVGLineElement, number[]>(".mortgage-line")
      .data(mortgagePaidOffYear !== null ? [mortgagePaidOffYear] : []);
    mortgageLine.enter().append("line").attr("class", "mortgage-line")
      .merge(mortgageLine).transition().duration(500)
      .attr("x1", d => x(d)).attr("x2", d => x(d)).attr("y1", 0).attr("y2", height);
    mortgageLine.exit().remove();

    const mortgageLineLabel = chartContent.selectAll<SVGTextElement, number[]>(".mortgage-label")
      .data(mortgagePaidOffYear !== null ? [mortgagePaidOffYear] : []);
    mortgageLineLabel.enter().append("text").attr("class", "mortgage-label")
      .merge(mortgageLineLabel).transition().duration(500)
      .attr("x", d => x(d) + 5).attr("y", 110).text("Mortgage paid off");
    mortgageLineLabel.exit().remove();

    let rentCoversExpensesYear: number = null;
     if (showExtraLines && data[1]) { // Only calculate if needed and data exists
        for (let year = 0; year < data[1].length; year++) {
             if (data[1][year]?.buyer?.portfolio?.costs > 0) {
                 rentCoversExpensesYear = year;
                 break;
             }
         }
    }
    const rentCoversLine = chartContent.selectAll<SVGLineElement, number[]>(".rentcovers-line")
      .data(rentCoversExpensesYear !== null ? [rentCoversExpensesYear] : []);
    rentCoversLine.enter().append("line").attr("class", "rentcovers-line")
      .merge(rentCoversLine).transition().duration(500)
      .attr("x1", d => x(d)).attr("x2", d => x(d)).attr("y1", 0).attr("y2", height);
    rentCoversLine.exit().remove();

    const rentCoversLineLabel = chartContent.selectAll<SVGTextElement, number[]>(".rentcovers-label")
      .data(rentCoversExpensesYear !== null ? [rentCoversExpensesYear] : []);
    rentCoversLineLabel.enter().append("text").attr("class", "rentcovers-label")
      .merge(rentCoversLineLabel).transition().duration(500)
      .attr("x", d => x(d) + 5).attr("y", 160).text("Rent covers expenses");
    rentCoversLineLabel.exit().remove();
}

const legend = (point: ChartDataPoint) => {
  const { buyer, renter } = point;
  const d: [
    ['buy' | 'rent', Buyer | Renter],
    ['rent' | 'buy', Renter | Buyer]
  ] = buyer.$ < renter.$
    ? [['buy', buyer], ['rent', renter]]
    : [['rent', renter], ['buy', buyer]];
  return d.map(([key, val]) => (
    <div key={key} className={`row ${key}`}>
      <span className="square" />
      <span className="value">
        {numbro(val.$).formatCurrency({ thousandSeparated: true, mantissa: 0 })}
      </span>
      <span className="label">{key}</span>
    </div>
  ));
};

// The chart is intended to visualize the net worth of a person
//  over time, given different scenarios such as buying or
//  renting a home.
export default function Chart({isMini = false}) {
  const el = useRef<HTMLDivElement>(null);
  const [graph, setGraph] = useState<ChartInit | null>(null);
  const [pointer, setPointer] = useState(1);
  const [point, setPoint] = useState<ChartDataPoint | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  const form = useAtomValue(formAtom);
  const [chartData, setData] = useAtom(dataAtom);
  const setMeta = useSetAtom(metaAtom);
  const setDist = useSetAtom(distAtom);
  const magicRent = useAtomValue(magicRentAtom);
  // mounted vs visible states allow CSS enter/exit animations
  const [toastMounted, setToastMounted] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [modalMounted, setModalMounted] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [loadingToastMounted, setLoadingToastMounted] = useState(false);
  const [loadingToastVisible, setLoadingToastVisible] = useState(false);
  const [ellipsisCount, setEllipsisCount] = useState(0);
  const ellipsisIntervalRef = useRef<number | null>(null);
  const loadingToastShowTimeoutRef = useRef<number | null>(null);
  const loadingToastHideTimeoutRef = useRef<number | null>(null);
  const setMagicRent = useSetAtom(magicRentAtom);

  // Initialize graph
  useEffect(() => {
    if (el.current) {
       console.log('init chart, isMini:', isMini);
       const graphInstance = init(el.current, setPointer, isMini);
       setGraph(graphInstance);
       setIsLoading(true); // Start in loading state
       setHasLoadedOnce(false); // Reset loading state on new init
    }
    return () => {
      if (el.current) {
        d3.select(el.current).select('svg').remove();
        setGraph(null); // Clear graph state on unmount
      }
    };
  }, [isMini]); // Re-initialize only if isMini changes

  // Run simulation (always runs, triggered by form changes)
  useEffect(() => {
    if (isMini) {
        console.log(`Triggering mini simulation with ${MINI_CHART_SAMPLES} samples.`);
        setIsLoading(true);
        simulate(form, setMeta, setDist, setData, MINI_CHART_SAMPLES);
    } else {
        console.log("Triggering full simulation (samples determined by form input in worker).");
        setIsLoading(true);
        simulate(form, setMeta, setDist, setData);
    }
  }, [form, isMini, setMeta, setDist, setData]);

  // Manage loading toast visibility and animated ellipsis for primary chart
  useEffect(() => {
    if (isMini) {
      if (ellipsisIntervalRef.current) {
        clearInterval(ellipsisIntervalRef.current);
        ellipsisIntervalRef.current = null;
      }
      if (loadingToastShowTimeoutRef.current) {
        clearTimeout(loadingToastShowTimeoutRef.current);
        loadingToastShowTimeoutRef.current = null;
      }
      if (loadingToastHideTimeoutRef.current) {
        clearTimeout(loadingToastHideTimeoutRef.current);
        loadingToastHideTimeoutRef.current = null;
      }
      setLoadingToastVisible(false);
      setLoadingToastMounted(false);
      setEllipsisCount(0);
      return undefined;
    }

    if (isLoading) {
      if (loadingToastHideTimeoutRef.current) {
        clearTimeout(loadingToastHideTimeoutRef.current);
        loadingToastHideTimeoutRef.current = null;
      }
      setLoadingToastMounted(true);
      if (loadingToastShowTimeoutRef.current) {
        clearTimeout(loadingToastShowTimeoutRef.current);
      }
      loadingToastShowTimeoutRef.current = window.setTimeout(() => {
        setLoadingToastVisible(true);
        loadingToastShowTimeoutRef.current = null;
      }, 12);

      if (ellipsisIntervalRef.current) {
        clearInterval(ellipsisIntervalRef.current);
      }

      ellipsisIntervalRef.current = window.setInterval(() => {
        setEllipsisCount(prev => (prev + 1) % 4);
      }, 400);
    } else {
      setLoadingToastVisible(false);
      if (ellipsisIntervalRef.current) {
        clearInterval(ellipsisIntervalRef.current);
        ellipsisIntervalRef.current = null;
      }
      if (loadingToastShowTimeoutRef.current) {
        clearTimeout(loadingToastShowTimeoutRef.current);
        loadingToastShowTimeoutRef.current = null;
      }
      if (loadingToastHideTimeoutRef.current) {
        clearTimeout(loadingToastHideTimeoutRef.current);
      }
      loadingToastHideTimeoutRef.current = window.setTimeout(() => {
        setLoadingToastMounted(false);
        loadingToastHideTimeoutRef.current = null;
      }, 240);
      setEllipsisCount(0);
    }

    return () => {
      if (ellipsisIntervalRef.current) {
        clearInterval(ellipsisIntervalRef.current);
        ellipsisIntervalRef.current = null;
      }
      if (loadingToastShowTimeoutRef.current) {
        clearTimeout(loadingToastShowTimeoutRef.current);
        loadingToastShowTimeoutRef.current = null;
      }
      if (loadingToastHideTimeoutRef.current) {
        clearTimeout(loadingToastHideTimeoutRef.current);
        loadingToastHideTimeoutRef.current = null;
      }
    };
  }, [isLoading, isMini]);

  // Update graph visualization when data or graph instance changes
  useEffect(() => {
    // Only proceed if graph is initialized
    if (!graph) {
      return;
    }

    // Check if graph is initialized and data is available
    if (graph && chartData && chartData[1] && chartData[1].length > 0) {
       console.log('update chart visualization, isMini:', isMini);
       const [svg, x, xAxis, y, yAxis] = graph;
       update(svg, x, xAxis, y, yAxis, chartData, isMini);
      // Set loading false AFTER update potentially draws something
      setIsLoading(false);
      // Set hasLoadedOnce to true after the first successful load
      if (!hasLoadedOnce) {
          setHasLoadedOnce(true);
      }
    } else {
      // If data is invalid/empty, clear chart and stay in loading state (or handle as error)
      console.log('Chart data invalid or empty, clearing visualization.');
      const chartContent = graph[0]?.select<SVGGElement>('g');
      chartContent?.selectAll("path, line, text").remove();
      setIsLoading(true); // Keep showing loader if data is bad/empty
    }
  }, [chartData, graph, isMini, hasLoadedOnce]);

  // Show modal while searching; show toast briefly on success/error
  useEffect(() => {
    if (isMini) return undefined;

    let t: number | undefined;

    if (magicRent.status === 'searching') {
      // mount then show for enter animation
      setModalMounted(true);
      // small delay to ensure mounted before visible toggle (helps some browsers)
      setTimeout(() => setModalVisible(true), 12);
      // hide toast when starting
      setToastVisible(false);
    } else {
      // hide modal with exit animation then unmount
      setModalVisible(false);
      // keep mounted long enough for CSS transition (200ms)
      setTimeout(() => setModalMounted(false), 240);

      if (magicRent.status === 'success' || magicRent.status === 'error') {
        // mount toast, then show
        setToastMounted(true);
        setTimeout(() => setToastVisible(true), 12);
        // auto-hide after 4s (start hide animation), then unmount
        t = window.setTimeout(() => {
          setToastVisible(false);
          setTimeout(() => setToastMounted(false), 240);
        }, 4000);
      }
    }

    return () => {
      if (t) clearTimeout(t);
    };
  }, [magicRent.status, isMini]);

  // Update legend point based on hover (always active now)
  useEffect(() => {
    // Only proceed if data is valid (median exists and has length)
    if (chartData && chartData[1] && chartData[1].length > 0) {
        const median = chartData[1];
        const years = median.length;
        let indexToShow: number;

        if (pointer === 1 || years <= 1) {
            indexToShow = years > 0 ? years - 1 : 0; // Handle empty or single year case
        } else {
            // Ensure calculation is safe
            indexToShow = Math.max(0, Math.min(years - 1, Math.floor((years -1) * pointer)));
        }

        // Final check on index validity
        if (indexToShow >= 0 && indexToShow < median.length) {
            setPoint(median[indexToShow]);
        } else {
             // If index somehow becomes invalid, default to last point or null
             setPoint(years > 0 ? median[years - 1] : null);
        }
    } else {
        setPoint(null); // Set to null if no valid data
    }
  }, [chartData, pointer]);

  return (
    <div className={cls("chart", isMini && "mini-chart", hasLoadedOnce && "loaded")}>
      {!isMini && (
        <div className="chart-header">
          <h3 className="title">Projected net worth over time</h3>
          <p className="subtitle">Simulated buyer vs renter net worth across your horizon.</p>
          {loadingToastMounted && (
            <div className={`chart-loading-toast ${loadingToastVisible ? 'visible' : 'hidden'}`} role="status">
              <LoadingDots isLoading={isLoading} />
            </div>
          )}
        </div>
      )}

      {/* Modal shown during search */}
      {!isMini && modalMounted && (
        <div className="magic-modal-overlay">
          <div className={`magic-modal ${modalVisible ? 'visible' : 'hidden'}`} role="dialog" aria-modal="true">
            <Loader />
            <div className="magic-modal-message">{magicRent.message ?? 'Searching for break-even rent…'}</div>
            <div className="magic-modal-iteration">Iteration {magicRent.iteration || 0}</div>
            {typeof magicRent.diff === 'number' && (
              <div className="magic-modal-diff">Δ {magicRent.diff >= 0 ? '+' : ''}{magicRent.diff.toLocaleString()}</div>
            )}
            <div className="magic-modal-progress">
              <div className="magic-modal-progress__bar" style={{width: `${Math.round((magicRent.iteration / (magicRent.total || 12)) * 100)}%`}} />
            </div>
            <div className="magic-modal-actions">
              <button
                className="magic-modal-cancel"
                onClick={() => {
                  try { magicRent.controller?.abort(); } catch (e) {}
                  setMagicRent({ status: 'idle', message: 'Cancelled', iteration: 0, diff: null, total: null, controller: null });
                  // start exit animation
                  setModalVisible(false);
                  setTimeout(() => setModalMounted(false), 240);
                }}
              >Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast on success/error */}
      {!isMini && toastMounted && magicRent.message && (
        <div className={`magic-toast ${magicRent.status} ${toastVisible ? 'visible' : 'hidden'}`} role={magicRent.status === 'error' ? 'alert' : 'status'}>
          {magicRent.message}
        </div>
      )}

      {point && (
        <div className={`legend ${pointer < 0.5 ? 'right' : 'left'}`}>
          {legend(point)}
        </div>
      )}

      <div ref={el} className="svg" />
    </div>
  );
};
