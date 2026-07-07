/**
 * Aiproxy catalog provider_key icons.
 * Assets: src/assets/images/aiproxy-providers/ (lobe-icons *-color, MIT).
 * Regenerate: ./scripts/sync-aiproxy-provider-icons.sh
 */

function resolveAssetUrl (asset) {
  if (!asset) return ''
  if (typeof asset === 'string') return asset
  return asset.default || ''
}

const AIPROXY_PROVIDER_ICON_MAP = {
  // aliyun: resolveAssetUrl(require('@/assets/images/aiproxy-providers/aliyun.svg')), // uncommon
  anthropic: resolveAssetUrl(require('@/assets/images/aiproxy-providers/anthropic.svg')),
  // azure: resolveAssetUrl(require('@/assets/images/aiproxy-providers/azure.svg')), // uncommon
  // baidu: resolveAssetUrl(require('@/assets/images/aiproxy-providers/baidu.svg')), // uncommon
  // bedrock: resolveAssetUrl(require('@/assets/images/aiproxy-providers/bedrock.svg')), // uncommon
  // cerebras: resolveAssetUrl(require('@/assets/images/aiproxy-providers/cerebras.svg')), // uncommon
  // cohere: resolveAssetUrl(require('@/assets/images/aiproxy-providers/cohere.svg')), // uncommon
  deepseek: resolveAssetUrl(require('@/assets/images/aiproxy-providers/deepseek.svg')),
  // elevenlabs: resolveAssetUrl(require('@/assets/images/aiproxy-providers/elevenlabs.svg')), // uncommon
  // fireworks: resolveAssetUrl(require('@/assets/images/aiproxy-providers/fireworks.svg')), // uncommon
  gemini: resolveAssetUrl(require('@/assets/images/aiproxy-providers/gemini.svg')),
  groq: resolveAssetUrl(require('@/assets/images/aiproxy-providers/groq.svg')),
  huggingface: resolveAssetUrl(require('@/assets/images/aiproxy-providers/huggingface.svg')),
  mistral: resolveAssetUrl(require('@/assets/images/aiproxy-providers/mistral.svg')),
  // nebius: resolveAssetUrl(require('@/assets/images/aiproxy-providers/nebius.svg')), // uncommon
  ollama: resolveAssetUrl(require('@/assets/images/aiproxy-providers/ollama.svg')),
  openai: resolveAssetUrl(require('@/assets/images/aiproxy-providers/openai.svg')),
  openrouter: resolveAssetUrl(require('@/assets/images/aiproxy-providers/openrouter.svg')),
  // parasail: resolveAssetUrl(require('@/assets/images/aiproxy-providers/parasail.svg')), // uncommon
  // perplexity: resolveAssetUrl(require('@/assets/images/aiproxy-providers/perplexity.svg')), // uncommon
  // replicate: resolveAssetUrl(require('@/assets/images/aiproxy-providers/replicate.svg')), // uncommon
  // runway: resolveAssetUrl(require('@/assets/images/aiproxy-providers/runway.svg')), // uncommon
  sglang: resolveAssetUrl(require('@/assets/images/aiproxy-providers/sglang.svg')),
  // legacy alias until DB migration completes on all nodes
  sgl: resolveAssetUrl(require('@/assets/images/aiproxy-providers/sglang.svg')),
  // vertex: resolveAssetUrl(require('@/assets/images/aiproxy-providers/vertex.svg')), // uncommon
  vllm: resolveAssetUrl(require('@/assets/images/aiproxy-providers/vllm.svg')),
  // xai: resolveAssetUrl(require('@/assets/images/aiproxy-providers/xai.svg')), // uncommon
  xiaomi: resolveAssetUrl(require('@/assets/images/aiproxy-providers/xiaomi.svg')),
  custom: resolveAssetUrl(require('@/assets/images/aiproxy-providers/default.svg')),
}

const DEFAULT_ICON = resolveAssetUrl(require('@/assets/images/aiproxy-providers/default.svg'))

/** @param {string} providerKey */
export function isKnownAiproxyProviderKey (providerKey) {
  const key = String(providerKey || '').trim().toLowerCase()
  return Boolean(key && AIPROXY_PROVIDER_ICON_MAP[key])
}

/**
 * @param {string} providerKey
 * @returns {string} img src URL, or default icon URL when unknown
 */
export function getAiproxyProviderIcon (providerKey) {
  const key = String(providerKey || '').trim().toLowerCase()
  if (!key) return ''
  return AIPROXY_PROVIDER_ICON_MAP[key] || DEFAULT_ICON
}

/**
 * @param {string} providerKey
 * @returns {string}
 */
export function getAiproxyProviderIconLabel (providerKey) {
  const key = String(providerKey || '').trim()
  if (!key) return '?'
  return key.slice(0, 2).toUpperCase()
}
