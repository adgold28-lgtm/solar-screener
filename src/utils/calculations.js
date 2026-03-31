import { MACRS_5YR, FEDERAL_TAX_RATE } from '../constants/defaults'

// ─── IRR / NPV helpers ───────────────────────────────────────────────────────

function npvAtRate(cashflows, rate) {
  return cashflows.reduce((sum, cf, t) => sum + cf / Math.pow(1 + rate, t), 0)
}

function calculateIRR(cashflows) {
  // Bisection method — reliable, handles sign changes
  let lo = -0.5, hi = 2.0
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2
    const v = npvAtRate(cashflows, mid)
    if (Math.abs(v) < 0.01) return mid * 100 // %
    if (v > 0) lo = mid
    else hi = mid
  }
  return ((lo + hi) / 2) * 100
}

// ─── Developer financial model ───────────────────────────────────────────────

export function calculateDeveloperFinancials(inputs) {
  const {
    systemCapacityMW,
    capacityFactor,        // decimal e.g. 0.22
    annualDegradation,     // % e.g. 0.5
    ppaPricePerMWh,        // $/MWh
    ppaEscalation,         // % e.g. 1.0
    epcCostPerW,           // $/W e.g. 1.05
    omCostPerKWYr,         // $/kW/yr
    omEscalation,          // % e.g. 2.0
    itcRate,               // % e.g. 30
    stateIncentivePerW,    // $/W
    gridConnectionCostPerMW,
    debtRatio,             // % e.g. 65
    interestRate,          // % e.g. 6.5
    loanTermYears,         // e.g. 18
    discountRate,          // % e.g. 8.0
  } = inputs

  const systemKW = systemCapacityMW * 1000

  // ── Capital costs ──
  const epcCost        = systemKW * epcCostPerW
  const gridCost       = systemCapacityMW * (gridConnectionCostPerMW || 0)
  const totalCapex     = epcCost + gridCost
  const stateIncentive = systemKW * (stateIncentivePerW || 0)
  const itcAmount      = totalCapex * (itcRate / 100)
  const netCapex       = totalCapex - stateIncentive  // ITC applied as tax credit in year 1

  // Depreciable basis: IRS requires 50% of ITC reduces basis
  const depreciableBasis = totalCapex * (1 - (itcRate / 100) / 2)

  // ── Debt structure ──
  const debtAmount = netCapex * (debtRatio / 100)
  const equity     = netCapex - debtAmount
  const r          = (interestRate / 100) / 12
  const n          = loanTermYears * 12
  const monthlyPmt = r > 0
    ? debtAmount * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
    : debtAmount / n
  const annualDebtService = monthlyPmt * 12

  // ── Year 1 production ──
  const annualProductionMWh = systemCapacityMW * capacityFactor * 8760

  // ── 25-year cashflows ──
  const cashflows = []
  let remainingDebt = debtAmount

  for (let yr = 1; yr <= 25; yr++) {
    const degFactor  = Math.pow(1 - annualDegradation / 100, yr - 1)
    const production = annualProductionMWh * degFactor
    const ppaPrice   = ppaPricePerMWh * Math.pow(1 + ppaEscalation / 100, yr - 1)
    const revenue    = production * ppaPrice
    const omCost     = systemKW * omCostPerKWYr * Math.pow(1 + omEscalation / 100, yr - 1)
    const ebitda     = revenue - omCost

    // Debt service
    const inDebt        = yr <= loanTermYears && remainingDebt > 0
    const interest      = inDebt ? remainingDebt * (interestRate / 100) : 0
    const principal     = inDebt ? Math.min(annualDebtService - interest, remainingDebt) : 0
    if (inDebt) remainingDebt = Math.max(0, remainingDebt - principal)

    // Tax
    const macrsDep      = yr <= 6 ? depreciableBasis * MACRS_5YR[yr - 1] : 0
    const taxableIncome = ebitda - macrsDep - interest
    let taxLiability    = Math.max(0, taxableIncome * FEDERAL_TAX_RATE)
    if (yr === 1) taxLiability = Math.max(0, taxLiability - itcAmount)

    const projectCF = ebitda - taxLiability
    const debtSvc   = inDebt ? annualDebtService : 0
    const equityCF  = projectCF - debtSvc
    const dscr      = inDebt ? ebitda / annualDebtService : null

    cashflows.push({
      year: yr,
      production: Math.round(production),
      ppaPrice:   Math.round(ppaPrice * 100) / 100,
      revenue:    Math.round(revenue),
      omCost:     Math.round(omCost),
      ebitda:     Math.round(ebitda),
      macrsDep:   Math.round(macrsDep),
      interest:   Math.round(interest),
      taxLiability: Math.round(taxLiability),
      projectCF:  Math.round(projectCF),
      debtSvc:    Math.round(debtSvc),
      equityCF:   Math.round(equityCF),
      dscr,
    })
  }

  // ── Summary metrics ──
  const projectCFs = [-netCapex, ...cashflows.map(y => y.projectCF)]
  const equityCFs  = [-equity,   ...cashflows.map(y => y.equityCF)]

  const projectIRR = calculateIRR(projectCFs)
  const equityIRR  = calculateIRR(equityCFs)
  const npv        = npvAtRate(projectCFs, discountRate / 100)

  let cumulative = -netCapex
  let paybackYear = null
  for (const cf of cashflows) {
    cumulative += cf.projectCF
    if (cumulative >= 0 && paybackYear === null) paybackYear = cf.year
  }

  const pvCosts     = netCapex + cashflows.reduce((s, y, i) => s + y.omCost / Math.pow(1 + discountRate / 100, i + 1), 0)
  const pvProduction = cashflows.reduce((s, y, i) => s + y.production / Math.pow(1 + discountRate / 100, i + 1), 0)
  const lcoe        = pvProduction > 0 ? pvCosts / pvProduction : 0

  const minDSCR = Math.min(...cashflows.filter(y => y.dscr !== null).map(y => y.dscr))

  return {
    systemCapacityMW,
    annualProductionMWh: Math.round(annualProductionMWh),
    totalCapex:    Math.round(totalCapex),
    netCapex:      Math.round(netCapex),
    itcAmount:     Math.round(itcAmount),
    equity:        Math.round(equity),
    debtAmount:    Math.round(debtAmount),
    projectIRR:    isFinite(projectIRR) ? Math.round(projectIRR * 10) / 10 : null,
    equityIRR:     isFinite(equityIRR)  ? Math.round(equityIRR  * 10) / 10 : null,
    npv:           Math.round(npv),
    paybackYear,
    lcoe:          Math.round(lcoe * 100) / 100,
    minDSCR:       minDSCR != null && isFinite(minDSCR) ? Math.round(minDSCR * 100) / 100 : null,
    year1Revenue:  cashflows[0].revenue,
    year1EBITDA:   cashflows[0].ebitda,
    cashflows,
  }
}

// ─── Sensitivity: IRR grid vs PPA price × capacity factor ────────────────────

export function calculateSensitivity(inputs) {
  const ppaMultipliers = [0.80, 0.90, 1.00, 1.10, 1.20]
  const cfMultipliers  = [0.80, 0.90, 1.00, 1.10, 1.20]

  const ppaLabels = ppaMultipliers.map(m => `$${Math.round(inputs.ppaPricePerMWh * m)}`)
  const cfLabels  = cfMultipliers.map(m => `${Math.round(inputs.capacityFactor * m * 1000) / 10}%`)

  const matrix = cfMultipliers.map(cfM =>
    ppaMultipliers.map(ppaM => {
      const r = calculateDeveloperFinancials({
        ...inputs,
        capacityFactor: inputs.capacityFactor * cfM,
        ppaPricePerMWh: inputs.ppaPricePerMWh * ppaM,
      })
      return r.projectIRR
    })
  )

  return { ppaLabels, cfLabels, matrix }
}

// ─── Owner (lease) model ─────────────────────────────────────────────────────

export function calculateOwnerFinancials(inputs) {
  const { usableAcres, leaseRatePerAcreYr, leaseEscalation, leaseTerm } = inputs

  const cashflows = Array.from({ length: leaseTerm }, (_, i) => {
    const income = usableAcres * leaseRatePerAcreYr * Math.pow(1 + leaseEscalation / 100, i)
    return { year: i + 1, income: Math.round(income) }
  })

  const totalIncome = cashflows.reduce((s, y) => s + y.income, 0)
  const npv = npvAtRate([0, ...cashflows.map(y => y.income)], 0.05)

  return {
    year1Income: cashflows[0].income,
    totalIncome: Math.round(totalIncome),
    npv:         Math.round(npv),
    cashflows,
  }
}
