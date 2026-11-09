import { USAGE_CONFIG, USAGE_SOURCE_IMAGE, USAGE_SOURCE_IDENTITY, IDENTITY_USAGE_KEYS, getTargetRangeUsageKey } from '@Dashboard/constants'

const IMAGE_USAGE_KEY_PATTERN = /^(all\.|domain\.)?(guest_image|img|iso|imgiso)(\.|$)/

export function isImageUsageKey (key) {
  if (!key || key === 'null' || key.startsWith('usage.')) return false
  const cfg = USAGE_CONFIG[key]
  if (cfg?.usageSource === USAGE_SOURCE_IMAGE) return true
  return IMAGE_USAGE_KEY_PATTERN.test(key)
}

export function needsImageUsageRequest (...keys) {
  return keys.filter(Boolean).some(isImageUsageKey)
}

export function isIdentityUsageKey (key) {
  if (!key || key === 'null') return false
  const cfg = USAGE_CONFIG[key]
  if (cfg?.usageSource === USAGE_SOURCE_IDENTITY) return true
  return IDENTITY_USAGE_KEYS.includes(key)
}

export function needsIdentityUsageRequest (...keys) {
  return keys.filter(Boolean).some(isIdentityUsageKey)
}

export function isIdentityUsageAllowed (isAdminMode, usageKey) {
  if (!isIdentityUsageKey(usageKey)) return true
  return !!isAdminMode
}

export function collectUsageKeysForRequest (keys, scope, dataRangeScope) {
  const merged = new Set(keys.filter(Boolean))
  if (scope && dataRangeScope) {
    keys.filter(Boolean).forEach(key => {
      const { usageKey } = getTargetRangeUsageKey(key, scope, dataRangeScope)
      if (usageKey && usageKey !== 'null') {
        merged.add(usageKey)
      }
    })
  }
  return [...merged]
}
