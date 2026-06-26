/**
 * Unified Agent access fields for Cloudpods AI Gateway (OpenAI-compatible).
 * valueKey: baseUrl | apiKey | model
 */
export const AGENT_AIPROXY_ACCESS_FIELDS = [
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

export function resolveAgentAccessFieldValue (valueKey, { baseUrl = '', apiKey = '', model = '' } = {}) {
  switch (valueKey) {
    case 'baseUrl':
      return baseUrl
    case 'apiKey':
      return apiKey || '<API Key>'
    case 'model':
      return model || 'your-model'
    default:
      return ''
  }
}
