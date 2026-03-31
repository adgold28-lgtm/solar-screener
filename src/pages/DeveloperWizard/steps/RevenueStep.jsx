import { fmtCurrency } from '../../../utils/formatters'
import { SHADE_LEVELS } from '../../../constants/defaults'

export default function RevenueStep({ data, update }) {
  const systemMW    = data.usableAcres / data.acresPerMW
  const shadeDerate = SHADE_LEVELS.find(s => s.value === data.shadeLevel)?.derate ?? 0
  const effectiveCF = (data.capacityFactor || 0.20) * (1 - shadeDerate)
  const annualMWh   = systemMW * effectiveCF * 8760
  const year1Rev    = annualMWh * (data.ppaPricePerMWh || 0)

  return (
    <div className="space-y-6">
      {data.commercialRatePerMWh && (
        <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-3 text-xs text-blue-300">
          <strong>Local commercial rate:</strong> ${data.commercialRatePerMWh}/MWh
          {data.utilityName && ` (${data.utilityName})`}.
          Suggested PPA range: ${Math.round(data.commercialRatePerMWh * 0.75)}–${Math.round(data.commercialRatePerMWh * 0.90)}/MWh
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="label">PPA Price ($/MWh)</label>
          <input
            type="number"
            className="input-base"
            min={10} max={200} step={1}
            value={data.ppaPricePerMWh}
            onChange={e => update({ ppaPricePerMWh: parseFloat(e.target.value) || 0 })}
          />
          <p className="text-xs text-gray-600 mt-1">
            US utility-scale ground-mount range: $30–$90/MWh (2024)
          </p>
        </div>
        <div>
          <label className="label">Annual Escalator (%)</label>
          <input
            type="number"
            className="input-base"
            min={0} max={5} step={0.1}
            value={data.ppaEscalation}
            onChange={e => update({ ppaEscalation: parseFloat(e.target.value) || 0 })}
          />
          <p className="text-xs text-gray-600 mt-1">Typical: 0–2%. Locks in price growth over contract term.</p>
        </div>
      </div>

      <div>
        <label className="label">Contract Term (years)</label>
        <input
          type="number"
          className="input-base"
          min={10} max={35}
          value={data.contractTermYears}
          onChange={e => update({ contractTermYears: parseInt(e.target.value) || 25 })}
        />
      </div>

      {/* Revenue preview */}
      <div className="card-elevated p-5 space-y-2">
        <p className="text-xs text-gray-500 uppercase tracking-wide">Year 1 Revenue Estimate</p>
        <p className="text-3xl font-bold font-mono text-solar-400">{fmtCurrency(year1Rev)}</p>
        <p className="text-xs text-gray-500">
          {Math.round(annualMWh).toLocaleString()} MWh × ${data.ppaPricePerMWh}/MWh
        </p>
      </div>
    </div>
  )
}
