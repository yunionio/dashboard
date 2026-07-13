// Keep in sync with onecloud/pkg/apis/aiproxy/provider_defaults.go DefaultPublicBaseURL.
const DEFAULT_PUBLIC_BASE_URLS = {
  openai: 'https://api.openai.com',
  anthropic: 'https://api.anthropic.com',
  deepseek: 'https://api.deepseek.com',
  gemini: 'https://generativelanguage.googleapis.com/v1beta',
  groq: 'https://api.groq.com/openai',
  mistral: 'https://api.mistral.ai',
  openrouter: 'https://openrouter.ai/api',
  huggingface: 'https://router.huggingface.co',
  // aliyun: 'https://dashscope.aliyuncs.com/compatible-mode', // uncommon
  // baidu: 'https://qianfan.baidubce.com/v2', // uncommon
  xiaomi: 'https://api.xiaomimimo.com',
  moonshot: 'https://api.moonshot.cn',
  zhipu: 'https://open.bigmodel.cn/api/paas/v4',
}

const ZHIPU_ANTHROPIC_BASE_URL = 'https://open.bigmodel.cn/api/anthropic'

/** @param {string} providerKey */
export function hasDefaultPublicBaseURL (providerKey) {
  const key = String(providerKey || '').trim().toLowerCase()
  return Boolean(DEFAULT_PUBLIC_BASE_URLS[key])
}

/** @param {string} providerKey */
export function getDefaultPublicBaseURL (providerKey) {
  const key = String(providerKey || '').trim().toLowerCase()
  return DEFAULT_PUBLIC_BASE_URLS[key] || ''
}

/** Show API URL on builtin provider create when user must set a custom endpoint. */
export function shouldShowBuiltinBaseURL (providerKey) {
  const key = String(providerKey || '').trim().toLowerCase()
  if (!key) return false
  return !hasDefaultPublicBaseURL(key)
}

/**
 * Mirrors SAiProviderConfig.EffectiveBaseURL in Go.
 * @param {string} providerKey
 * @param {string} [apiMode]
 * @param {string} [baseURL]
 */
export function effectiveProviderBaseURL (providerKey, apiMode = 'openai', baseURL = '') {
  let base = String(baseURL || '').trim()
  if (!base) {
    base = getDefaultPublicBaseURL(providerKey)
  }
  if (!base) return ''
  const mode = String(apiMode || 'openai').trim().toLowerCase()
  const key = String(providerKey || '').trim().toLowerCase()
  if (mode !== 'anthropic') {
    return base
  }
  if (key === 'deepseek') {
    base = base.replace(/\/+$/, '')
    if (base.toLowerCase().endsWith('/anthropic')) {
      return base
    }
    return `${base}/anthropic`
  }
  if (key === 'zhipu') {
    base = base.replace(/\/+$/, '')
    if (base.toLowerCase().endsWith('/api/anthropic')) {
      return base
    }
    const openaiDefault = getDefaultPublicBaseURL('zhipu').replace(/\/+$/, '')
    if (!base || base.toLowerCase() === openaiDefault.toLowerCase()) {
      return ZHIPU_ANTHROPIC_BASE_URL
    }
    return base
  }
  return base
}
