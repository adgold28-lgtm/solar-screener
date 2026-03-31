export default async function handler(req, res) {
  const { lat, lon } = req.query
  if (!lat || !lon) return res.status(400).json({ error: 'lat and lon required' })

  const key = process.env.NREL_API_KEY
  const url = `https://developer.nrel.gov/api/utility_rates/v3.json?api_key=${key}&lat=${lat}&lon=${lon}`

  try {
    const r = await fetch(url)
    const data = await r.json()
    res.status(r.status).json(data)
  } catch (e) {
    res.status(500).json({ error: 'Utility rates request failed' })
  }
}
