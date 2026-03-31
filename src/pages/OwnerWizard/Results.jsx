import { RotateCcw } from 'lucide-react'
import StatCard from '../../components/shared/StatCard'
import { calculateOwnerFinancials } from '../../utils/calculations'
import { fmtCurrency } from '../../utils/formatters'

function siteScore(data) {
  let score = 0
  if (data.capacityFactor >= 0.20) score += 2
  else if (data.capacityFactor >= 0.16) score += 1
  if (data.gridDistanceMiles < 1)  score += 2
  else if (data.gridDistanceMiles < 3) score += 1
  if (data.usableAcres >= 25) score += 2
  else if (data.usableAcres >= 10) score += 1
  if (['agricultural', 'brownfield'].includes(data.zoning)) score += 1
  return score // 0–7
}

function scoreLabel(s) {
  if (s >= 6) return { label: 'Excellent Site', color: 'text-solar-400' }
  if (s >= 4) return { label: 'Good Site', color: 'text-blue-400' }
  if (s >= 2) return { label: 'Fair Site', color: 'text-yellow-400' }
  return       { label: 'Challenging Site', color: 'text-red-400' }
}

export default function OwnerResults({ data, onReset }) {
  const r = calculateOwnerFinancials({
    usableAcres:        data.usableAcres,
    leaseRatePerAcreYr: data.leaseRatePerAcreYr,
    leaseEscalation:    data.leaseEscalation,
    leaseTerm:          data.leaseTerm,
  })

  const score = siteScore(data)
  const { label: scoreText, color: scoreColor } = scoreLabel(score)

  const distance = data.gridDistanceMiles || 0
  const gridNote = distance < 1
    ? 'Excellent grid proximity — low interconnection cost.'
    : distance < 3
    ? 'Moderate grid distance — developer will need to budget for line extension.'
    : 'Significant grid distance — this will reduce developer interest and/or offer price.'

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-100">Property Assessment</h2>
          {data.displayName && (
            <p className="text-sm text-gray-500 mt-0.5">{data.displayName.split(',').slice(0, 3).join(',')}</p>
          )}
        </div>
        <button onClick={onReset} className="btn-secondary flex items-center gap-1.5 text-xs">
          <RotateCcw size={13} /> New Analysis
        </button>
      </div>

      {/* Site score */}
      <div className="card p-5 flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Site Attractiveness</p>
          <p className={`text-2xl font-bold mt-0.5 ${scoreColor}`}>{scoreText}</p>
        </div>
        <div className="flex gap-1">
          {Array.from({ length: 7 }, (_, i) => (
            <div key={i} className={`w-3 h-3 rounded-sm ${i < score ? 'bg-solar-500' : 'bg-bg-elevated'}`} />
          ))}
        </div>
      </div>

      {/* Income metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <StatCard label="Year 1 Income"  value={fmtCurrency(r.year1Income)}  sub="Annual lease income"    accent />
        <StatCard label="Total Income"   value={fmtCurrency(r.totalIncome)}  sub={`Over ${data.leaseTerm} yr lease`} />
        <StatCard label="NPV (5%)"       value={fmtCurrency(r.npv)}          sub="Present value of lease" />
      </div>

      {/* 25-year income table */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold text-gray-300 mb-4">Projected Lease Income</h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {r.cashflows.filter(y => y.year % 5 === 0 || y.year === 1).map(y => (
            <div key={y.year} className="card-elevated p-3 text-center">
              <p className="text-xs text-gray-500 mb-0.5">Year {y.year}</p>
              <p className="text-sm font-mono font-semibold text-solar-400">{fmtCurrency(y.income)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Site factors */}
      <div className="card p-5 space-y-3">
        <h3 className="text-sm font-semibold text-gray-300 mb-1">Site Factor Analysis</h3>
        {[
          {
            label: 'Solar Resource',
            value: data.capacityFactor ? `${(data.capacityFactor * 100).toFixed(1)}% capacity factor` : 'Unknown',
            note: data.capacityFactor >= 0.18 ? 'Good — above average for ground-mount' : 'Below average — developer will discount production estimate',
            ok: data.capacityFactor >= 0.18,
          },
          {
            label: 'Site Size',
            value: `${data.usableAcres} acres`,
            note: data.usableAcres >= 25 ? 'Sufficient for utility-scale development (≥2 MW)' : data.usableAcres >= 10 ? 'Suitable for small community solar' : 'May be too small for ground-mount development',
            ok: data.usableAcres >= 10,
          },
          {
            label: 'Grid Access',
            value: `${data.gridDistanceMiles} miles to grid`,
            note: gridNote,
            ok: data.gridDistanceMiles < 3,
          },
        ].map(f => (
          <div key={f.label} className="flex items-start gap-3">
            <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${f.ok ? 'bg-solar-500' : 'bg-yellow-500'}`} />
            <div>
              <p className="text-sm font-medium text-gray-200">{f.label}: <span className="font-mono text-solar-400">{f.value}</span></p>
              <p className="text-xs text-gray-500 mt-0.5">{f.note}</p>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-600 text-center">
        Lease income projections are estimates only. Actual offers depend on developer underwriting, grid capacity, and market conditions.
      </p>
    </div>
  )
}
