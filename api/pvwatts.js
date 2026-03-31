export default async function handler(req, res) {
  const { lat, lon, system_capacity = 1 } = req.query
  if (!lat || !lon) return res.status(400).json({ error: 'lat and lon required' })

  const key = process.env.NREL_API_KEY
  const url = `https://developer.nrel.gov/api/pvwatts/v8.json?api_key=${key}&lat=${lat}&lon=${lon}&system_capacity=${system_capacity}&azimuth=180&tilt=20&array_type=1&module_type=0&losses=14`

  try {
    const r = await fetch(url)
    const data = await r.json()
    res.status(r.status).json(data)
  } catch (e) {
    res.status(500).json({ error: 'PVWatts request failed' })
  }
}
