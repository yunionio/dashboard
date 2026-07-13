export const DUAL_API_PROVIDER_KEYS = ['deepseek', 'zhipu', 'custom']

export const API_MODE_OPTIONS = [
  { id: 'openai', nameKey: 'aice.aiproxy.api_mode.openai' },
  { id: 'anthropic', nameKey: 'aice.aiproxy.api_mode.anthropic' },
]

/** @param {string} providerKey */
export function supportsDualAPIMode (providerKey) {
  const key = String(providerKey || '').trim().toLowerCase()
  return DUAL_API_PROVIDER_KEYS.includes(key)
}

/** @param {import('vue').default} vm */
export function getApiModeOptions (vm) {
  return API_MODE_OPTIONS.map(opt => ({
    value: opt.id,
    label: vm.$t(opt.nameKey),
  }))
}

/** @param {string} providerKey @param {string} apiMode */
export function suggestedBaseURLForApiMode (providerKey, apiMode, baseURL = '') {
  const key = String(providerKey || '').trim().toLowerCase()
  const mode = String(apiMode || 'openai').trim().toLowerCase()
  if (key === 'deepseek') {
    const root = String(baseURL || 'https://api.deepseek.com').trim().replace(/\/+$/, '')
    if (mode === 'anthropic') {
      return root.endsWith('/anthropic') ? root : `${root.replace(/\/anthropic$/, '')}/anthropic`
    }
    return root.replace(/\/anthropic$/, '') || 'https://api.deepseek.com'
  }
  if (key === 'zhipu') {
    const openaiDefault = 'https://open.bigmodel.cn/api/paas/v4'
    const root = String(baseURL || openaiDefault).trim().replace(/\/+$/, '')
    if (mode === 'anthropic') {
      if (root.toLowerCase().endsWith('/api/anthropic')) return root
      if (root.toLowerCase() === openaiDefault.toLowerCase()) {
        return 'https://open.bigmodel.cn/api/anthropic'
      }
      return root
    }
    if (root.toLowerCase().endsWith('/api/anthropic')) return openaiDefault
    return root || openaiDefault
  }
  return baseURL
}

/** @param {string} apiMode */
export function formatApiModeLabel (vm, apiMode) {
  const mode = String(apiMode || 'openai').trim().toLowerCase()
  const opt = API_MODE_OPTIONS.find(o => o.id === mode)
  return opt ? vm.$t(opt.nameKey) : mode || vm.$t('aice.aiproxy.api_mode.openai')
}
