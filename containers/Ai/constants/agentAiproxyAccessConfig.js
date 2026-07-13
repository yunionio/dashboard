/**
 * Unified Agent access fields for Cloudpods AI Gateway.
 * valueKey: baseUrl | apiKey | model
 */
export const AIPROXY_CLIENT_PROTOCOLS = ['openai', 'anthropic']

export const OPENAI_AIPROXY_ACCESS_FIELDS = [
  {
    id: 'baseUrl',
    labelKey: 'aice.llm_deployment.aiproxy_access_endpoint',
    valueKey: 'baseUrl',
    icon: 'link',
  },
  {
    id: 'apiKey',
    labelKey: 'aice.llm_deployment.agent_access.api_key',
    valueKey: 'apiKey',
    icon: 'key',
  },
  {
    id: 'model',
    labelKey: 'aice.llm_deployment.agent_access.model',
    valueKey: 'model',
    icon: 'tags',
  },
]

export const ANTHROPIC_AIPROXY_ACCESS_FIELDS = [
  {
    id: 'baseUrl',
    labelKey: 'aice.aiproxy.anthropic_base_url',
    valueKey: 'baseUrl',
    icon: 'link',
  },
  {
    id: 'apiKey',
    labelKey: 'aice.llm_deployment.agent_access.api_key',
    valueKey: 'apiKey',
    icon: 'key',
  },
  {
    id: 'model',
    labelKey: 'aice.llm_deployment.agent_access.model',
    valueKey: 'model',
    icon: 'tags',
  },
]

/** @deprecated use OPENAI_AIPROXY_ACCESS_FIELDS */
export const AGENT_AIPROXY_ACCESS_FIELDS = OPENAI_AIPROXY_ACCESS_FIELDS

export function getAgentAccessFields (protocol = 'openai') {
  return protocol === 'anthropic' ? ANTHROPIC_AIPROXY_ACCESS_FIELDS : OPENAI_AIPROXY_ACCESS_FIELDS
}

export function resolveAgentAccessFieldValue (valueKey, {
  protocol = 'openai',
  baseUrl = '',
  anthropicBaseUrl = '',
  apiKey = '',
  model = '',
} = {}) {
  switch (valueKey) {
    case 'baseUrl':
      return protocol === 'anthropic' ? anthropicBaseUrl : baseUrl
    case 'apiKey':
      return apiKey || '<API Key>'
    case 'model':
      return model || 'your-model'
    default:
      return ''
  }
}

/** Provider keys blocked from Anthropic Messages routing (matches backend registry). */
export const AIPROXY_ANTHROPIC_BLOCKED_PROVIDER_KEYS = new Set([
  'gemini',
  // 'cohere', // uncommon
  'baidu',
  'aliyun',
  'vllm',
])

export function supportsAnthropicMessagesRoute (providerKey, providerConfig) {
  const key = String(providerKey || '').trim().toLowerCase()
  if (!key) return false
  if (key === 'anthropic') return true
  const mode = String(providerConfig?.api_mode || 'openai').trim().toLowerCase()
  if (key === 'deepseek' && mode === 'anthropic') return true
  if (key === 'zhipu' && mode === 'anthropic') return true
  return !AIPROXY_ANTHROPIC_BLOCKED_PROVIDER_KEYS.has(key)
}

export function getProviderClientHintKey (providerKey, protocol = 'openai', providerConfig) {
  const key = String(providerKey || '').trim().toLowerCase()
  if (protocol === 'anthropic') {
    if (!key) return 'aice.aiproxy.provider_client_hint.anthropic_path'
    if (!supportsAnthropicMessagesRoute(key, providerConfig)) return null
    if (key === 'anthropic') return 'aice.aiproxy.provider_client_hint.anthropic'
    return 'aice.aiproxy.provider_client_hint.anthropic_path'
  }
  if (!key) return 'aice.aiproxy.provider_client_hint.openai_path'
  if (key === 'anthropic') return 'aice.aiproxy.provider_client_hint.anthropic_on_openai_path'
  return 'aice.aiproxy.provider_client_hint.openai_path'
}

export function isAnthropicProtocolBlocked (providerKey, providerConfig) {
  const key = String(providerKey || '').trim().toLowerCase()
  if (!key) return false
  return !supportsAnthropicMessagesRoute(key, providerConfig)
}
