import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { useAtom, useAtomValue } from 'jotai';
import { sensitivityAtom, type SensitivityResult } from '../../atoms/sensitivityAtom';
import { formAtom } from '../../atoms/formAtom';
import { magicRentAtom } from '../../atoms/magicRentAtom';
import { magicAppreciationAtom } from '../../atoms/magicAppreciationAtom';
import LoadingDots from '../common/LoadingDots';
import './keyfactors.less';

const N_BASE_SAMPLES = 512;
const DEBOUNCE_DELAY = 1500;

// Theme buckets
type VariableTheme = 'price' | 'cost' | 'mortgage' | 'rent' | 'appreciation' | 'investment' | 'other';

interface VariableDef {
  path: string;
  label: string;
  theme: VariableTheme;
}

// The order of variables now matches the form and the user request.
// Paths have been corrected to align with the form state structure.
const VARIABLES: VariableDef[] = [
  { path: 'house.price', label: "Price", theme: 'price' },
  { path: 'house.maintenance', label: "Maintenance", theme: 'cost' },
  { path: 'house.propertyTax', label: "Property taxes", theme: 'cost' },
  { path: 'house.insurance', label: "Homeowner's insurance", theme: 'cost' },
  { path: 'rates.house.expenses', label: "Expenses increases", theme: 'cost' },
  { path: 'house.closingCosts', label: "Closing costs", theme: 'cost' },
  { path: 'house.downpayment', label: "Downpayment", theme: 'mortgage' },
  { path: 'rates.interest.initial', label: "Current interest rate", theme: 'mortgage' },
  { path: 'rates.interest.future', label: "Future interest rate", theme: 'mortgage' },
  { path: 'rent.current', label: "Rent", theme: 'rent' },
  { path: 'rates.rent.controlled', label: "Rent increases", theme: 'rent' },
  { path: 'rent.market', label: "Market rent", theme: 'rent' },
  { path: 'rates.rent.market', label: "Market rent increases", theme: 'rent' },
  { path: 'rates.house.appreciation', label: "Property appreciation", theme: 'appreciation' },
  { path: 'rent.rentalIncome', label: "Rental income", theme: 'rent' },
  { path: 'rates.rent.rentalIncome', label: "Rental income increases", theme: 'rent' },
  { path: 'rates.bonds.return', label: "Safe investment return", theme: 'investment' },
  { path: 'rates.bonds.capitalGainsTax', label: "Capital gains tax", theme: 'investment' },
  { path: 'scenarios.crash.chance', label: "Property price drop chance", theme: 'appreciation' },
  { path: 'scenarios.crash.drop', label: "Property price drop amount", theme: 'appreciation' },
  { path: 'scenarios.move.tenureYears', label: "Years before moving", theme: 'other' },
  { path: 'scenarios.move.annualMoveUpCost', label: "New home premium", theme: 'other' },
  { path: 'scenarios.mortgage.anniversaryPaydown', label: "Principal prepayment", theme: 'mortgage' },
];

// Color palette per theme (solid, no gradients)
const THEME_COLORS: Record<VariableTheme, string> = {
  price: '#3b82f6',        // bright blue
  cost: '#9ca3af',         // neutral gray
  mortgage: '#5777d7',     // primary blue
  rent: '#e6a524',         // rent yellow/orange
  appreciation: '#22c55e', // green
  investment: '#8b5cf6',   // purple
  other: '#6b7280',        // muted
};

const FALLBACK_COLOR = '#5777d7';

const getColorForVariable = (v: VariableDef): string =>
  THEME_COLORS[v.theme] || FALLBACK_COLOR;

const normalizeResults = (results: SensitivityResult[]): SensitivityResult[] =>
  results.map(r => ({
    ...r,
    s1: Math.max(0, r.s1 ?? 0),
    st: Math.max(0, r.st ?? 0),
  }));

const drawChart = (
  svgRef: React.RefObject<SVGSVGElement>,
  rawResults: SensitivityResult[]
) => {
  const svgEl = svgRef.current;
  if (!svgEl || !rawResults || rawResults.length === 0) {
    return;
  }

  // Normalize and pair each result with its variable definition by index.
  const normalized = normalizeResults(rawResults);

  const paired = normalized.map((res, i) => {
    const def = VARIABLES.find(v => v.label === res.variable);
    return {
      label: res.variable || def?.label || `Input ${i + 1}`,
      st: res.st,
      s1: res.s1,
      color: def ? getColorForVariable(def) : FALLBACK_COLOR,
    };
  });

  // Display variables in the order they appear in the form, not sorted by importance.
  const data = paired;

  const svg = d3.select(svgEl);

  // DATA JOIN with key on label so we can smoothly animate between states.
  const bounds = svgEl.getBoundingClientRect();
  if (!bounds.width || !bounds.height) return;

  const margin = { top: 14, right: 50, bottom: 26, left: 120 };
  const width = Math.max(0, bounds.width - margin.left - margin.right);
  const height = Math.max(0, bounds.height - margin.top - margin.bottom);

  const maxST = d3.max(data, d => d.st) || 0;
  const domainMax = Math.max(0.25, Math.min(1, maxST * 1.08 || 0.5));

  const x = d3.scaleLinear().domain([0, domainMax]).range([0, width]);
  const y = d3
    .scaleBand<string>()
    .domain(data.map(d => d.label))
    .range([0, height])
    .padding(0.3);

  // Root group
  let g = svg.select<SVGGElement>('g.kf-root');
  if (g.empty()) {
    g = svg
      .append('g')
      .attr('class', 'kf-root')
      .attr('transform', `translate(${margin.left},${margin.top})`);
  } else {
    g.attr('transform', `translate(${margin.left},${margin.top})`);
  }

  // GRID ------------------------------------------------------------------
  const grid = g.selectAll<SVGLineElement, number>('line.grid-line').data(
    x.ticks(4).filter(t => t > 0),
  );

  grid
    .enter()
    .append('line')
    .attr('class', 'grid-line')
    .attr('y1', 0)
    .attr('y2', height)
    .merge(grid as any)
    .attr('x1', d => x(d))
    .attr('x2', d => x(d));

  grid.exit().remove();

  // X AXIS ----------------------------------------------------------------
  const xAxis = d3.axisBottom(x).ticks(4).tickFormat(d3.format('.0%'));

  let xAxisG = g.select<SVGGElement>('g.x-axis');
  if (xAxisG.empty()) {
    xAxisG = g
      .append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${height})`);
  } else {
    xAxisG.attr('transform', `translate(0,${height})`);
  }
  xAxisG.call(xAxis as any);
  xAxisG
    .selectAll('text')
    .attr('class', 'x-axis-label');

  // Y AXIS ----------------------------------------------------------------
  const yAxis = d3.axisLeft(y).tickSize(0);

  let yAxisG = g.select<SVGGElement>('g.y-axis');
  if (yAxisG.empty()) {
    yAxisG = g.append('g').attr('class', 'y-axis');
  }
  yAxisG.call(yAxis as any);
  yAxisG
    .selectAll('text')
    .attr('class', 'y-axis-label')
    .attr('dy', '0.35em');

  // BARS ------------------------------------------------------------------
  const barH = y.bandwidth();

  const rows = g
    .selectAll<SVGGElement, typeof data[number]>('g.bar-row')
    .data(data, (d: any) => d.label);

  // EXIT rows
  rows
    .exit()
    .transition()
    .duration(300)
    .style('opacity', 0)
    .remove();

  // ENTER rows
  const rowsEnter = rows
    .enter()
    .append('g')
    .attr('class', 'bar-row')
    .attr('transform', d => `translate(0,${y(d.label) || 0})`)
    .style('opacity', 0);

  rowsEnter
    .append('rect')
    .attr('class', 'bar')
    .attr('x', 0)
    .attr('y', barH * 0.2)
    .attr('height', barH * 0.6)
    .attr('width', 0)
    .attr('fill', d => d.color);

  rowsEnter
    .append('text')
    .attr('class', 'value-label')
    .attr('y', barH / 2)
    .attr('dy', '0.35em')
    .attr('x', width + 8)
    .style('text-anchor', 'start')
    .style('opacity', 0);

  // UPDATE + ENTER MERGE --------------------------------------------------
  const rowsMerge = rowsEnter.merge(rows as any);

  rowsMerge
    .transition()
    .duration(450)
    .attr('transform', d => `translate(0,${y(d.label) || 0})`)
    .style('opacity', 1);

  rowsMerge
    .select('rect.bar')
    .transition()
    .duration(450)
    .ease(d3.easeCubicOut)
    .attr('width', d => x(Math.min(domainMax, d.st)));

  rowsMerge
    .select('text.value-label')
    .text(d => {
      const pct = d.st * 100;
      if (!isFinite(pct) || pct <= 0) return '0%';
      if (pct < 1) return '<1%';
      return `${pct.toFixed(0)}%`;
    })
    .transition()
    .duration(450)
    .style('opacity', 1);

  // Ensure SVG has explicit width/height attributes to avoid layout flicker.
  svg
    .attr('width', '100%')
    .attr('height', '100%');
};

interface KeyFactorsProps {
  isActive: boolean;
}

const KeyFactors: React.FC<KeyFactorsProps> = ({ isActive }) => {
  const [sensitivityState, setSensitivityState] = useAtom(sensitivityAtom);
  const formState = useAtomValue(formAtom);

  const svgRef = useRef<SVGSVGElement>(null);
  const workerRef = useRef<Worker | null>(null);
  const debounceRef = useRef<number>();
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [loadingToastMounted, setLoadingToastMounted] = useState(false);
  const [loadingToastVisible, setLoadingToastVisible] = useState(false);

  const magicRent = useAtomValue(magicRentAtom);
  const magicAppreciation = useAtomValue(magicAppreciationAtom);

  const activeMagicSearch =
    magicRent.status === 'searching'
      ? { ...magicRent, type: 'rent' as const }
      : magicAppreciation.status === 'searching'
      ? { ...magicAppreciation, type: 'appreciation' as const }
      : null;

  // Debounced run using the fixed VARIABLES list in the correct order.
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }

    setSensitivityState(prev => ({
      ...prev,
      status: 'running',
      // Keep previous results visible while new run is pending so the chart can animate.
      results: prev.results || null,
      progress: 0,
      message: 'Updating key factors based on your latest inputs…',
    }));

    // Show loading toast when analysis starts
    setLoadingToastMounted(true);
    setTimeout(() => setLoadingToastVisible(true), 12);

    debounceRef.current = window.setTimeout(() => {
      // Corrected and cleaned-up logic for finding ranged variables.
      const variablesWithRanges = VARIABLES.filter(v => {
        try {
          const segments = v.path.split('.');
          let node: any = formState;
          for (const s of segments) {
            if (node == null) {
              return false; // Path does not exist
            }
            node = node[s];
          }
          // A valid leaf node is a tuple: [value, type]
          if (Array.isArray(node)) {
            const rawValue = node[0];
            return typeof rawValue === 'string' && rawValue.includes(' - ');
          }
          return false;
        } catch {
          return false;
        }
      });

      if (!variablesWithRanges.length) {
        setSensitivityState({
          status: 'success',
          results: [],
          progress: 1,
          message: 'Add ranges (e.g. "3% - 5%") to see which assumptions matter most.',
        });
        setLoadingToastVisible(false);
        setTimeout(() => {
          setLoadingToastMounted(false);
        }, 240);
        return;
      }

      try {
        // @ts-ignore bundler provides import.meta.url
        const worker = new Worker(new URL('../../modules/sensitivity.worker.ts', import.meta.url));
        workerRef.current = worker;

        worker.onmessage = (event: MessageEvent<any>) => {
          const { action, result, progress, message } = event.data || {};

          if (action === 'progress') {
            setSensitivityState(prev => ({
              ...prev,
              status: 'running',
              progress: typeof progress === 'number' ? progress : prev.progress,
              message: 'Running Monte Carlo sensitivity…',
            }));
            return;
          }

          if (action === 'result') {
            setSensitivityState({
              status: 'success',
              results: Array.isArray(result) ? result : [],
              progress: 1,
              message: 'Key drivers computed.',
            });
            
            // Hide loading toast when results are ready
            setLoadingToastVisible(false);
            setTimeout(() => {
              setLoadingToastMounted(false);
            }, 240);
            
            if (!hasLoadedOnce && Array.isArray(result) && result.length > 0) {
              setHasLoadedOnce(true);
            }
            return;
          }

          if (action === 'error') {
            setSensitivityState({
              status: 'error',
              results: null,
              progress: 0,
              message: message || 'Unable to compute key factors.',
            });
            setLoadingToastVisible(false);
            setTimeout(() => {
              setLoadingToastMounted(false);
            }, 240);
          }
        };

        worker.onerror = () => {
          setSensitivityState({
            status: 'error',
            results: null,
            progress: 0,
            message: 'Sensitivity analysis failed to run in this environment.',
          });
          setLoadingToastVisible(false);
          setTimeout(() => {
            setLoadingToastMounted(false);
          }, 240);
        };

        worker.postMessage({
          inputs: formState,
          // IMPORTANT: send only ranged variables, but preserve their relative order.
          variables: variablesWithRanges.map(v => ({ path: v.path, label: v.label })),
          N_base: N_BASE_SAMPLES,
        });
      } catch {
        setSensitivityState({
          status: 'error',
          results: null,
          progress: 0,
          message: 'Could not start the sensitivity worker.',
        });
        setLoadingToastVisible(false);
        setTimeout(() => {
          setLoadingToastMounted(false);
        }, 240);
      }
    }, DEBOUNCE_DELAY);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [formState, setSensitivityState]);


  // Draw chart when results ready AND tab is active
  useEffect(() => {
    if (
      isActive &&
      sensitivityState.status === 'success' &&
      sensitivityState.results &&
      sensitivityState.results.length > 0
    ) {
      drawChart(svgRef, sensitivityState.results);
    }
  }, [isActive, sensitivityState.status, sensitivityState.results]);

  const renderContent = () => {
    const { status, results, message } = sensitivityState;

    if ((status === 'success' || status === 'running') && results && results.length > 0) {
      return <svg ref={svgRef} className="chart-svg" width="100%" height="100%" />;
    }

    if (status === 'running') {
      return (
        <div className="key-factors-chart__placeholder">
          <p className="main-text">{message || 'Running sensitivity analysis…'}</p>
          <p className="sub-text">
            Measuring how strongly each assumption moves your final net worth.
          </p>
        </div>
      );
    }

    if (status === 'error') {
      return (
        <div className="key-factors-chart__placeholder key-factors-chart__placeholder--error">
          <p className="main-text">Couldn’t compute key factors.</p>
          <p className="sub-text">
            {message || 'Try adjusting your inputs or reloading the page.'}
          </p>
        </div>
      );
    }

    if (status === 'success' && results && results.length === 0) {
      return (
        <div className="key-factors-chart__placeholder">
          <p className="main-text">Add uncertainty to reveal key drivers.</p>
          <p className="sub-text">
            Use ranges like "3% - 5%" for any key inputs. We’ll show which ones
            actually drive your outcome.
          </p>
        </div>
      );
    }

    // Initial idle
    return (
      <div className="key-factors-chart__placeholder">
        <p className="main-text">Key Factors</p>
        <p className="sub-text">
          Once you specify ranges (e.g. "3% - 5%") for key inputs, this panel will
          show which assumptions matter most.
        </p>
      </div>
    );
  };

  const isLoading =
    !!activeMagicSearch ||
    sensitivityState.status === 'running' ||
    (sensitivityState.status === 'idle' && !hasLoadedOnce);

  return (
    <section
      className={`key-factors-chart ${isLoading ? 'is-loading' : ''} ${activeMagicSearch ? 'is-searching' : ''}`}
      aria-label="Key drivers of your simulated net worth"
    >
      <div className="key-factors-chart__header">
        <div>
          <h3 className="key-factors-chart__title">
            Key factors driving your result
          </h3>
          <p className="key-factors-chart__subtitle">
            Based on Sobol sensitivity of your final net worth.
          </p>
        </div>
        {/* Element removed as per request */}
      </div>
      <div className="key-factors-chart__container">
        {/* Toast during loading */}
        {isLoading && (
          <div className={`key-factors-chart__toast visible`} role="status">
            <LoadingDots isLoading={true} />
          </div>
        )}
        {/* Subtle white overlay while loading */}
        <div className="key-factors-chart__overlay" aria-hidden="true" />
        {renderContent()}
      </div>
    </section>
  );
};

export default KeyFactors;
