/**
 * Fetch utility rate data from NREL Utility Rate Database.
 * Returns commercial and industrial rates in $/kWh.
 */
export async function fetchUtilityRates({ lat, lon }) {
  const params = new URLSearchParams({
    lat: lat.toFixed(5),
    lon: lon.toFixed(5),
  })
  const res = await fetch(`/api/utility-rates?${params}`)
  if (!res.ok) throw new Error(`Utility rates error ${res.status}`)
  const data = await res.json()
  if (data.error) throw new Error(data.error)

  const out = data.outputs
  return {
    utilityName:      out.utility_name,
    commercial:       out.commercial,  // $/kWh
    industrial:       out.industrial,  // $/kWh
    residential:      out.residential, // $/kWh
    // Convert to $/MWh for solar pricing context
    commercialPerMWh: out.commercial ? Math.round(out.commercial * 1000) : null,
    industrialPerMWh: out.industrial ? Math.round(out.industrial * 1000) : null,
  }
}
