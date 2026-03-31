import { useState } from 'react'
import { MapPin, Loader2, AlertCircle, CheckCircle } from 'lucide-react'
import { geocodeAddress } from '../../../services/geocoding'
import { fetchPVWatts } from '../../../services/pvwatts'
import { fetchUtilityRates } from '../../../services/utilityRates'
import { ACRES_PER_MW_OPTIONS } from '../../../constants/defaults'
import { fmtMW } from '../../../utils/formatters'

export default function SiteStep({ data, update }) {
  const [query, setQuery] = useState(data.locationQuery || '')
  const [status, setStatus] = useState(null) // null | 'loading' | 'done' | 'error'
  const [errorMsg, setErrorMsg] = useState('')

  const systemMW = data.usableAcres && data.acresPerMW
    ? Math.round((data.usableAcres / data.acresPerMW) * 100) / 100
    : null

  async function lookupLocation() {
    if (!query.trim()) return
    setStatus('loading')
    setErrorMsg('')
    try {
      const geo = await geocodeAddress(query)
      const [pv, rates] = await Promise.all([
        fetchPVWatts({ lat: geo.lat, lon: geo.lon }),
        fetchUtilityRates({ lat: geo.lat, lon: geo.lon }).catch(() => null),
      ])
      update({
        locationQuery: query,
        lat: geo.lat,
        lon: geo.lon,
        displayName: geo.displayName,
        capacityFactor: pv.capacityFactor,
        solradAnnual: pv.solradAnnual,
        utilityName: rates?.utilityName ?? null,
        commercialRatePerMWh: rates?.commercialPerMWh ?? null,
        // Pre-fill PPA price from commercial rate if available and not yet set
        ppaPricePerMWh: data.ppaPricePerMWh === 55 && rates?.commercialPerMWh
          ? Math.round(rates.commercialPerMWh * 0.85) // ~85% of retail = wholesale proxy
          : data.ppaPricePerMWh,
      })
      setStatus('done')
    } catch (e) {
      setErrorMsg(e.message)
      setStatus('error')
    }
  }

  return (
    <div className="space-y-6">
      {/* Address */}
      <div>
        <label className="label">Project Location</label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              className="input-base pl-8"
              placeholder="e.g. 123 Main St, Waterville, ME or county/zip"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && lookupLocation()}
            />
          </div>
          <button
            className="btn-primary flex items-center gap-2 whitespace-nowrap"
            onClick={lookupLocation}
            disabled={status === 'loading'}
          >
            {status === 'loading' && <Loader2 size={14} className="animate-spin" />}
            Analyze Site
          </button>
        </div>

        {status === 'error' && (
          <p className="flex items-center gap-1.5 text-red-400 text-xs mt-2">
            <AlertCircle size={12} /> {errorMsg || 'Could not geocode address. Try a city, state, or zip.'}
          </p>
        )}
        {status === 'done' && data.lat && (
          <div className="mt-2 space-y-1">
            <p className="flex items-center gap-1.5 text-solar-400 text-xs">
              <CheckCircle size={12} />
              {data.displayName?.split(',').slice(0, 3).join(',')}
            </p>
            <div className="flex flex-wrap gap-4 text-xs text-gray-400">
              <span>Capacity factor: <strong className="text-solar-400">{(data.capacityFactor * 100).toFixed(1)}%</strong></span>
              <span>Solar resource: <strong className="text-gray-200">{data.solradAnnual?.toFixed(2)} kWh/m²/day</strong></span>
              {data.utilityName && <span>Utility: <strong className="text-gray-200">{data.utilityName}</strong></span>}
              {data.commercialRatePerMWh && (
                <span>Commercial rate: <strong className="text-gray-200">${data.commercialRatePerMWh}/MWh</strong></span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Acreage */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Usable Acres</label>
          <input
            type="number"
            className="input-base"
            min={1}
            value={data.usableAcres}
            onChange={e => update({ usableAcres: parseFloat(e.target.value) || 0 })}
          />
          <p className="text-xs text-gray-600 mt-1">Net developable area (exclude setbacks, wetlands)</p>
        </div>
        <div>
          <label className="label">Acres per MW</label>
          <select
            className="input-base"
            value={data.acresPerMW}
            onChange={e => update({ acresPerMW: parseFloat(e.target.value) })}
          >
            {ACRES_PER_MW_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Preview */}
      {systemMW && (
        <div className="card-elevated p-4 flex items-center justify-between">
          <span className="text-sm text-gray-400">Estimated system capacity</span>
          <span className="text-xl font-bold font-mono text-solar-400">{fmtMW(systemMW)}</span>
        </div>
      )}
    </div>
  )
}
