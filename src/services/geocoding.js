export async function geocodeAddress(address) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(address)}`
  const res = await fetch(url, { headers: { 'Accept-Language': 'en' } })
  if (!res.ok) throw new Error('Geocoding request failed')
  const results = await res.json()
  if (!results.length) throw new Error('Address not found')
  const { lat, lon, display_name } = results[0]
  return { lat: parseFloat(lat), lon: parseFloat(lon), displayName: display_name }
}
