import React, { useMemo } from 'react';
import numbro from 'numbro';
import { useAtomValue } from 'jotai';
import { carryingCostAtom } from '../../atoms/carryingCostAtom';
import {
  CARRYING_COST_CATEGORIES,
  CARRYING_COST_COLORS,
  CARRYING_COST_DESCRIPTIONS,
  CARRYING_COST_LABELS,
  CARRYING_COST_LINE_DESCRIPTIONS
} from '../../modules/carryingCostConfig';
import {
  calculateCarryingCostMetrics,
  formatMonthLabel,
  formatMonthLabelDetailed,
  trailingAverage
} from '../../modules/carryingCostHelpers';
import { type CarryingCostSeriesPoint } from '../../interfaces';
import './carrying-costs.less';

const TRAILING_WINDOW = 12;

const formatCurrency = (value: number): string => {
  const normalized = Math.abs(value) < 0.5 ? 0 : value;
  return numbro(normalized).formatCurrency({
    thousandSeparated: true,
    mantissa: 0
  });
};

type TableRow = {
  key: string;
  label: string;
  description: string;
  value: number | string;
  averageValue?: number;
  hint?: string;
  variant?: 'bold' | 'negative';
  accentColor?: string;
};

const METRIC_DESCRIPTIONS: Record<string, string> = {
  peakGross: 'Highest median gross carrying cost observed over the simulation horizon.',
  averageGross: 'Average gross carrying cost across the first part of the projection.',
  breakeven: 'When the median net carrying cost plus opportunity cost falls below the comparable rent.'
};

const renderValue = (input: number | string): string => (
  typeof input === 'number' ? formatCurrency(input) : input
);

const InfoIcon: React.FC = () => (
  <svg
    className="info-icon"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="10"></circle>
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
    <line x1="12" y1="17" x2="12.01" y2="17"></line>
  </svg>
);

interface CarryingCostTableProps {
  isActive: boolean;
}

const CarryingCostTable: React.FC<CarryingCostTableProps> = ({ isActive }) => {
  const series = useAtomValue(carryingCostAtom);
  const hasSeries = series.length > 0;

  const metrics = useMemo(
    () => (hasSeries ? calculateCarryingCostMetrics(series) : null),
    [hasSeries, series]
  );

  const windowSize = hasSeries
    ? Math.max(1, Math.min(series.length, TRAILING_WINDOW))
    : 1;

  const averages = useMemo(() => {
    if (!hasSeries) {
      return null;
    }

    const valueFromSeries = (pick: (point: CarryingCostSeriesPoint) => number) => (
      trailingAverage(series.map(pick), windowSize)
    );

    const componentAverages = Object.fromEntries(
      CARRYING_COST_CATEGORIES.map(category => [
        category,
        valueFromSeries(point => point.components[category])
      ])
    ) as Record<typeof CARRYING_COST_CATEGORIES[number], number>;

    return {
      size: windowSize,
      gross: valueFromSeries(point => point.gross),
      grossWithOpportunity: valueFromSeries(point => point.gross + point.opportunityCost),
      net: valueFromSeries(point => point.net),
      rent: valueFromSeries(point => point.rent),
      opportunity: valueFromSeries(point => point.opportunityCost),
      rentalIncome: valueFromSeries(point => point.rentalIncome),
      equityDelta: valueFromSeries(point => point.equityDelta),
      principal: valueFromSeries(point => point.principal),
      appreciation: valueFromSeries(point => point.appreciation),
      components: componentAverages
    };
  }, [hasSeries, series, windowSize]);

  const latest = hasSeries ? series[series.length - 1] : null;

  if (!isActive || !latest || !averages) {
    return null;
  }

  const averageLabel = averages.size === 1
    ? 'Last month'
    : `Avg last ${averages.size} mo`;

  const lineRows: TableRow[] = [
    {
      key: 'gross',
      label: 'Gross carrying cost',
      description: CARRYING_COST_LINE_DESCRIPTIONS.gross,
      value: latest.gross,
      averageValue: averages.gross,
      variant: 'bold'
    },
    {
      key: 'grossWithOpportunity',
      label: 'Gross + opportunity',
      description: CARRYING_COST_LINE_DESCRIPTIONS.grossWithOpportunity,
      value: latest.gross + latest.opportunityCost,
      averageValue: averages.grossWithOpportunity
    },
    {
      key: 'net',
      label: 'Net carrying cost',
      description: CARRYING_COST_LINE_DESCRIPTIONS.net,
      value: latest.net,
      averageValue: averages.net
    },
    {
      key: 'rent',
      label: 'Comparable rent',
      description: CARRYING_COST_LINE_DESCRIPTIONS.rent,
      value: latest.rent,
      averageValue: averages.rent
    },
    {
      key: 'opportunity',
      label: 'Opportunity cost',
      description: CARRYING_COST_LINE_DESCRIPTIONS.opportunity,
      value: latest.opportunityCost,
      averageValue: averages.opportunity
    },
    {
      key: 'rentalIncome',
      label: 'Rental income offset',
      description: CARRYING_COST_LINE_DESCRIPTIONS.rentalIncome,
      value: -latest.rentalIncome,
      averageValue: -averages.rentalIncome,
      variant: 'negative'
    }
  ];

  const equityRows: TableRow[] = [
    {
      key: 'equityDelta',
      label: 'Equity gained',
      description: CARRYING_COST_LINE_DESCRIPTIONS.equityDelta,
      value: latest.equityDelta,
      averageValue: averages.equityDelta
    },
    {
      key: 'principal',
      label: 'Principal paid',
      description: CARRYING_COST_LINE_DESCRIPTIONS.principal,
      value: latest.principal,
      averageValue: averages.principal
    },
    {
      key: 'appreciation',
      label: 'Appreciation',
      description: CARRYING_COST_LINE_DESCRIPTIONS.appreciation,
      value: latest.appreciation,
      averageValue: averages.appreciation
    }
  ];

  const expenseRows: TableRow[] = CARRYING_COST_CATEGORIES.map(category => ({
    key: category,
    label: CARRYING_COST_LABELS[category],
    description: CARRYING_COST_DESCRIPTIONS[category],
    value: latest.components[category],
    averageValue: averages.components[category],
    accentColor: CARRYING_COST_COLORS[category]
  }));

  const milestoneRows: TableRow[] = [];

  if (metrics?.peakGross) {
    milestoneRows.push({
      key: 'peakGross',
      label: 'Peak gross monthly cost',
      description: METRIC_DESCRIPTIONS.peakGross,
      value: metrics.peakGross.value,
      hint: `at ${formatMonthLabelDetailed(metrics.peakGross.month)}`
    });
  }

  if (metrics?.averageGross) {
    milestoneRows.push({
      key: 'averageGross',
      label: `Average gross (first ${metrics.averageGross.months} mo)`,
      description: METRIC_DESCRIPTIONS.averageGross,
      value: metrics.averageGross.value
    });
  }

  if (metrics) {
    milestoneRows.push({
      key: 'breakeven',
      label: 'Net cheaper than rent',
      description: METRIC_DESCRIPTIONS.breakeven,
      value: metrics.breakeven ? formatMonthLabelDetailed(metrics.breakeven.month) : 'Not reached',
      hint: metrics.breakeven ? `Net + opportunity vs rent: ${formatCurrency(metrics.breakeven.value)}` : undefined
    });
  }

  const renderRow = (row: TableRow) => (
    <div
      key={row.key}
      className={`item${row.variant ? ` ${row.variant}` : ''}`}
    >
      <div className="item-label">
        {row.accentColor && <span className="swatch" style={{ backgroundColor: row.accentColor }} />}
        <span className="label">{row.label}</span>
        <span
          className="info"
          title={row.description}
          aria-label={row.description}
          data-tooltip={row.description}
          role="img"
        >
          <InfoIcon />
        </span>
      </div>
      <span className="dot" />
      <div className="item-values">
        <span className="value">{renderValue(row.value)}</span>
        {typeof row.averageValue === 'number' && (
          <span className="avg">{averageLabel}: {renderValue(row.averageValue)}</span>
        )}
        {row.hint && (
          <span className="hint">{row.hint}</span>
        )}
      </div>
    </div>
  );

  return (
    <div className="carrying-costs">
      <div className="cc-table table">
      <div className="header">
        <h3 className="h3 title">Carrying cost breakdown</h3>
        <div className="cc-table__meta">
          <span className="cc-table__meta-item">{formatMonthLabelDetailed(latest.absoluteMonth)}</span>
          <span className="cc-table__meta-separator" aria-hidden>•</span>
          <span className="cc-table__meta-item">Median scenario</span>
        </div>
      </div>
      <div className="list">
        <div className="group">
          <div className="group-title">Line items</div>
          {lineRows.map(renderRow)}
        </div>
        <div className="group">
          <div className="group-title">Equity adjustments</div>
          {equityRows.map(renderRow)}
        </div>
        <div className="group">
          <div className="group-title">Monthly expenses</div>
          {expenseRows.map(renderRow)}
        </div>
        <div className="group">
          <div className="group-title">Milestones</div>
          {milestoneRows.map(renderRow)}
        </div>
      </div>
      </div>
    </div>
  );
};

export default CarryingCostTable;
