import { useState } from 'react'
import { MapPin, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { geocodeAddress } from '../../../services/geocoding'
import { fetchPVWatts } from '../../../services/pvwatts'
import { SHADE_LEVELS } from '../../../constants/defaults'

export default function PropertyStep({ data, update }) {
  const [query, setQuery] = useState(data.locationQuery || '')
  const [status, setStatus] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')

  async function lookupLocation() {
    if (!query.trim()) return
    setStatus('loading')
    setErrorMsg('')
    try {
      const geo = await geocodeAddress(query)
      const pv  = await fetchPVWatts({ lat: geo.lat, lon: geo.lon })
      update({
        locationQuery: query,
        lat: geo.lat,
        lon: geo.lon,
        displayName: geo.displayName,
        capacityFactor: pv.capacityFactor,
        solradAnnual: pv.solradAnnual,
      })
      setStatus('done')
    } catch (e) {
      setErrorMsg(e.message)
      setStatus('error')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="label">Property Location</label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              className="input-base pl-8"
              placeholder="Address, city, county, or zip"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && lookupLocation()}
            />
          </div>
          <button className="btn-primary flex items-center gap-2" onClick={lookupLocation} disabled={status === 'loading'}>
            {status === 'loading' && <Loader2 size={14} className="animate-spin" />}
            Look Up
          </button>
        </div>
        {status === 'error' && (
          <p className="flex items-center gap-1.5 text-red-400 text-xs mt-2">
            <AlertCircle size={12} /> {errorMsg || 'Could not find address.'}
          </p>
        )}
        {status === 'done' && (
          <p className="flex items-center gap-1.5 text-solar-400 text-xs mt-2">
            <CheckCircle size={12} />
            Solar resource: <strong className="ml-1">{(data.capacityFactor * 100).toFixed(1)}% capacity factor</strong>
          </p>
        )}
      </div>

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
          <p className="text-xs text-gray-600 mt-1">Flat, open land — exclude wetlands, steep slopes</p>
        </div>
        <div>
          <label className="label">Shade Level</label>
          <select
            className="input-base"
            value={data.shadeLevel}
            onChange={e => update({ shadeLevel: e.target.value })}
          >
            {SHADE_LEVELS.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="label">Distance to Nearest Substation (miles)</label>
        <input
          type="number"
          className="input-base"
          min={0} step={0.1}
          value={data.gridDistanceMiles}
          onChange={e => update({ gridDistanceMiles: parseFloat(e.target.value) || 0 })}
        />
        <p className="text-xs text-gray-600 mt-1">
          &lt;1 mile: favorable · 1–5 miles: moderate cost · &gt;5 miles: significant cost
        </p>
      </div>
    </div>
  )
}
