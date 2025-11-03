import { type CarryingCostCategory } from '../interfaces';

export const CARRYING_COST_CATEGORIES: CarryingCostCategory[] = [
  'interest',
  'property_tax',
  'insurance',
  'maintenance',
  'hoa',
  'other'
];

export const EXPENSE_ONLY_CATEGORIES: CarryingCostCategory[] = [
  'maintenance',
  'property_tax',
  'insurance',
  'hoa',
  'other'
];

export const CARRYING_COST_LABELS: Record<CarryingCostCategory, string> = {
  interest: 'Interest',
  property_tax: 'Property tax',
  insurance: 'Insurance',
  maintenance: 'Maintenance',
  hoa: 'HOA / fees',
  other: 'Other'
};

const palette = {
  buyPrimary: '#52BD95',
  buyLight: '#93c9b5',
  rentPrimary: '#e6a524',
  rentLight: '#f7c664',
  affordPrimary: '#c1c4d6',
  affordLight: '#E6E8F0'
};

export const CARRYING_COST_COLORS: Record<CarryingCostCategory, string> = {
  interest: palette.buyPrimary,
  property_tax: palette.buyLight,
  insurance: palette.rentPrimary,
  maintenance: palette.rentLight,
  hoa: palette.affordPrimary,
  other: palette.affordLight
};

export const CARRYING_COST_DESCRIPTIONS: Record<CarryingCostCategory, string> = {
  interest: 'Mortgage interest charged this month.',
  property_tax: 'Monthly share of the annual property tax bill.',
  insurance: 'Home and contents insurance premiums.',
  maintenance: 'Ongoing upkeep, repairs, or condo fees.',
  hoa: 'Homeowners association or strata dues.',
  other: 'Any other recurring housing expenses you entered.'
};

export type CarryingCostLineKey =
  | 'gross'
  | 'net'
  | 'rent'
  | 'grossWithOpportunity'
  | 'opportunity'
  | 'rentalIncome'
  | 'equityDelta'
  | 'principal'
  | 'appreciation';

export const CARRYING_COST_LINE_DESCRIPTIONS: Record<CarryingCostLineKey, string> = {
  gross: 'All monthly carrying costs (interest + expenses) minus rental income.',
  net: 'Gross carrying cost minus the equity you gained (principal plus appreciation).',
  rent: 'What you would spend on rent for the comparable property this month.',
  grossWithOpportunity: 'Gross carrying cost plus the opportunity cost of tying up cash and equity.',
  opportunity: 'Estimated foregone investment returns on equity and cash tied up in the home.',
  rentalIncome: 'Rental income collected this month which offsets carrying costs.',
  equityDelta: 'Total equity gained this month from mortgage paydown and appreciation.',
  principal: 'Portion of the mortgage payment that reduced the loan balance.',
  appreciation: 'Equity increase from the property rising in value this month.'
};
