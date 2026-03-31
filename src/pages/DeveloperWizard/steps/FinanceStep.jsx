import { fmtCurrency, fmtPct } from '../../../utils/formatters'

export default function FinanceStep({ data, update }) {
  const systemMW = data.usableAcres / data.acresPerMW
  const systemKW = systemMW * 1000
  const totalCapex = systemKW * data.epcCostPerW + systemMW * data.gridConnectionCostPerMW
  const debt   = totalCapex * (data.debtRatio / 100)
  const equity = totalCapex - debt

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Debt Ratio (%)</label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={0} max={85} step={5}
              value={data.debtRatio}
              onChange={e => update({ debtRatio: parseInt(e.target.value) })}
              className="flex-1 accent-solar-500"
            />
            <span className="text-sm font-mono text-solar-400 w-10 text-right">{data.debtRatio}%</span>
          </div>
          <p className="text-xs text-gray-600 mt-1">Typical project finance: 60–75%</p>
        </div>
        <div>
          <label className="label">Interest Rate (%)</label>
          <input
            type="number"
            className="input-base"
            min={2} max={15} step={0.1}
            value={data.interestRate}
            onChange={e => update({ interestRate: parseFloat(e.target.value) || 0 })}
          />
          <p className="text-xs text-gray-600 mt-1">Construction to perm: 5.5–7.5% (2024)</p>
        </div>
        <div>
          <label className="label">Loan Term (years)</label>
          <input
            type="number"
            className="input-base"
            min={5} max={25}
            value={data.loanTermYears}
            onChange={e => update({ loanTermYears: parseInt(e.target.value) || 18 })}
          />
        </div>
        <div>
          <label className="label">Discount Rate / Target IRR (%)</label>
          <input
            type="number"
            className="input-base"
            min={3} max={20} step={0.1}
            value={data.discountRate}
            onChange={e => update({ discountRate: parseFloat(e.target.value) || 0 })}
          />
          <p className="text-xs text-gray-600 mt-1">Used for NPV calculation. Typical: 7–10%</p>
        </div>
      </div>

      {/* Capital stack */}
      <div className="card-elevated p-5">
        <p className="text-xs text-gray-500 uppercase tracking-wide mb-4">Capital Stack</p>
        <div className="flex rounded-lg overflow-hidden h-6 mb-3">
          <div
            className="bg-blue-500/70 transition-all"
            style={{ width: `${data.debtRatio}%` }}
          />
          <div
            className="bg-solar-500/70 flex-1"
          />
        </div>
        <div className="flex justify-between text-sm">
          <div>
            <p className="text-xs text-blue-400">Debt ({data.debtRatio}%)</p>
            <p className="font-mono font-semibold text-gray-100">{fmtCurrency(debt)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-solar-400">Equity ({100 - data.debtRatio}%)</p>
            <p className="font-mono font-semibold text-gray-100">{fmtCurrency(equity)}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
