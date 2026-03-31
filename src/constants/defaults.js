// Developer wizard defaults
export const DEVELOPER_DEFAULTS = {
  usableAcres: 50,
  acresPerMW: 6.5,
  annualDegradation: 0.5,
  ppaPricePerMWh: 55,
  ppaEscalation: 1.0,
  contractTermYears: 25,
  epcCostPerW: 1.05,
  omCostPerKWYr: 17,
  omEscalation: 2.0,
  itcRate: 30,
  stateIncentivePerW: 0,
  gridConnectionCostPerMW: 100000,
  debtRatio: 65,
  interestRate: 6.5,
  loanTermYears: 18,
  discountRate: 8.0,
}

// Owner wizard defaults
export const OWNER_DEFAULTS = {
  usableAcres: 25,
  leaseRatePerAcreYr: 1200,
  leaseEscalation: 2.0,
  leaseTerm: 25,
  shadeLevel: 'none',
  gridDistanceMiles: 0.5,
}

// MACRS 5-year depreciation schedule
export const MACRS_5YR = [0.20, 0.32, 0.192, 0.1152, 0.1152, 0.0576]

export const FEDERAL_TAX_RATE = 0.21

// Typical lease rates by region ($/acre/yr) — used as fallback
export const REGIONAL_LEASE_RATES = {
  Northeast: 1400,
  Southeast: 1100,
  Midwest:   1000,
  Southwest:  900,
  West:      1200,
}

export const ACRES_PER_MW_OPTIONS = [
  { label: 'Fixed-tilt (5–6 acres/MW)', value: 5.5 },
  { label: 'Fixed-tilt standard (6–7 acres/MW)', value: 6.5 },
  { label: 'Single-axis tracker (7–8 acres/MW)', value: 7.5 },
]

export const SHADE_LEVELS = [
  { label: 'None — full sun all day', value: 'none',   derate: 0 },
  { label: 'Minimal — partial shade <2h', value: 'minimal', derate: 0.03 },
  { label: 'Moderate — partial shade 2–4h', value: 'moderate', derate: 0.07 },
  { label: 'Significant — heavy shade', value: 'significant', derate: 0.15 },
]
