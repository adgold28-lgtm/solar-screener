export function fmtCurrency(val, decimals = 0) {
  if (val == null || isNaN(val)) return '—'
  const abs = Math.abs(val)
  if (abs >= 1e9) return `$${(val / 1e9).toFixed(2)}B`
  if (abs >= 1e6) return `$${(val / 1e6).toFixed(2)}M`
  if (abs >= 1e3) return `$${(val / 1e3).toFixed(1)}K`
  return `$${val.toFixed(decimals)}`
}

export function fmtPct(val, decimals = 1) {
  if (val == null || isNaN(val)) return '—'
  return `${val.toFixed(decimals)}%`
}

export function fmtMWh(val) {
  if (val == null || isNaN(val)) return '—'
  if (val >= 1e6) return `${(val / 1e6).toFixed(2)} TWh`
  if (val >= 1e3) return `${(val / 1e3).toFixed(1)} GWh`
  return `${Math.round(val).toLocaleString()} MWh`
}

export function fmtMW(val, decimals = 2) {
  if (val == null || isNaN(val)) return '—'
  return `${val.toFixed(decimals)} MW`
}

export function fmtNumber(val, decimals = 0) {
  if (val == null || isNaN(val)) return '—'
  return val.toLocaleString(undefined, { maximumFractionDigits: decimals })
}

export function fmtDollarPerMWh(val) {
  if (val == null || isNaN(val)) return '—'
  return `$${val.toFixed(2)}/MWh`
}
