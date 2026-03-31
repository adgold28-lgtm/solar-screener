import { useState } from 'react'
import { MapPin, Loader2, AlertCircle, CheckCircle, Zap, Info } from 'lucide-react'
import { geocodeAddress } from '../../../services/geocoding'
import { fetchPVWatts } from '../../../services/pvwatts'
import { fetchUtilityRates } from '../../../services/utilityRates'
import { findNearestSubstations } from '../../../services/substations'
import { ACRES_PER_MW_OPTIONS } from '../../../constants/defaults'
import { fmtMW } from '../../../utils/formatters'

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
  GA: 'SOCO', SC: 'SOCO',
  FL: 'FRCC',
  AZ: 'WECC', NV: 'WECC', NM: 'WECC', UT: 'WECC', CO: 'WECC',
  ID: 'WECC', MT: 'WECC', WY: 'WECC',
}

const ISO_CONTEXT = {
  CAISO:    { wait: '3–5 yrs', note: 'Cluster study process. High congestion in NorCal. CAISO GRID+ reform underway.' },
  ERCOT:    { wait: '2–4 yrs', note: 'High solar penetration. West TX congestion common. Nodal pricing affects merchant revenue.' },
  NYISO:    { wait: '4–6 yrs', note: 'Large interconnection backlog. Article 10 permitting for >25 MW adds timeline.' },
  'ISO-NE': { wait: '3–5 yrs', note: 'Forward Capacity Market provides revenue certainty. Queue has improved post-reform.' },
  PJM:      { wait: '4–6 yrs', note: 'Largest queue in the US. FERC Order 2023 reforms ongoing. Watch DFAX cost allocation.' },
  MISO:     { wait: '3–5 yrs', note: 'LRTP transmission expansion underway. South region has significant solar growth.' },
  SOCO:     { wait: '2–4 yrs', note: 'Vertically integrated — negotiate directly with Georgia Power, Duke, etc.' },
  FRCC:     { wait: '2–3 yrs', note: 'FPL and Duke dominate. Strong solar resource and active offtake market.' },
  WECC:     { wait: '3–5 yrs', note: 'Desert Southwest has best capacity factors in the US. Transmission constraints in NV/AZ.' },
}

const VOLTAGE_COLORS = {
  transmission:    'text-solar-400',
  subtransmission: 'text-blue-400',
  distribution:    'text-yellow-400',
  unknown:         'text-gray-400',
}

function estimateGridCostPerMW(miles) {
  if (miles < 1)  return 100000
  if (miles < 3)  return 200000
  if (miles < 6)  return 400000
  return 750000
}

function getStateFromDisplay(displayName) {
  if (!displayName) return null
  const parts = displayName.split(',').map(s => s.trim())
  for (const part of [...parts].reverse()) {
    const match = Object.keys(STATE_ISO).find(s => part === s || part.startsWith(s + ' '))
    if (match) return match
  }
  return null
}

export default function SiteStep({ data, update }) {
  const [query, setQuery] = useState(data.locationQuery || '')
  const [status, setStatus] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [manualDistance, setManualDistance] = useState(false)

  const systemMW = data.usableAcres && data.acresPerMW
    ? Math.round((data.usableAcres / data.acresPerMW) * 100) / 100
    : null

  const detectedState = getStateFromDisplay(data.displayName)
  const isoKey = detectedState ? STATE_ISO[detectedState] : null
  const isoCtx = isoKey ? ISO_CONTEXT[isoKey] : null

  const nearestSub = data.nearestSubstations?.[0]
  const gridDistance = data.gridDistanceMiles || 0
  const gridRisk = gridDistance < 1 ? 'Low' : gridDistance < 3 ? 'Moderate' : gridDistance < 6 ? 'High' : 'Significant'
  const gridRiskColor = gridDistance < 1 ? 'text-solar-400' : gridDistance < 3 ? 'text-yellow-400' : gridDistance < 6 ? 'text-orange-400' : 'text-red-400'

  async function lookupLocation() {
    if (!query.trim()) return
    setStatus('loading')
    setErrorMsg('')
    try {
      const geo = await geocodeAddress(query)
      const [pv, rates, subs] = await Promise.all([
        fetchPVWatts({ lat: geo.lat, lon: geo.lon }),
        fetchUtilityRates({ lat: geo.lat, lon: geo.lon }).catch(() => null),
        findNearestSubstations({ lat: geo.lat, lon: geo.lon }).catch(() => []),
      ])

      const nearest = subs[0]
      const autoDistance = nearest ? nearest.distance : data.gridDistanceMiles

      update({
        locationQuery:         query,
        lat:                   geo.lat,
        lon:                   geo.lon,
        displayName:           geo.displayName,
        capacityFactor:        pv.capacityFactor,
        solradAnnual:          pv.solradAnnual,
        utilityName:           rates?.utilityName ?? null,
        commercialRatePerMWh:  rates?.commercialPerMWh ?? null,
        nearestSubstations:    subs,
        gridDistanceMiles:     autoDistance,
        gridConnectionCostPerMW: estimateGridCostPerMW(autoDistance),
        ppaPricePerMWh:        data.ppaPricePerMWh === 55 && rates?.commercialPerMWh
          ? Math.round(rates.commercialPerMWh * 0.85)
          : data.ppaPricePerMWh,
      })
      setManualDistance(false)
      setStatus('done')
    } catch (e) {
      setErrorMsg(e.message)
      setStatus('error')
    }
  }

  return (
    <div className="space-y-6">

      {/* Address lookup */}
      <div>
        <label className="label">Project Location</label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              className="input-base pl-8"
              placeholder="Address, county, or zip code"
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
            <AlertCircle size={12} /> {errorMsg || 'Could not find address. Try a city, state, or zip.'}
          </p>
        )}

        {/* Location confirmed */}
        {data.lat && (
          <div className="mt-3 space-y-3">
            <p className="flex items-center gap-1.5 text-solar-400 text-xs">
              <CheckCircle size={12} />
              {data.displayName?.split(',').slice(0, 3).join(',')}
            </p>

            {/* Data pills */}
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'Capacity factor', value: `${(data.capacityFactor * 100).toFixed(1)}%` },
                { label: 'Solar resource', value: `${data.solradAnnual?.toFixed(2)} kWh/m²/day` },
                data.utilityName && { label: 'Utility', value: data.utilityName },
                data.commercialRatePerMWh && { label: 'Commercial rate', value: `$${data.commercialRatePerMWh}/MWh` },
                isoKey && { label: 'ISO/RTO', value: isoKey },
              ].filter(Boolean).map(p => (
                <span key={p.label} className="text-xs bg-bg-elevated border border-border rounded-full px-2.5 py-1 text-gray-300">
                  {p.label}: <strong className="text-gray-100">{p.value}</strong>
                </span>
              ))}
            </div>

            {/* ISO context */}
            {isoCtx && (
              <div className="bg-bg-surface border border-border rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <Info size={13} className="text-gray-500 mt-0.5 shrink-0" />
                  <div className="text-xs text-gray-500 leading-relaxed">
                    <span className="text-gray-300 font-medium">{isoKey}</span>
                    {' · '}Typical interconnection timeline: <span className="text-gray-300">{isoCtx.wait}</span>
                    {' · '}{isoCtx.note}
                  </div>
                </div>
              </div>
            )}

            {/* Nearest substations */}
            {data.nearestSubstations?.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Nearby substations (from OpenStreetMap)</p>
                {data.nearestSubstations.slice(0, 3).map((sub, i) => (
                  <div
                    key={i}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-colors cursor-pointer ${
                      data.gridDistanceMiles === sub.distance && !manualDistance
                        ? 'border-solar-500/40 bg-solar-500/5'
                        : 'border-border bg-bg-surface hover:border-gray-600'
                    }`}
                    onClick={() => {
                      update({
                        gridDistanceMiles: sub.distance,
                        gridConnectionCostPerMW: estimateGridCostPerMW(sub.distance),
                      })
                      setManualDistance(false)
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <Zap size={13} className={VOLTAGE_COLORS[sub.voltageTier]} />
                      <div>
                        <p className="text-xs font-medium text-gray-200">{sub.name}</p>
                        {sub.operator && <p className="text-xs text-gray-500">{sub.operator}</p>}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-mono font-semibold text-gray-200">{sub.distance} mi</p>
                      {sub.voltageLabel && (
                        <p className={`text-xs ${VOLTAGE_COLORS[sub.voltageTier]}`}>{sub.voltageLabel}</p>
                      )}
                    </div>
                  </div>
                ))}
                <p className="text-xs text-gray-600">
                  Straight-line distances. Actual wire run is typically 20–40% longer. Click a substation to use its distance.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Grid distance — manual override */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="label mb-0">
            Grid Distance
            {!manualDistance && nearestSub && (
              <span className="ml-2 text-xs text-solar-400 font-normal normal-case tracking-normal">
                auto-filled from nearest substation
              </span>
            )}
          </label>
          <button
            className="text-xs text-gray-500 hover:text-gray-300"
            onClick={() => setManualDistance(v => !v)}
          >
            {manualDistance ? 'Use substation lookup' : 'Enter manually'}
          </button>
        </div>

        {manualDistance ? (
          <div className="flex items-center gap-4">
            <input
              type="range"
              min={0} max={20} step={0.5}
              value={gridDistance}
              onChange={e => {
                const d = parseFloat(e.target.value)
                update({ gridDistanceMiles: d, gridConnectionCostPerMW: estimateGridCostPerMW(d) })
              }}
              className="flex-1 accent-solar-500"
            />
            <span className={`font-mono font-semibold w-16 text-right text-sm ${gridRiskColor}`}>
              {gridDistance} mi
            </span>
          </div>
        ) : (
          <div className="card-elevated p-3 flex items-center justify-between">
            <span className={`text-sm font-mono font-bold ${gridRiskColor}`}>{gridDistance} miles</span>
            <span className={`text-xs font-medium ${gridRiskColor}`}>
              {gridRisk} interconnection risk
            </span>
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
          <p className="text-xs text-gray-600 mt-1">
            Net developable area after setbacks, wetlands, and slope exclusions
          </p>
        </div>
        <div>
          <label className="label">Array Configuration</label>
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

      {/* Summary card */}
      {systemMW && (
        <div className="card-elevated p-4 grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs text-gray-500 mb-1">System capacity</p>
            <p className="text-lg font-bold font-mono text-solar-400">{fmtMW(systemMW)}</p>
          </div>
          <div className="border-x border-border">
            <p className="text-xs text-gray-500 mb-1">ISO/RTO</p>
            <p className="text-lg font-bold text-gray-200">{isoKey || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Grid risk</p>
            <p className={`text-lg font-bold ${gridRiskColor}`}>{gridDistance > 0 ? gridRisk : '—'}</p>
          </div>
        </div>
      )}
    </div>
  )
}
