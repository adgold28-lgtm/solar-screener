import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { fmtCurrency } from '../../../utils/formatters'

// Regional EPC cost benchmarks ($/W-DC, 2024, ground-mount utility-scale)
const REGIONAL_EPC = {
  Northeast:  { low: 1.05, mid: 1.20, high: 1.40 },
  Southeast:  { low: 0.90, mid: 1.05, high: 1.20 },
  Midwest:    { low: 0.92, mid: 1.08, high: 1.25 },
  Southwest:  { low: 0.85, mid: 1.00, high: 1.15 },
  West:       { low: 0.95, mid: 1.10, high: 1.30 },
}

// EPC cost breakdown as % of total (approximate industry split)
const EPC_BREAKDOWN = [
  { label: 'Solar modules',        pct: 0.28 },
  { label: 'Inverters',            pct: 0.08 },
  { label: 'Racking & mounting',   pct: 0.10 },
  { label: 'Balance of system',    pct: 0.12 },
  { label: 'Labor & installation', pct: 0.22 },
  { label: 'Engineering & PM',     pct: 0.08 },
  { label: 'Permitting & interconnect prep', pct: 0.06 },
  { label: 'Contingency (5%)',     pct: 0.06 },
]

// Grid connection cost ranges by distance and voltage
const GRID_COST_GUIDE = [
  { label: '< 0.5 miles, distribution tap',  low: 50000,  high: 150000,  perMW: true },
  { label: '0.5–2 miles, distribution extension', low: 100000, high: 300000, perMW: true },
  { label: '2–5 miles, distribution upgrade',  low: 200000, high: 600000, perMW: true },
  { label: '> 5 miles or transmission-level',  low: 500000, high: 2000000, perMW: true },
]

export default function CostsStep({ data, update }) {
  const [showBreakdown, setShowBreakdown] = useState(false)
  const [showGridGuide, setShowGridGuide] = useState(false)

  const systemMW = data.usableAcres / data.acresPerMW
  const systemKW = systemMW * 1000
  const epcTotal = systemKW * (data.epcCostPerW || 0)
  const itcAmt   = epcTotal * ((data.itcRate || 0) / 100)
  const gridCost = systemMW * (data.gridConnectionCostPerMW || 0)
  const stateInc = systemKW * (data.stateIncentivePerW || 0)
  const netCapex = epcTotal + gridCost - stateInc

  return (
    <div className="space-y-6">

      {/* EPC cost */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="label mb-0">EPC Cost ($/W-DC)</label>
          <button
            onClick={() => setShowBreakdown(v => !v)}
            className="text-xs text-solar-400 hover:text-solar-300 flex items-center gap-1"
          >
            Cost breakdown {showBreakdown ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
        </div>
        <input
          type="number"
          className="input-base"
          min={0.5} max={3.0} step={0.01}
          value={data.epcCostPerW}
          onChange={e => update({ epcCostPerW: parseFloat(e.target.value) || 0 })}
        />
        <p className="text-xs text-gray-600 mt-1">
          US ground-mount benchmarks: Southeast $0.90–1.20/W · Midwest $0.92–1.25/W · Northeast $1.05–1.40/W · West $0.95–1.30/W
        </p>

        {showBreakdown && (
          <div className="mt-3 card-elevated p-4 space-y-2">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-3">Estimated cost breakdown at ${data.epcCostPerW}/W</p>
            {EPC_BREAKDOWN.map(({ label, pct }) => (
              <div key={label} className="flex items-center justify-between text-xs">
                <span className="text-gray-400">{label}</span>
                <div className="flex items-center gap-3">
                  <div className="w-20 h-1.5 bg-bg-surface rounded-full overflow-hidden">
                    <div className="h-full bg-solar-500/60 rounded-full" style={{ width: `${pct * 100 / 0.28}%` }} />
                  </div>
                  <span className="font-mono text-gray-300 w-20 text-right">
                    {fmtCurrency(systemKW * data.epcCostPerW * pct)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* O&M */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="label">O&amp;M Cost ($/kW/yr)</label>
          <input
            type="number"
            className="input-base"
            min={5} max={50} step={1}
            value={data.omCostPerKWYr}
            onChange={e => update({ omCostPerKWYr: parseFloat(e.target.value) || 0 })}
          />
          <p className="text-xs text-gray-600 mt-1">
            Vegetation: $4–6 · Monitoring: $2–3 · Maintenance: $5–8 · Insurance: $3–5 · Total typical: $14–22/kW/yr
          </p>
        </div>
        <div>
          <label className="label">O&amp;M Annual Escalation (%)</label>
          <input
            type="number"
            className="input-base"
            min={0} max={5} step={0.1}
            value={data.omEscalation}
            onChange={e => update({ omEscalation: parseFloat(e.target.value) || 0 })}
          />
        </div>
      </div>

      {/* Grid connection */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="label mb-0">Grid Connection Cost ($/MW)</label>
          <button
            onClick={() => setShowGridGuide(v => !v)}
            className="text-xs text-solar-400 hover:text-solar-300 flex items-center gap-1"
          >
            Cost guide {showGridGuide ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
        </div>
        <input
          type="number"
          className="input-base"
          min={0} step={10000}
          value={data.gridConnectionCostPerMW}
          onChange={e => update({ gridConnectionCostPerMW: parseFloat(e.target.value) || 0 })}
        />
        {showGridGuide && (
          <div className="mt-3 card-elevated p-4 space-y-2">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-3">Interconnection cost reference ranges</p>
            {GRID_COST_GUIDE.map(({ label, low, high }) => (
              <div key={label} className="flex items-center justify-between text-xs">
                <span className="text-gray-400">{label}</span>
                <span className="font-mono text-gray-300">{fmtCurrency(low)}–{fmtCurrency(high)}/MW</span>
              </div>
            ))}
            <p className="text-xs text-gray-600 mt-2 pt-2 border-t border-border/50">
              Costs include line extension, transformer upgrades, protection equipment, and utility study fees. Highly site-specific — confirm with utility.
            </p>
          </div>
        )}
      </div>

      {/* Incentives */}
      <div>
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Incentives</p>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Federal ITC (%)</label>
            <input
              type="number"
              className="input-base"
              min={0} max={50} step={1}
              value={data.itcRate}
              onChange={e => update({ itcRate: parseFloat(e.target.value) || 0 })}
            />
            <p className="text-xs text-gray-600 mt-1">
              IRA base: 30% · Energy community bonus: +10% · Domestic content bonus: +10%
            </p>
          </div>
          <div>
            <label className="label">State Incentive ($/W)</label>
            <input
              type="number"
              className="input-base"
              min={0} max={1.0} step={0.01}
              value={data.stateIncentivePerW}
              onChange={e => update({ stateIncentivePerW: parseFloat(e.target.value) || 0 })}
            />
          </div>
        </div>
      </div>

      {/* Cost summary */}
      <div className="card-elevated p-5 space-y-3">
        <p className="text-xs text-gray-500 uppercase tracking-wide">Capital Cost Summary</p>
        <div className="space-y-1.5 text-sm">
          <div className="flex justify-between text-gray-400">
            <span>EPC ({systemMW.toFixed(2)} MW · ${(data.epcCostPerW * 1000).toFixed(0)}/kW)</span>
            <span className="font-mono text-gray-200">{fmtCurrency(epcTotal)}</span>
          </div>
          {gridCost > 0 && (
            <div className="flex justify-between text-gray-400">
              <span>Grid connection</span>
              <span className="font-mono text-gray-200">{fmtCurrency(gridCost)}</span>
            </div>
          )}
          {stateInc > 0 && (
            <div className="flex justify-between text-solar-400">
              <span>State incentive</span>
              <span className="font-mono">−{fmtCurrency(stateInc)}</span>
            </div>
          )}
          <div className="flex justify-between text-gray-400 border-t border-border/50 pt-2">
            <span>Gross project cost</span>
            <span className="font-mono text-gray-200">{fmtCurrency(netCapex)}</span>
          </div>
          <div className="flex justify-between text-solar-400">
            <span>ITC benefit ({data.itcRate}%)</span>
            <span className="font-mono">−{fmtCurrency(itcAmt)}</span>
          </div>
          <div className="flex justify-between font-semibold text-gray-100 border-t border-border/50 pt-2">
            <span>Net project cost</span>
            <span className="font-mono">{fmtCurrency(netCapex - itcAmt)}</span>
          </div>
          <div className="flex justify-between text-xs text-gray-500 pt-1">
            <span>Per watt (net of ITC)</span>
            <span className="font-mono">${((netCapex - itcAmt) / systemKW).toFixed(2)}/W</span>
          </div>
        </div>
      </div>
    </div>
  )
}
