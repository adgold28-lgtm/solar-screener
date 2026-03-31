import { useState } from 'react'
import { MapPin, Loader2, AlertCircle, CheckCircle, Info } from 'lucide-react'
import { geocodeAddress } from '../../../services/geocoding'
import { fetchPVWatts } from '../../../services/pvwatts'
import { fetchUtilityRates } from '../../../services/utilityRates'
import { ACRES_PER_MW_OPTIONS } from '../../../constants/defaults'
import { fmtMW } from '../../../utils/formatters'

// ISO/RTO regions by state (simplified)
const STATE_ISO = {
  CA: 'CAISO', OR: 'CAISO', WA: 'CAISO',
  TX: 'ERCOT',
  NY: 'NYISO',
  ME: 'ISO-NE', VT: 'ISO-NE', NH: 'ISO-NE', MA: 'ISO-NE', RI: 'ISO-NE', CT: 'ISO-NE',
  PA: 'PJM', NJ: 'PJM', MD: 'PJM', DE: 'PJM', VA: 'PJM', WV: 'PJM',
  OH: 'PJM', IN: 'PJM', MI: 'PJM', IL: 'PJM', KY: 'PJM', NC: 'PJM',
  MN: 'MISO', WI: 'MISO', IA: 'MISO', MO: 'MISO', ND: 'MISO', SD: 'MISO',
  NE: 'MISO', KS: 'MISO', OK: 'MISO', AR: 'MISO', LA: 'MISO', MS: 'MISO',
  TN: 'MISO', AL: 'MISO',
  GA: 'SOCO', FL: 'FRCC', SC: 'SOCO',
  AZ: 'WECC', NV: 'WECC', NM: 'WECC', UT: 'WECC', CO: 'WECC', ID: 'WECC', MT: 'WECC', WY: 'WECC',
}

// Interconnection queue context by ISO
const ISO_QUEUE_CONTEXT = {
  CAISO:  { wait: '3–5 yrs', notes: 'Cluster study process. High congestion in NorCal. CAISO GRID+ reform underway.' },
  ERCOT:  { wait: '2–4 yrs', notes: 'High solar penetration. West TX congestion common. Nodal pricing affects revenue.' },
  NYISO:  { wait: '4–6 yrs', notes: 'Large interconnection backlog. Article 10 permitting for >25 MW adds timeline.' },
  'ISO-NE': { wait: '3–5 yrs', notes: 'Forward Capacity Market provides revenue certainty. Queue has improved post-reform.' },
  PJM:    { wait: '4–6 yrs', notes: 'Largest queue in US. FERC Order 2023 reforms ongoing. DFAX cost allocation.' },
  MISO:   { wait: '3–5 yrs', notes: 'LRTP tx expansion underway. South region (LA/MS/AR) has significant solar growth.' },
  SOCO:   { wait: '2–4 yrs', notes: 'Vertically integrated utilities — negotiate directly with Georgia Power, Duke, etc.' },
  FRCC:   { wait: '2–3 yrs', notes: 'FPL and Duke dominate. High solar resource, strong offtake market.' },
  WECC:   { wait: '3–5 yrs', notes: 'Desert Southwest has best CFs in US. Transmission constraints in NV and AZ.' },
}

function getStateFromDisplay(displayName) {
  if (!displayName) return null
  const parts = displayName.split(',').map(s => s.trim())
  for (const part of parts.reverse()) {
    const match = Object.keys(STATE_ISO).find(s => part.startsWith(s) || part === s)
    if (match) return match
  }
  return null
}

function GridContext({ isoKey }) {
  const ctx = ISO_QUEUE_CONTEXT[isoKey]
  if (!ctx) return null
  return (
    <div className="bg-blue-500/5 border border-blue-500/15 rounded-lg p-3 mt-2">
      <div className="flex items-start gap-2">
        <Info size={13} className="text-blue-400 mt-0.5 shrink-0" />
        <div className="text-xs text-gray-400 space-y-0.5">
          <span className="text-blue-300 font-medium">{isoKey}</span>
          <span className="text-gray-500"> · Typical interconnection timeline: </span>
          <span className="text-gray-300">{ctx.wait}</span>
          <p className="text-gray-500 mt-1">{ctx.notes}</p>
        </div>
      </div>
    </div>
  )
}

export default function SiteStep({ data, update }) {
  const [query, setQuery] = useState(data.locationQuery || '')
  const [status, setStatus] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')

  const systemMW = data.usableAcres && data.acresPerMW
    ? Math.round((data.usableAcres / data.acresPerMW) * 100) / 100
    : null

  const detectedState = getStateFromDisplay(data.displayName)
  const isoKey = detectedState ? STATE_ISO[detectedState] : null

  // Grid risk assessment
  const gridDistance = data.gridDistanceMiles || 0
  const gridRisk = gridDistance < 1 ? 'low' : gridDistance < 3 ? 'moderate' : gridDistance < 6 ? 'high' : 'significant'
  const gridRiskColor = { low: 'text-solar-400', moderate: 'text-yellow-400', high: 'text-orange-400', significant: 'text-red-400' }[gridRisk]

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
        ppaPricePerMWh: data.ppaPricePerMWh === 55 && rates?.commercialPerMWh
          ? Math.round(rates.commercialPerMWh * 0.85)
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

        {/* ISO/RTO context */}
        {isoKey && <GridContext isoKey={isoKey} />}
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
          <p className="text-xs text-gray-600 mt-1">Net developable area after setbacks, wetlands, and slope exclusions</p>
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

      {/* Grid proximity */}
      <div>
        <label className="label">Distance to Nearest Substation / Interconnection Point (miles)</label>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min={0} max={20} step={0.5}
            value={gridDistance}
            onChange={e => update({ gridDistanceMiles: parseFloat(e.target.value), gridConnectionCostPerMW: estimateGridCost(parseFloat(e.target.value)) })}
            className="flex-1 accent-solar-500"
          />
          <span className={`font-mono font-semibold w-16 text-right text-sm ${gridRiskColor}`}>{gridDistance} mi</span>
        </div>
        <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
          {[
            { range: '< 1 mi', label: 'Low cost', note: 'Distribution tap, minimal study', color: 'border-solar-500/30 text-solar-400' },
            { range: '1–5 mi', label: 'Moderate', note: 'Line extension, upgrade study', color: 'border-yellow-500/30 text-yellow-400' },
            { range: '> 5 mi', label: 'High cost', note: 'Transmission-level work likely', color: 'border-red-500/30 text-red-400' },
          ].map(t => (
            <div key={t.range} className={`border rounded-lg p-2 ${t.color}`}>
              <p className="font-semibold">{t.range}</p>
              <p className="font-medium">{t.label}</p>
              <p className="text-gray-600 mt-0.5">{t.note}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Preview */}
      {systemMW && (
        <div className="card-elevated p-4 grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-1">System capacity</p>
            <p className="text-lg font-bold font-mono text-solar-400">{fmtMW(systemMW)}</p>
          </div>
          <div className="text-center border-x border-border">
            <p className="text-xs text-gray-500 mb-1">ISO/RTO</p>
            <p className="text-lg font-bold text-gray-200">{isoKey || '—'}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-1">Grid risk</p>
            <p className={`text-lg font-bold capitalize ${gridRiskColor}`}>{gridDistance > 0 ? gridRisk : '—'}</p>
          </div>
        </div>
      )}
    </div>
  )
}

function estimateGridCost(miles) {
  if (miles < 1)  return 100000
  if (miles < 3)  return 200000
  if (miles < 6)  return 400000
  return 750000
}
