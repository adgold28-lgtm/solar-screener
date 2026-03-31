import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { RotateCcw, ChevronDown, ChevronUp } from 'lucide-react'
import StatCard from '../../components/shared/StatCard'
import CashflowChart from '../../components/charts/CashflowChart'
import SensitivityTable from '../../components/charts/SensitivityTable'
import { calculateDeveloperFinancials, calculateSensitivity } from '../../utils/calculations'
import { fmtCurrency, fmtPct, fmtMWh, fmtMW, fmtDollarPerMWh } from '../../utils/formatters'
import { SHADE_LEVELS } from '../../constants/defaults'

function irrColor(irr) {
  if (!irr) return ''
  if (irr >= 12) return 'text-solar-400'
  if (irr >= 8)  return 'text-blue-400'
  if (irr >= 5)  return 'text-yellow-400'
  return 'text-red-400'
}

function irrLabel(irr) {
  if (!irr) return ''
  if (irr >= 12) return 'Strong'
  if (irr >= 8)  return 'Feasible'
  if (irr >= 5)  return 'Marginal'
  return 'Below threshold'
}

export default function DeveloperResults({ data, onReset }) {
  const navigate = useNavigate()
  const [showTable, setShowTable] = useState(false)

  const shadeDerate = SHADE_LEVELS.find(s => s.value === (data.shadeLevel || 'none'))?.derate ?? 0
  const systemMW = data.usableAcres / data.acresPerMW

  const inputs = {
    systemCapacityMW:      systemMW,
    capacityFactor:        (data.capacityFactor || 0.20) * (1 - shadeDerate),
    annualDegradation:     data.annualDegradation,
    ppaPricePerMWh:        data.ppaPricePerMWh,
    ppaEscalation:         data.ppaEscalation,
    epcCostPerW:           data.epcCostPerW,
    omCostPerKWYr:         data.omCostPerKWYr,
    omEscalation:          data.omEscalation,
    itcRate:               data.itcRate,
    stateIncentivePerW:    data.stateIncentivePerW || 0,
    gridConnectionCostPerMW: data.gridConnectionCostPerMW || 0,
    debtRatio:             data.debtRatio,
    interestRate:          data.interestRate,
    loanTermYears:         data.loanTermYears,
    discountRate:          data.discountRate,
  }

  const r = calculateDeveloperFinancials(inputs)
  const sensitivity = calculateSensitivity(inputs)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-100">Project Analysis Results</h2>
          {data.displayName && (
            <p className="text-sm text-gray-500 mt-0.5">{data.displayName.split(',').slice(0, 3).join(',')}</p>
          )}
        </div>
        <button onClick={onReset} className="btn-secondary flex items-center gap-1.5 text-xs">
          <RotateCcw size={13} /> New Analysis
        </button>
      </div>

      {/* IRR verdict */}
      {r.projectIRR && (
        <div className={`card p-4 border-l-4 ${
          r.projectIRR >= 8 ? 'border-l-solar-500' : r.projectIRR >= 5 ? 'border-l-yellow-500' : 'border-l-red-500'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Project Verdict</p>
              <p className={`text-2xl font-bold font-mono mt-0.5 ${irrColor(r.projectIRR)}`}>
                {irrLabel(r.projectIRR)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Project IRR</p>
              <p className={`text-3xl font-bold font-mono ${irrColor(r.projectIRR)}`}>
                {fmtPct(r.projectIRR)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Key metrics grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Equity IRR"    value={fmtPct(r.equityIRR)}    sub="Levered return"       accent />
        <StatCard label="NPV"           value={fmtCurrency(r.npv)}      sub={`@ ${data.discountRate}% discount`} />
        <StatCard label="Payback"       value={r.paybackYear ? `Yr ${r.paybackYear}` : '—'} sub="Unlevered" />
        <StatCard label="LCOE"          value={fmtDollarPerMWh(r.lcoe)} sub="Levelized cost" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="System Size"   value={fmtMW(r.systemCapacityMW)}  sub={`${data.usableAcres} acres`} />
        <StatCard label="Year 1 Prod."  value={fmtMWh(r.annualProductionMWh)} sub={`CF ${((inputs.capacityFactor) * 100).toFixed(1)}%`} />
        <StatCard label="Total Capex"   value={fmtCurrency(r.totalCapex)}  sub={`$${((r.totalCapex / (r.systemCapacityMW * 1000))).toFixed(2)}/W`} />
        <StatCard label="Min DSCR"      value={r.minDSCR?.toFixed(2) ?? '—'} sub="Debt coverage" />
      </div>

      {/* Cashflow chart */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold text-gray-300 mb-4">25-Year Cashflow Projection</h3>
        <CashflowChart cashflows={r.cashflows} />
      </div>

      {/* Sensitivity analysis */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold text-gray-300 mb-1">IRR Sensitivity Analysis</h3>
        <p className="text-xs text-gray-500 mb-4">Project IRR across PPA price and capacity factor scenarios</p>
        <SensitivityTable sensitivity={sensitivity} />
      </div>

      {/* Cashflow table toggle */}
      <div className="card overflow-hidden">
        <button
          onClick={() => setShowTable(v => !v)}
          className="w-full flex items-center justify-between p-5 text-sm font-semibold text-gray-300 hover:text-gray-100 transition-colors"
        >
          Year-by-Year Cashflow Table
          {showTable ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {showTable && (
          <div className="overflow-x-auto border-t border-border">
            <table className="w-full text-xs">
              <thead className="bg-bg-surface">
                <tr>
                  {['Yr','Prod (MWh)','Revenue','O&M','EBITDA','Tax','Project CF','Debt Svc','Equity CF','DSCR'].map(h => (
                    <th key={h} className="px-3 py-2.5 text-left text-gray-500 font-medium whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {r.cashflows.map((y, i) => (
                  <tr key={y.year} className={`border-t border-border/40 ${i % 2 === 0 ? '' : 'bg-bg-surface/30'}`}>
                    <td className="px-3 py-2 font-mono text-gray-400">{y.year}</td>
                    <td className="px-3 py-2 font-mono">{y.production.toLocaleString()}</td>
                    <td className="px-3 py-2 font-mono text-solar-400">{fmtCurrency(y.revenue)}</td>
                    <td className="px-3 py-2 font-mono text-red-400">({fmtCurrency(y.omCost)})</td>
                    <td className="px-3 py-2 font-mono">{fmtCurrency(y.ebitda)}</td>
                    <td className="px-3 py-2 font-mono text-red-400">({fmtCurrency(y.taxLiability)})</td>
                    <td className="px-3 py-2 font-mono text-blue-400">{fmtCurrency(y.projectCF)}</td>
                    <td className="px-3 py-2 font-mono text-red-400">{y.debtSvc ? `(${fmtCurrency(y.debtSvc)})` : '—'}</td>
                    <td className="px-3 py-2 font-mono text-solar-400">{fmtCurrency(y.equityCF)}</td>
                    <td className="px-3 py-2 font-mono">{y.dscr ? y.dscr.toFixed(2) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Assumptions */}
      <p className="text-xs text-gray-600 text-center">
        Solar data: NREL PVWatts v8 · Tax: 21% federal + MACRS 5-yr + {data.itcRate}% ITC · Model assumes constant leverage ratio.
        Educational use only — not financial advice.
      </p>
    </div>
  )
}
