/**
 * Fetch real solar production data from NREL PVWatts v8.
 * In dev, Vite proxies /api/pvwatts → developer.nrel.gov (key injected server-side).
 * In production, Vercel routes /api/pvwatts to /api/pvwatts.js serverless function.
 */
export async function fetchPVWatts({ lat, lon, systemCapacityKW = 1 }) {
  const params = new URLSearchParams({
    lat: lat.toFixed(5),
    lon: lon.toFixed(5),
    system_capacity: systemCapacityKW,
  })
  const res = await fetch(`/api/pvwatts?${params}`)
  if (!res.ok) throw new Error(`PVWatts error ${res.status}`)
  const data = await res.json()
  if (data.errors?.length) throw new Error(data.errors[0])

  const outputs = data.outputs
  return {
    capacityFactor:    outputs.capacity_factor / 100,  // convert % → decimal
    acAnnualKWh:       outputs.ac_annual,               // kWh/yr for 1 kW system
    solradAnnual:      outputs.solrad_annual,           // kWh/m²/day
    acMonthly:         outputs.ac_monthly,
    solradMonthly:     outputs.solrad_monthly,
  }
}
