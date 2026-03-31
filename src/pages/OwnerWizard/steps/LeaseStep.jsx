import { fmtCurrency } from '../../../utils/formatters'

export default function LeaseStep({ data, update }) {
  const year1 = (data.usableAcres || 0) * (data.leaseRatePerAcreYr || 0)

  return (
    <div className="space-y-6">
      <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-4 text-xs text-blue-300 leading-relaxed">
        Solar lease rates vary widely by state, grid access, and project economics.
        US typical range: <strong>$700–$2,000+/acre/yr</strong>. Rates in high-demand markets (MA, NJ, CA)
        can exceed $2,000/acre/yr for good sites.
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Expected Lease Rate ($/acre/yr)</label>
          <input
            type="number"
            className="input-base"
            min={100} max={5000} step={50}
            value={data.leaseRatePerAcreYr}
            onChange={e => update({ leaseRatePerAcreYr: parseFloat(e.target.value) || 0 })}
          />
        </div>
        <div>
          <label className="label">Annual Escalator (%)</label>
          <input
            type="number"
            className="input-base"
            min={0} max={5} step={0.1}
            value={data.leaseEscalation}
            onChange={e => update({ leaseEscalation: parseFloat(e.target.value) || 0 })}
          />
          <p className="text-xs text-gray-600 mt-1">CPI-linked or fixed. Typical: 1.5–2.5%</p>
        </div>
      </div>

      <div>
        <label className="label">Lease Term (years)</label>
        <input
          type="number"
          className="input-base"
          min={15} max={40}
          value={data.leaseTerm}
          onChange={e => update({ leaseTerm: parseInt(e.target.value) || 25 })}
        />
        <p className="text-xs text-gray-600 mt-1">Standard: 20–25 years plus 2–3 extension options</p>
      </div>

      {year1 > 0 && (
        <div className="card-elevated p-5 space-y-2">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Year 1 Lease Income</p>
          <p className="text-3xl font-bold font-mono text-solar-400">{fmtCurrency(year1)}</p>
          <p className="text-xs text-gray-500">{data.usableAcres} acres × ${data.leaseRatePerAcreYr}/acre/yr</p>
        </div>
      )}
    </div>
  )
}
