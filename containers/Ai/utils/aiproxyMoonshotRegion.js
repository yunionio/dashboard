export const MOONSHOT_REGION_CN = 'cn'
export const MOONSHOT_REGION_GLOBAL = 'global'

export const MOONSHOT_REGION_BASE_URLS = {
  [MOONSHOT_REGION_CN]: 'https://api.moonshot.cn',
  [MOONSHOT_REGION_GLOBAL]: 'https://api.moonshot.ai',
}

/** @param {string} providerKey */
export function isMoonshotProviderKey (providerKey) {
  return String(providerKey || '').trim().toLowerCase() === 'moonshot'
}

/** @param {string} region */
export function getMoonshotBaseURL (region) {
  const key = String(region || '').trim().toLowerCase()
  return MOONSHOT_REGION_BASE_URLS[key] || MOONSHOT_REGION_BASE_URLS[MOONSHOT_REGION_CN]
}

/** @param {string} baseURL */
export function inferMoonshotRegion (baseURL) {
  const url = String(baseURL || '').trim().toLowerCase()
  if (url.includes('moonshot.ai')) {
    return MOONSHOT_REGION_GLOBAL
  }
  return MOONSHOT_REGION_CN
}

/** @param {import('vue').default} vm */
export function getMoonshotRegionOptions (vm) {
  return [
    { value: MOONSHOT_REGION_CN, label: vm.$t('aice.aiproxy.moonshot_region.cn') },
    { value: MOONSHOT_REGION_GLOBAL, label: vm.$t('aice.aiproxy.moonshot_region.global') },
  ]
}
