export default function GridStep({ data, update }) {
  const distance = data.gridDistanceMiles || 0

  const riskLevel = distance < 1 ? 'low' : distance < 3 ? 'medium' : distance < 6 ? 'high' : 'very-high'
  const riskColor = {
    low: 'text-solar-400', medium: 'text-yellow-400', high: 'text-orange-400', 'very-high': 'text-red-400'
  }[riskLevel]
  const riskLabel = {
    low: 'Favorable — low interconnection cost', medium: 'Moderate — typical interconnection study', high: 'Significant cost — may affect project economics', 'very-high': 'High barrier — developer will heavily discount offer'
  }[riskLevel]

  return (
    <div className="space-y-6">
      <div>
        <label className="label">Distance to Nearest Transmission/Distribution Line (miles)</label>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min={0} max={20} step={0.1}
            value={data.gridDistanceMiles}
            onChange={e => update({ gridDistanceMiles: parseFloat(e.target.value) })}
            className="flex-1 accent-solar-500"
          />
          <span className="font-mono text-solar-400 w-16 text-right">{data.gridDistanceMiles} mi</span>
        </div>
        <p className={`text-xs mt-2 font-medium ${riskColor}`}>{riskLabel}</p>
      </div>

      <div>
        <label className="label">Zoning / Land Use</label>
        <select
          className="input-base"
          value={data.zoning || 'agricultural'}
          onChange={e => update({ zoning: e.target.value })}
        >
          <option value="agricultural">Agricultural</option>
          <option value="rural_residential">Rural Residential</option>
          <option value="commercial">Commercial / Industrial</option>
          <option value="brownfield">Brownfield / Contaminated</option>
          <option value="unknown">Unknown</option>
        </select>
        <p className="text-xs text-gray-600 mt-1">Agricultural and brownfield land typically permittable. Residential zoning may require variance.</p>
      </div>

      <div>
        <label className="label">Minimum Acceptable Lease Rate ($/acre/yr)</label>
        <input
          type="number"
          className="input-base"
          min={0} step={50}
          value={data.minAcceptableRate || ''}
          placeholder="Optional"
          onChange={e => update({ minAcceptableRate: parseFloat(e.target.value) || null })}
        />
        <p className="text-xs text-gray-600 mt-1">Used to check if offers meet your floor. Optional.</p>
      </div>

      {/* Summary of site */}
      <div className="card-elevated p-5 space-y-2">
        <p className="text-xs text-gray-500 uppercase tracking-wide mb-3">Site Summary</p>
        <div className="grid grid-cols-2 gap-y-2 text-sm">
          <span className="text-gray-500">Usable acres</span>
          <span className="font-mono text-gray-100">{data.usableAcres}</span>
          <span className="text-gray-500">Solar resource</span>
          <span className="font-mono text-solar-400">{data.capacityFactor ? `${(data.capacityFactor * 100).toFixed(1)}% CF` : '—'}</span>
          <span className="text-gray-500">Grid distance</span>
          <span className={`font-mono font-semibold ${riskColor}`}>{data.gridDistanceMiles} miles</span>
          <span className="text-gray-500">Zoning</span>
          <span className="font-mono text-gray-100 capitalize">{(data.zoning || 'agricultural').replace('_', ' ')}</span>
        </div>
      </div>
    </div>
  )
}
