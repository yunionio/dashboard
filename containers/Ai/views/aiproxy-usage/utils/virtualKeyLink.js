export function isUsageVirtualKeyId (id) {
  const value = String(id || '').trim()
  return value !== '' && value !== 'unknown'
}
