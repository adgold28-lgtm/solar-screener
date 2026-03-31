function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 3958.8
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function parseVoltage(raw) {
  if (!raw) return null
  // OSM stores voltage as "115000" or "115000;230000"
  const v = parseInt(raw.split(';')[0])
  if (isNaN(v)) return null
  return v
}

function voltageLabel(v) {
  if (!v) return null
  const kv = v / 1000
  if (kv >= 230) return `${kv}kV transmission`
  if (kv >= 69)  return `${kv}kV sub-transmission`
  return `${kv}kV distribution`
}

function voltageTier(v) {
  if (!v) return 'unknown'
  const kv = v / 1000
  if (kv >= 230) return 'transmission'
  if (kv >= 69)  return 'subtransmission'
  return 'distribution'
}

/**
 * Find nearest electric substations using OpenStreetMap Overpass API.
 * Returns up to 5 substations sorted by straight-line distance.
 */
export async function findNearestSubstations({ lat, lon, radiusMiles = 40 }) {
  const radiusMeters = Math.round(radiusMiles * 1609.34)
  const query = `
[out:json][timeout:20];
(
  node["power"="substation"](around:${radiusMeters},${lat},${lon});
  way["power"="substation"](around:${radiusMeters},${lat},${lon});
);
out center 30;
`
  const res = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: query,
  })
  if (!res.ok) throw new Error('Overpass API unavailable')
  const data = await res.json()

  const results = data.elements
    .map(el => {
      const slat = el.lat ?? el.center?.lat
      const slon = el.lon ?? el.center?.lon
      if (!slat || !slon) return null
      const voltage = parseVoltage(el.tags?.voltage)
      const dist = haversineDistance(lat, lon, slat, slon)
      return {
        name:         el.tags?.name || el.tags?.ref || 'Unnamed substation',
        operator:     el.tags?.operator || null,
        voltage,
        voltageLabel: voltageLabel(voltage),
        voltageTier:  voltageTier(voltage),
        distance:     Math.round(dist * 10) / 10,  // miles, 1 decimal
        lat: slat,
        lon: slon,
      }
    })
    .filter(Boolean)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 5)

  return results
}
