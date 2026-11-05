// Preserve metric scope and numeric precision. Do not turn every value into a percentage.
export function recordedMetrics(value, prefix = '', rows = []) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return rows
  for (const [key, item] of Object.entries(value)) {
    if (/sha256|hash|output|file|path/i.test(key)) continue
    const label = prefix ? `${prefix} / ${key.replaceAll('_', ' ')}` : key.replaceAll('_', ' ')
    if (typeof item === 'number' && Number.isFinite(item)) rows.push({ label, value: String(item) })
    else if (typeof item === 'boolean') rows.push({ label, value: item ? 'true' : 'false' })
    else if (typeof item === 'string' && item.length < 500) rows.push({ label, value: item })
    else if (item && typeof item === 'object') recordedMetrics(item, label, rows)
  }
  return rows
}
