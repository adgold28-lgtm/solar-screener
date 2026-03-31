import { Info } from 'lucide-react'
import { SHADE_LEVELS } from '../../../constants/defaults'

export default function ProductionStep({ data, update }) {
  const systemMW   = data.usableAcres / data.acresPerMW
  const shadeDerate = SHADE_LEVELS.find(s => s.value === data.shadeLevel)?.derate ?? 0
  const effectiveCF = data.capacityFactor * (1 - shadeDerate)
  const annualMWh   = systemMW * effectiveCF * 8760

  return (
    <div className="space-y-6">
      {/* NREL data banner */}
      {data.capacityFactor ? (
        <div className="bg-solar-500/5 border border-solar-500/20 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <Info size={14} className="text-solar-400 mt-0.5 shrink-0" />
            <div className="text-xs text-gray-400 leading-relaxed">
              <span className="text-solar-400 font-medium">NREL PVWatts data loaded</span> — capacity factor{' '}
              <strong className="text-gray-200">{(data.capacityFactor * 100).toFixed(1)}%</strong> and solar resource{' '}
              <strong className="text-gray-200">{data.solradAnnual?.toFixed(2)} kWh/m²/day</strong> for this location.
              Adjust below if your project has specific characteristics.
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-4 text-xs text-yellow-400">
          No location data — go back to Step 1 and click &quot;Analyze Site&quot; to load real solar data.
        </div>
      )}

      {/* Capacity factor */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Capacity Factor (override)</label>
          <input
            type="number"
            className="input-base"
            min={0.05} max={0.40} step={0.001}
            value={data.capacityFactor?.toFixed(3) || ''}
            onChange={e => update({ capacityFactor: parseFloat(e.target.value) || 0 })}
          />
          <p className="text-xs text-gray-600 mt-1">From NREL PVWatts. Typical US range: 12–26%</p>
        </div>
        <div>
          <label className="label">Annual Degradation (%)</label>
          <input
            type="number"
            className="input-base"
            min={0.1} max={2.0} step={0.1}
            value={data.annualDegradation}
            onChange={e => update({ annualDegradation: parseFloat(e.target.value) || 0 })}
          />
          <p className="text-xs text-gray-600 mt-1">Typical: 0.5%/yr. Premium panels: 0.3%/yr</p>
        </div>
      </div>

      {/* Shade */}
      <div>
        <label className="label">Shade Level</label>
        <select
          className="input-base"
          value={data.shadeLevel || 'none'}
          onChange={e => update({ shadeLevel: e.target.value })}
        >
          {SHADE_LEVELS.map(s => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      {/* Preview */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card-elevated p-4 text-center">
          <p className="text-xs text-gray-500 mb-1">Effective CF</p>
          <p className="text-lg font-bold font-mono text-solar-400">{(effectiveCF * 100).toFixed(1)}%</p>
        </div>
        <div className="card-elevated p-4 text-center">
          <p className="text-xs text-gray-500 mb-1">System Size</p>
          <p className="text-lg font-bold font-mono text-gray-100">{systemMW.toFixed(2)} MW</p>
        </div>
        <div className="card-elevated p-4 text-center">
          <p className="text-xs text-gray-500 mb-1">Year 1 Production</p>
          <p className="text-lg font-bold font-mono text-gray-100">{Math.round(annualMWh).toLocaleString()} MWh</p>
        </div>
      </div>
    </div>
  )
}
