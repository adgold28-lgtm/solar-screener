import { fmtCurrency } from '../../../utils/formatters'

export default function CostsStep({ data, update }) {
  const systemMW = data.usableAcres / data.acresPerMW
  const systemKW = systemMW * 1000
  const epcTotal = systemKW * (data.epcCostPerW || 0)
  const itcAmt   = epcTotal * ((data.itcRate || 0) / 100)
  const gridCost = systemMW * (data.gridConnectionCostPerMW || 0)
  const netCapex = epcTotal + gridCost - systemKW * (data.stateIncentivePerW || 0)

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="label">EPC Cost ($/W-DC)</label>
          <input
            type="number"
            className="input-base"
            min={0.5} max={3.0} step={0.01}
            value={data.epcCostPerW}
            onChange={e => update({ epcCostPerW: parseFloat(e.target.value) || 0 })}
          />
          <p className="text-xs text-gray-600 mt-1">
            US ground-mount all-in: $0.90–$1.30/W (2024)
          </p>
        </div>
        <div>
          <label className="label">O&amp;M Cost ($/kW/yr)</label>
          <input
            type="number"
            className="input-base"
            min={5} max={50} step={1}
            value={data.omCostPerKWYr}
            onChange={e => update({ omCostPerKWYr: parseFloat(e.target.value) || 0 })}
          />
          <p className="text-xs text-gray-600 mt-1">Industry range: $12–$22/kW/yr</p>
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
        <div>
          <label className="label">Grid Connection Cost ($/MW)</label>
          <input
            type="number"
            className="input-base"
            min={0}
            step={10000}
            value={data.gridConnectionCostPerMW}
            onChange={e => update({ gridConnectionCostPerMW: parseFloat(e.target.value) || 0 })}
          />
          <p className="text-xs text-gray-600 mt-1">Varies widely — $50K–$500K+/MW depending on substation proximity</p>
        </div>
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
            <p className="text-xs text-gray-600 mt-1">IRA 2022: 30% base + up to 10% bonus adders</p>
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
            <span>EPC ({systemMW.toFixed(2)} MW × {(data.epcCostPerW * 1000).toFixed(0)} $/kW)</span>
            <span className="font-mono text-gray-200">{fmtCurrency(epcTotal)}</span>
          </div>
          {gridCost > 0 && (
            <div className="flex justify-between text-gray-400">
              <span>Grid connection</span>
              <span className="font-mono text-gray-200">{fmtCurrency(gridCost)}</span>
            </div>
          )}
          <div className="flex justify-between text-solar-400 border-t border-border/50 pt-2">
            <span>ITC benefit ({data.itcRate}%)</span>
            <span className="font-mono">−{fmtCurrency(itcAmt)}</span>
          </div>
          <div className="flex justify-between font-semibold text-gray-100 border-t border-border/50 pt-2">
            <span>Net Project Cost</span>
            <span className="font-mono">{fmtCurrency(netCapex - itcAmt)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
